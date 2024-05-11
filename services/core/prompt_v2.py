import copy
import json
import os
import re
import sys
import time
from collections import deque
from logging import Logger
from turtle import st

import apprise
import json_repair
import litellm
import pandas
from core.common.postgresql import PostgresDB
from core.config import (APPRISE_EMAIL_URL, SENDGRID_API_KEY, api_key, db, env,
                         gpt_model, llm_keys, sandbox)
from core.notification import (db_format_response, draft_format_response,
                               get_notification_message)
from litellm import completion, cost_per_token, token_counter
from modules.patent_module import (_get_claim, _get_invention,
                                   get_section_text, update_db_section_changes)
from modules.prior_art_module import (_get_access_token, _get_patents,
                                      _get_terms)
from modules.project_module import (_is_user_have_figures_data,
                                    _select_figure_data, _select_section_type)
from numpy import source
from rich import print
from rich.console import Console
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

logger = None

os.environ["OPENAI_API_KEY"] = api_key
if llm_keys is not None and len(llm_keys) > 0:
    for llm_name, llm_key in llm_keys.items():
        os.environ[llm_name] = llm_key

OPEN_AI_MODEL = gpt_model

console = Console()

def send_email(from_email,to_emails,email_subject,content):
    apobj = apprise.Apprise()

    # Add your notification service URL to Apprise
    apobj.add(APPRISE_EMAIL_URL)


    sg = SendGridAPIClient(api_key=SENDGRID_API_KEY)
    html_content = """
        <html>
        <body>
            <h1>Hello, this is an HTML email!</h1>
            <p>This is a paragraph in HTML.</p>
        </body>
        </html>
    """
    # Create a SendGrid email message
    message = Mail(
        from_email = from_email,
        to_emails = to_emails,
        subject = email_subject,
        plain_text_content = content,
        html_content=html_content
    )

    try:
        # Send the email using SendGrid
        response = sg.send(message)

        # Check if the email was sent successfully
        if response.status_code == 202:
            print('Email sent successfully!')
            
            # Notify via Apprise
            apobj.notify(
                body='Email sent successfully!',
                title='SendGrid Notification'
            )
        else:
            print(f'Failed to send email. Status code: {response.status_code}')

    except Exception as e:
        print(f'Error sending email: {e}')

# send_email('ashish.ranjan@dolcera.com','arju1936@gmail.com','html content','Hello Ashish')
CATCH_KEY_MAPPINGS = {
    "flowchart_common": "element_explanations",
    "flowchart_common_desc": "element_explanations_desc",
    "flowchart_claim_nums" : "claim_nums",
    "flowchart_decision_step":"flowchart_decision_step",
    "block_diagram_claim_nums":"claim_nums",
    "block_diagram_common":"element_explanations",
    "extra_diagram_common":"element_explanations",
    "component_nums":"flowchart_main_element_nums",
    "block_diagram_breif_descriptions":"breif_descriptions",
    "total_attributes_invention":"specific_attributes",
    "flowchart_decision_step": "decision_steps",
}

class PromptVersion():
    """
    Represents a version of prompts for a specific section.
    
    Attributes:
        db (PostgresDB): The PostgresDB object used for database operations.
        logger (Logger): The Logger object used for logging.
        prompts (dict): A dictionary to store the prompts for the section.
    """
    
    def __init__(self, db: PostgresDB, logger: Logger) -> None:
        """
        Initializes a new instance of the PromptVersion class.
        
        Args:
            db (PostgresDB): The PostgresDB object used for database operations.
            logger (Logger): The Logger object used for logging.
        """
        self.db = db
        self.logger = logger
        self.prompts = {}
        self.cache_inputs = {}

    def set_cache_inputs(self, inputs):
        self.cache_inputs = inputs

    def update_cache_inputs(self, new_inputs):
        new_mapping_inputs = {}
        if env == "dev":
            console.print(" Update Cache Variables", new_inputs.keys(), style="bold red")
            
        for skey, tkey in CATCH_KEY_MAPPINGS.items():
            if skey in new_inputs.keys():
                self.cache_inputs[tkey] = new_inputs[skey]
                new_mapping_inputs[tkey] = new_inputs[skey]
        self.cache_inputs.update(new_inputs)
        if env == "dev":
            console.print(" All Cache Variables", self.cache_inputs.keys(), style="bold red")
        return new_mapping_inputs
    
    def get_cache_inputs(self, field):
        return self.cache_inputs.get(field)
    
    def format_prompts_with_cache_inputs(self, prompts:list):
        return self.format_prompts(prompts, self.cache_inputs, is_ignore_warn=False)

    def _get_prompts_db(self, prompt_section: str) -> list:
        """
        Retrieves the prompts from the database for the specified section.
        
        Args:
            prompt_section (str): The name of the prompt section.
            
        Returns:
            list: A list of prompts for the specified section.
        """
        rows = self.db.execute({
            "query": "select_prompt_steps",
            "values": {
                'name': prompt_section,
                'is_selected': True
        }})
        return rows
    
    def get_prompt_requests(self, prompts:list) -> list:
        """
        Groups the prompts into request lists based on the 'is_output' flag.
        
        Args:
            prompts (list): A list of prompts.
            
        Returns:
            list: A list of prompt request lists.
        """
        prompt_requests = []
        temp_prompt_requests = []
        is_repeat = False
        for promptDetails in prompts:
            if promptDetails['repeat'] is not None and promptDetails['repeat'] == "Start":
                is_repeat = True
            elif promptDetails['repeat'] is not None and promptDetails['repeat'] == "End":
                is_repeat = False
            temp_prompt_requests.append(promptDetails)
            if promptDetails['is_output'] is True and is_repeat == False:
                prompt_requests.append(temp_prompt_requests)
                temp_prompt_requests = []
        if len(temp_prompt_requests) > 0:
            prompt_requests.append(temp_prompt_requests)
        return prompt_requests
    
    def format_prompts(self, prompts:list, inputs: dict, is_ignore_warn=True):
        """
        Formats the prompts by replacing input placeholders with actual input values.
        
        Args:
            prompts (list): A list of prompts.
            inputs (dict): A dictionary of input values.
            
        Returns:
            list: A list of formatted prompts.
        """
        fprompts = []
        for prompt_seq, promptDetails in enumerate(prompts):
            project_input_details = []
            template_input_details = []
            if promptDetails['inputs'] is not None:
                input_details = promptDetails['inputs']
                project_input_details = input_details.get('project', []) +  input_details.get('params', [])
                template_input_details = input_details.get('template', [])
            template_inputs = {}
            project_inputs = {}
            finstructions = promptDetails['instructions']
            if(finstructions is not None):
                finstructions = "\n".join(finstructions.splitlines())
            for key in project_input_details + template_input_details:
                if key in inputs:
                    template_inputs[key] = inputs[key]
                elif key not in ['flowchart_main_element_nums'] and key not in inputs:
                   pass           
            for key in project_input_details:
                if key in inputs:
                    project_inputs[key] = inputs[key]
                if promptDetails['is_input'] == True:
                    if(type(key) == dict):
                        key = json.dumps(key)
                    if project_inputs.get(key) is not None:
                        input_data = str(project_inputs[key])
                        is_markdown = False
                        try:
                            details = json.loads(project_inputs[key])
                            if type(details) == list:
                                input_data = get_markdown_output(key, details)
                                if env == "dev":
                                    print("Table Input", key, input_data)
                                    is_markdown = True
                        except:
                            pass
                        if env == "dev":
                            print("Input is markdown", key, is_markdown)
                        finstructions = finstructions.replace("{{"+str(key)+"}}", input_data)
                    else:
                        # if env == 'dev':
                        #     print("Missing field", key)
                        pass
            for key in template_input_details:
                if key in inputs:
                    template_inputs[key] = inputs[key]
                if promptDetails['is_input'] == True:
                    if template_inputs.get(key) is not None:
                        finstructions = finstructions.replace("{{"+str(key)+"}}", str(template_inputs[key]))
            promptDetails['instructions'] = finstructions
            promptDetails['is_last_seq'] = False
            if len(prompts) == (prompt_seq+1):
                promptDetails['is_last_seq'] = True
            fprompts.append(promptDetails)
        return fprompts
    
    def get_inputs(self, prompt_section:str):
        """
        Retrieves all the inputs required for the prompts in the specified section.
        
        Args:            prompt_section (str): The name of the prompt section.
            
        Returns:
            dict: A dictionary of all the inputs required for the prompts.
        """
        all_inputs = {}
        prompts = self._get_prompts_db(prompt_section=prompt_section)
        for promptDetails in prompts:
            #if promptDetails['repeat'] is not None:
            #    continue
            if promptDetails['inputs'] is not None:
                for source, fields in promptDetails['inputs'].items():
                    if source not in all_inputs:
                        all_inputs[source] = fields
                    else:
                        all_inputs[source] = list(set(all_inputs[source]+fields))
        return all_inputs
        
    def get_prompts(self, prompt_section:str, inputs: dict):
        """
        Retrieves and formats the prompts for the specified section.
        
        Args:
            prompt_section (str): The name of the prompt section.
            inputs (dict): A dictionary of input values.
            
        Returns:
            list: A list of prompts for the specified section.
        """
        self.prompts[prompt_section] = self._get_prompts_db(prompt_section=prompt_section)
        self.prompts[prompt_section] = self.format_prompts(self.prompts[prompt_section], inputs)
        self.prompts[prompt_section] = self.get_prompt_requests(self.prompts[prompt_section])
        return self.prompts[prompt_section]
    
        
    def save_prompts(self, prompt_section:str, prompt_version:str, prompts:list):
        """
        Saves the prompts for the specified section and version to the database.
        
        Args:
            prompt_section (str): The name of the prompt section.
            prompt_version (str): The version of the prompts.
            prompts (list): A list of prompts to be saved.
        """
        # save to db #TODO
        self.prompts[prompt_section] = self._get_prompts_db(prompt_section=prompt_section)

def is_selected_false(param: dict, project_data: dict):
    """
    Sets the 'is_selected' flag to False for the specified project and section type.
    
    Args:
        param (dict): A dictionary containing the project ID and section type.
        project_data (dict): A dictionary containing additional project data.
    """
    
    values = {
        "project_id" : param.get('project_id'),
        "is_selected": True
    }
    if('section_type' in project_data):
        values['section_type'] = project_data['section_type']
    else:
        values['section_type'] = param['section_type']
    number_of_selected_data  = db.execute({
        "query": "select_section_history_internal",
        "values": values
    })
    if(len(number_of_selected_data)>0):
        for selected_data in number_of_selected_data:
            db.execute({
                "query": "update_section_history",
                "values": {
                    "section_history_id" : selected_data['section_history_id'],
                    "is_selected" : False
                }
            })


def _update_project(param: dict, project_data: dict, step: int) -> dict:
    """
    Update the project with the given parameters and project data.

    Args:
        param (dict): The parameters for the update.
        project_data (dict): The existing project data.
        step (int): The step number.

    Returns:
        dict: The updated project ID.

    """
    fields = {"project_id": "project_id", 'invention': 'invention_title', 'novelty': 'novelty'}
    
    values = {db_field: param.get(llm_field) or project_data.get(llm_field) 
              for llm_field, db_field in fields.items() if param.get(llm_field) or project_data.get(llm_field)}
    
    values['is_error'] = 'Success'
    rows = db.execute({
        "query": "update_project",
        "values": values
    })
    return {'project_id': rows[0]['project_id']}

COMMON_SECTION_FIELDS = {
    "project_id": "project_id",
    "project_history_id": "project_history_id",
    "section_history_id": "section_history_id",
    "section_type": 'section_type',
    "claim_section_history_id": "claim_section_history_id",
    "is_error": "is_error"
}

COMMON_SECTION_HISTORY_FIELDS = {
    "prompt_step1": "prompt_step1",
    "response_step1": "response_step1",
    "prompt_step2": "prompt_step2",
    "response_step2": "response_step2",
    "prompt_step3": "prompt_step3",
    "response_step3": "response_step3"
}

def _update_sections(param:dict, project_data:dict):
    """
    Updates the sections of a project in the database.

    Args:
        param (dict): The parameters for the update.
        project_data (dict): The project data to be updated.

    Returns:
        section_rows: The updated section rows from the database.
    """
    values = {}
    fields = COMMON_SECTION_FIELDS.copy()
    fields.update({
        "regenerate_claim_section_history_id": "regenerate_claim_section_history_id"
    })
    values = {db_field: param.get(llm_field) or project_data.get(llm_field) 
              for llm_field, db_field in fields.items() if param.get(llm_field) or project_data.get(llm_field)}
    section_rows = db.execute({
        "query": "update_sections",
        "values": values
    })
    return section_rows

def claim_selected_more_than_one(project_id):
    number_of_selected_claim = db.execute(
        {
            "query": "select_section_history_internal",
            "values": {
                'project_id' : project_id,
                'is_selected' : True,
                'section_type' : 'Claims'
            }
        }
    )
    if len(number_of_selected_claim) > 0:
        latest_claim_section_history_id = number_of_selected_claim[0]['section_history_id']
    if len(number_of_selected_claim) > 1:
        for claim_data in number_of_selected_claim:
            db.execute(
                {
                    "query": "update_section_history",
                    "values": {
                        'section_history_id' : claim_data['section_history_id'],
                        'is_selected' : False
                    }
                }
            )
        db.execute(
                {
                    "query": "update_section_history",
                    "values": {
                        'section_history_id' : latest_claim_section_history_id,
                        'is_selected' : True
                    }
                }
            )

    

def _update_claim(param:dict, project_data:dict, step : int, is_insert_claim = False) -> dict: 
    """
    Updates the claim of a project in the database.

    Args:
        param (dict): The parameters for the update.
        project_data (dict): The project data to be updated.
        step (int): The step number in the process.

    Returns:
        dict: A dictionary containing the updated claim section history id, section history id and section id.
    """
    values = {}
    section_rows = {}
    fields = COMMON_SECTION_FIELDS.copy()
    fields.update(COMMON_SECTION_HISTORY_FIELDS.copy())
    fields.update({"entities": "entity_name",
                "specific_attributes": "specific_attributes",
                "entities_with_sequence": "entities_with_sequence",
                "entities_without_sequence": "entities_without_sequence",
                "entity_generalised_sequence": "entity_generalised_sequence",
                "entity_attributes": "entity_attributes",
                "entity_generalised":"generalized_entities",
                "invention_entity_actions" : "entity_action",
                "necessary_features_generalised": "necessary_features_generalised",
                "necessary_features":"necessary_features",
                "optional_features":"optional_features",
                "entity_alternatives":"alternative_entity_name",
                "entity_actions_rewritten":"entity_actions_rewritten",
                'claim_entities': 'claim_entities', 
                'claim_entity_actions':'claim_entity_actions', 
                'claim_specific_attributes':'claim_specific_attributes', 
                'entity_attribute_rewritten': 'entity_attribute_rewritten',
                "entity_generalized_rewritten":"entity_generalized_rewritten",
                "claims":"text",
                "prompt_instructions": "prompt",
                "redraft": "is_redraft",
                "claim_stats": "claim_stats",
                "claim_types": "claim_stats",
                "independent_claims" : "independent_claims",
                "grouped_entity_invention" : "grouped_entity_invention",
                "additional_entity_attributes_invention":"additional_entity_attributes_invention",
                "total_attributes_invention":"total_attributes_invention",
                "entity_attributes_rewritten" : "entity_attributes_rewritten",
                "missing_entity_attributes_rewritten":"missing_entity_attributes_rewritten",
                "total_entity_attributes_rewritten": "total_entity_attributes_rewritten"
            })
    
    values = {db_field: param.get(llm_field) or project_data.get(llm_field) 
              for llm_field, db_field in fields.items() if param.get(llm_field) or project_data.get(llm_field)}
    values['step_completed'] = step
    
    if 'text' in values and values['text'] is not None:
        values['is_error'] = 'Success'
    for key, value in values.items():
        if(type(value)==str):
            values[key] = value.replace(f'=={key}==', '')
    if param.get("prompt_section_history_id") is not None:
        values['prev_section_history_id'] = param['prompt_section_history_id']
        selected_rows = db.execute({"query": f"select_section_history_internal",
        "values": {
            'section_history_id' : param['prompt_section_history_id']
        }})
        if len(selected_rows) > 0:
            fields = ["entity_name","specific_attributes","entities_without_sequence","entities_with_sequence",
                      "entity_generalised_sequence","entity_attributes","generalized_entities","entity_action",
                      "necessary_features_generalised","necessary_features","optional_features","alternative_entity_name", "independent_claims", "grouped_entity_invention", "additional_entity_attributes_invention", "total_attributes_invention", "entity_attributes_rewritten", "missing_entity_attributes_rewritten", "additional_attributes_invention"]
            for field in fields:
                if values.get(field) is None and selected_rows[0].get(field) is not None:
                    values[field] = selected_rows[0][field]
    is_selected_false(param, project_data)
    values['is_selected'] = True
    section_history_rows = db.execute({
        "query": "update_section_history",
        "values": values
    })
    new_project_data = copy.deepcopy(project_data)
    new_project_data['section_history_id'] = section_history_rows[0]['section_history_id']
    if is_insert_claim == True:
        section_rows = _update_sections(param, new_project_data)
        claim_selected_more_than_one(values.get('project_id'))
    else: 
        data = {
            'project_id' : param.get('project_id'),
            'section_type' : 'Claims'
        }
        section_rows = [_select_section_type(data,is_results=True)]
    return {'claim_section_history_id': section_history_rows[0]['section_history_id'], 'section_history_id': section_history_rows[0]['section_history_id'],'section_id': section_rows[0]['section_id']}

def _update_section_history(param:dict, project_data:dict, step : int) -> dict:
    """
    Updates the section history of a project in the database.

    Args:
        param (dict): The parameters for the update.
        project_data (dict): The project data to be updated.
        step (int): The step number in the process.

    Returns:
        dict: A dictionary containing the updated section history id and section id.
    """
    values = {}       
    fields = COMMON_SECTION_FIELDS.copy()
    fields.update(COMMON_SECTION_HISTORY_FIELDS.copy())
    fields.update({"title":"text",
                "abstract":"text",
                "background_description":"text",
                "summary":"text",
                "technical_field":"text",
                "regenerate_claim":"text",
                "redraft": "is_redraft",
                "prompt_instructions":'prompt',
                "claim_stats": "claim_stats"
            })
    values = {db_field: param.get(llm_field) or project_data.get(llm_field) 
              for llm_field, db_field in fields.items() if param.get(llm_field) or project_data.get(llm_field)}
    values['step_completed'] = step
    is_selected_false(param, project_data)
    values['is_selected'] = True
    if values.get('text') is not None:
        values['text'] = values['text'].strip("####")
    section_history_rows = db.execute({
        "query": "update_section_history",
        "values": values
    })
    new_project_data = copy.deepcopy(project_data)
    new_project_data['section_history_id'] = section_history_rows[0]['section_history_id']
    section_rows = _update_sections(param, new_project_data)
    return {'section_history_id': section_history_rows[0]['section_history_id'], 'section_id': section_rows[0]['section_id']}


def _update_diagram(param:dict, project_data:dict, step : int) -> dict: 
    """
    Updates the diagram information in the project data.

    Args:
        param (dict): The parameter dictionary containing the updated diagram information.
        project_data (dict): The project data dictionary.
        step (int): The step number.

    Returns:
        dict: The updated section history ID and section ID.

    """
    values = {}      
    fields = COMMON_SECTION_FIELDS.copy()
    fields.update(COMMON_SECTION_HISTORY_FIELDS.copy())
    fields.update({"mermaids" : "mermaids",
                "breif_descriptions" : "breif_descriptions",
                "detailed_descriptions" : "detailed_descriptions",
                "steps": "flowchart_main_element_nums",
                "component_nums": "flowchart_main_element_nums",
                "mermaid": "main_mermaid",
                "breif_description": "main_breif_description",
                "is_dd_error":"is_dd_error",
                "flowchart_common":"element_explanations",
                "flowchart_common_desc": "element_explanations_desc",
                "block_diagram_common":"element_explanations",
                "diagram_available": "diagram_available",
                'component_references': 'user_figures',
                'references_explanation': 'references_explanation',
                'step_references': 'user_figures',
                'claim_step_actions': 'claim_step_actions',
                'flowchart_claim_nums': 'claim_nums',
                'extra_diagram_claim_nums': 'claim_nums',
                "extra_diagram_common":"element_explanations",
                "total_description":"detailed_description_figures",
                "extra_description_json" : "detailed_descriptions",
                "block_diagram_description_json" : "detailed_descriptions",
                "flowchart_description_json": "detailed_descriptions", 
                "extra_description" : "detailed_description_figures",
                "block_diagram_description" : "detailed_description_figures",
                "flowchart_description": "detailed_description_figures", 
                'deduplication_total_description': 'deduplication_description',
                'block_diagram_claim_nums': 'claim_nums',
                "flowchart_decision_step": "decision_steps",
                "additional_entities_to_describe":"additional_entities_to_describe",
                "missing_attributes_desc" : "missing_attributes_desc",
            }
        )
    
    values = {db_field: param.get(llm_field) or project_data.get(llm_field) 
              for llm_field, db_field in fields.items() if param.get(llm_field) or project_data.get(llm_field)}
    if 'section_type' in values:
        if values['section_type'] == 'extra_diagram' and 'element_explanations' in values and len(values['element_explanations']) > 0:
            values['is_error'] = 'Success'
        if values['section_type'] == 'total_detailed_description' and 'detailed_description_figures' in values and len(values['detailed_description_figures']) > 0:
            values['is_error'] = 'Success'
        if values['section_type'] in ['flowchart_diagram', 'block_diagram', 'extra_diagram', 'total_detailed_description'] and 'detailed_description_figures' in values and len(values['detailed_description_figures']) > 0:
            values['is_dd_error'] = 'Success'
        else:
            values['is_dd_error'] = 'Error'
    if 'element_explanations' in values and len(values['element_explanations']) == 0:
        values['element_explanations'] = f"No {values['section_type']}"
    values['step_completed'] = step
    is_selected_false(param, project_data)
    values['is_selected'] = True
    values['is_redraft'] = False
    check_insert_needed = True
    # if 'section_type' in values and values['section_type'] in ['flowchart_diagram', 'block_diagram', 'extra_diagram']:
    #     values['detailed_description_figures'] = 'not available'
    if values.get('mermaids') is not None and type(values.get('mermaids')) == list:
        values['mermaids'] = json.dumps(values['mermaids'])
    if values.get('main_mermaid') is not None and type(values.get('main_mermaid')) == list:
        values['main_mermaid'] = json.dumps(values['main_mermaid']) 
    elif values.get('main_mermaid') is not None and type(values.get('main_mermaid')) == dict:
        values['main_mermaid'] = json.dumps(values['main_mermaid'])
    elif values.get('detailed_descriptions') is not None and type(values.get('detailed_descriptions')) == dict:
        values['detailed_descriptions'] = json.dumps(values['detailed_descriptions'])
    if values.get('main_breif_description') is not None and type(values.get('main_breif_description')) == list:
        values['main_breif_description'] = json.dumps(values['main_breif_description']) 
    elif values.get('main_breif_description') is not None and type(values.get('main_breif_description')) == dict:
        values['main_breif_description'] = json.dumps(values['main_breif_description'])
    if 'section_history_id' not in values:
        check_insert_needed = True
    else:
        section_history_rows = db.execute({
            "query": "select_figures_section_history_internal",
            "values": values
        })
        if len(section_history_rows) > 0:
            check_insert_needed = False
    if check_insert_needed == True:
        section_history_rows = db.execute({
            "query": "update_figures_section_history",
            "values": values
        })
    else:
        if env == "dev":
            print("Skipping Insert")

    new_project_data = copy.deepcopy(project_data)
    new_project_data['section_history_id'] = section_history_rows[0]['section_history_id']
    section_rows = _update_sections(param, new_project_data)
    return {'section_history_id': section_history_rows[0]['section_history_id'], 'section_id': section_rows[0]['section_id']}


def get_markdown_output(key, data):
    try:
        try:
            data = json.loads(data)
        except:
            pass
        df = pandas.DataFrame(data)
        total_description = df.to_markdown(index=False)
        total_description = re.sub(r'\n{2,}', ' ', total_description)
        total_description = re.sub(r' +', ' ', total_description)
        total_description = re.sub(r'-{3,}', '---', total_description)
    except:
        total_description = json.dumps(data)
    if env=='dev':
        print("Markdown Output => ", key)
        print(total_description)
    return total_description

    
def _get_section_data(project_id:int, section_type:str, fields:list, prompt_section_history_id: int = None)-> dict: 
    """
    Retrieves the data for a specific section in a project.

    Args:
        project_id (int): The ID of the project.
        section_type (str): The type of section to retrieve data for.
        fields (list): The list of fields to include in the returned data.
        prompt_section_history_id (int, optional): The ID of the prompt section history. Defaults to None.

    Returns:
        dict: A dictionary containing the section data.

    """
    values = {}
    section_keys = {
        'Claims': 'claims',
        'Title': 'title',
        'background_Description': 'background_description',
        'Abstract': 'abstract',
        'technical_Field': 'technical_field',
        'summary': 'summary',
        'regenerate_claim': 'regenerate_claim'
    }
    section_keys_rev = {v:k for k,v in section_keys.items()}
    details = {}
    section_type = section_keys_rev[section_type]
    if project_id is not None:
        values = {
            "project_id" : project_id,
            "section_type":section_type
        }
    if prompt_section_history_id is None:
        values["is_selected"] =  True
    else:
        values["section_history_id"] =  prompt_section_history_id
    rows = db.execute({
        "query": "select_section_history_internal",
        "values" : values
    })
    if len(rows) > 0:
        details = {field: rows[0][field] for field in fields if field in rows[0]}
        if section_type in section_keys:
            details_key = section_keys[section_type]
            details[details_key] = rows[0]['text']
    return details

def _get_figure_section_data(project_id:int, section_type:str, fields:list)-> dict:
    """
    Retrieves the data for a figure section based on the project ID, section type, and specified fields.

    Parameters:
    project_id (int): The ID of the project.
    section_type (str): The type of the section.
    fields (list): A list of fields to retrieve from the section.

    Returns:
    dict: A dictionary containing the details of the figure section.
    """
    values = {
        "project_id" : project_id,
        "is_selected":True,
        "section_type":section_type
    }
    rows = db.execute({
        "query": "select_figures_section_history_internal",
        "values" : values
    })
    if len(rows) > 0:
        details =  {field: rows[0][field] for field in fields if field in rows[0]}
        return details
    return {}


def _get_figures_data(data)-> dict: 
    flag, figures = _is_user_have_figures_data(data)
    content = ""
    if flag == True:
        details = []
        for figure in figures:
            if figure.get('name','').strip() == "" or figure.get('summary','').strip() == "":
                continue
            details.append(f"[{figure['name']}] ####{figure['summary']}####")
        content = "\n\n".join(details)
        if content.strip() == "":
            content = "No Figures, Don't mention in the explanation"
    else:
        content = "No Figures, Don't mention in the explanation"
    return {"user_figures_text": content}

def claim_stat_order(data:dict)->dict:
    claim_stats_data = _get_section_data(data.get('project_id',None),'claims',['claim_stats'])
    other_claim_numbers = claim_stats_data.get('claim_stats', {}).get('other_claim_numbers', [])
    method_claim_numbers = claim_stats_data.get('claim_stats', {}).get('method_claim_numbers', [])
    system_claim_numbers = claim_stats_data.get('claim_stats', {}).get('system_claim_numbers', [])

    diagram_order = [('flowchart_diagram', method_claim_numbers),
                    ('block_diagram', system_claim_numbers),
                    ('extra_diagram', other_claim_numbers)]

    diagram_order.sort(key=lambda x: len(x[1]), reverse=True)
    total_description_filed = [diagram_type for diagram_type, _ in diagram_order]
    return total_description_filed
    
def _select_detailed_description_data(data):
    rows = db.execute({
            "query": "figures_based_on_claim",
            "values": {
                "claim_section_history_id": data['claim_section_history_id'],
            }
        })
    description_obj = []
    description_order = claim_stat_order(data)
    description_order_hash = {}
    for section_type in description_order:
        for figure_data in rows:
            if figure_data.get('section_type') == section_type and figure_data.get('detailed_descriptions'):
                if type(figure_data['detailed_descriptions']) == str:
                    try:
                        figure_data['detailed_descriptions'] = json.loads(figure_data['detailed_descriptions'])
                    except:
                        pass
                if section_type == 'flowchart_diagram':
                    missing_attributes_desc = figure_data['missing_attributes_desc']
                    new_description = {
                        "type": "flowchart",
                        "Explanation Step Missing" : missing_attributes_desc, 
                        "Step/System/Component/Element group num" : 'Explanation Step Missing'
                    }
                    figure_data['detailed_descriptions'].append(new_description)
                description_obj.extend(figure_data['detailed_descriptions'])
    # try:
    #     total_description = get_markdown_output("total_description", description_obj) 
    # except:
    #     total_description = json.dumps(description_obj)
    total_description_str = ""
    for description_details in description_obj:
        total_description_str += f"{description_details.get('description','')}\n\n".replace('"',"").strip(' ')
        if len(description_details.get('Explanation Step Missing',''))>0:
            total_description_str += f"{description_details.get('Explanation Step Missing','')}\n\n".replace('"',"").strip(' ')
    total_description = total_description_str
    return total_description
    
def _get_description_data(data) -> dict:
    flag, figures = _is_user_have_figures_data(data)
    content = ""
    description_text = _select_detailed_description_data(data)
    return {'total_description':description_text}

class Datasource():
    """
    A class representing a data source for a project.

    Attributes:
    - db (PostgresDB): The PostgresDB object used for database operations.
    - param (dict): A dictionary containing project parameters.
    - project_data (dict): A dictionary containing project-specific data.
    - pcs_access_token (str): The access token for the PCS API.

    Methods:
    - __init__(self, db: PostgresDB) -> None: Initializes the Datasource object.
    - set_project(self, param: dict): Sets the project parameters.
    - get_data(self, source: str, fields: list): Retrieves data from the specified source.
    - update_data(self, source: str, details: dict): Updates data in the specified source.
    - get_project_data(self, fields: list): Retrieves project-specific data.
    - update_project_data(self, details: dict): Updates project-specific data.
    - _build_template_data(self): Builds the template data from the database.
    - get_template_data(self, fields: list): Retrieves template data.
    - update_template_data(self, details: dict): Updates template data.
    - get_pcs_data(self, fields: list): Retrieves data from the PCS API.
    - get_entsrch_data(self, fields: list): Retrieves data from the EntSRCH API.
    - get_prompt_step(self, model_name: str, prompt_config: dict) -> (str, list): Retrieves the next prompt step.
    """
    
    def __init__(self, db: PostgresDB) -> None:
        """
        Initializes the Datasource object.

        Parameters:
        - db (PostgresDB): The PostgresDB object used for database operations.
        """
        self.db = db
        self.param = {}
        self.project_data = {}
        self.pcs_access_token = _get_access_token()
        
    def set_project(self, param: dict):
        """
        Sets the project parameters.

        Parameters:
        - param (dict): A dictionary containing project parameters.
        """
        self.param.update(param)

    def get_data(self, source: str, fields: list):
        """
        Retrieves data from the specified source.

        Parameters:
        - source (str): The source of the data.
        - fields (list): A list of fields to retrieve.

        Returns:
        - dict: A dictionary containing the retrieved data.
        """
        if source == 'params':
            return {field: self.param.get(field) for field in fields if field in self.param}
        elif source == 'project':
            return self.get_project_data(fields=fields)
        elif source == 'template':
            return self.get_template_data(fields=fields)
        elif source == 'pcs':
            return self.get_pcs_data(fields=fields)
    
    def update_data(self, source: str, details: dict):
        """
        Updates data in the specified source.

        Parameters:
        - source (str): The source of the data.
        - details (dict): A dictionary containing the details to update.
        """
        if source in ['pcs','project']:
            return self.update_project_data(details=details)
        elif source == 'template':
            return self.update_template_data(details=details)
     
    def get_project_data(self, fields: list):
        """
        Retrieves project-specific data.

        Parameters:
        - fields (list): A list of fields to retrieve.

        Returns:
        - dict: A dictionary containing the retrieved project-specific data.
        """
        self.project_data = {}
        finished_fields = []
        for field in fields:
            if field in finished_fields:
                continue
            ###############################
            if field in ['invention', 'novelty','claims_style']:
                self.project_data.update(_get_invention({}, self.param.get('project_id',None)))
                finished_fields.extend([x for x in ['invention', 'novelty'] if x in fields])
            elif field in ['title', 'claims', 'abstract', 'background_description', 'summary', 'technical_field']:
                self.project_data.update(_get_section_data(self.param.get('project_id',None),field,fields, self.param.get('prompt_section_history_id',None)))
                finished_fields.extend([x for x in ['title', 'claims', 'abstract', 'background_description', 'summary', 'technical_field'] if x in fields])
            elif field in ['generalized_entities', 'claim_stats', 'entity_action','alternative_entity_name', 'entity_actions_rewritten', 'entity_action', 'entity_generalized_rewritten', 'claim_entities', 'claim_entity_actions', 'claim_specific_attributes', 'entity_attribute_rewritten',"grouped_entity_invention", "additional_entity_attributes_invention", "total_attributes_invention", "entity_attributes_rewritten", "missing_entity_attributes_rewritten","total_entity_attributes_rewritten", "claim_types"]:
                if(self.project_data.get(field) is None):
                    self.project_data.update(_get_section_data(self.param.get('project_id',None),'claims',fields))
                    finished_fields.extend([x for x in ['generalized_entities','entity_action','alternative_entity_name', 'entity_actions_rewritten', 'entity_generalized_rewritten', 'claim_entities', 'claim_entity_actions', 'claim_specific_attributes', 'entity_attribute_rewritten',"grouped_entity_invention", "additional_entity_attributes_invention", "total_attributes_invention", "entity_attributes_rewritten", "missing_entity_attributes_rewritten","total_entity_attributes_rewritten"] if x in fields])
            elif field in ['flowchart_main_element_nums', 'flowchart_diagram', 'claim_step_actions','references_explanation','element_explanations', 'decision_steps' ,'claim_nums',"additional_entities_to_describe", "missing_attributes_desc", "deduplication_description",'element_explanations_desc']:
                if(self.project_data.get(field) is None):
                    self.project_data.update(_get_figure_section_data(self.param.get('project_id',None),self.param.get('section_type'),fields))
                    finished_fields.extend([x for x in ['flowchart_main_element_nums', 'flowchart_diagram','claim_step_actions','references_explanation', 'element_explanations', 'decision_steps', 'claim_nums'] if x in fields])
            elif field == 'user_figures_text':
                if(self.project_data.get(field) is None):
                    self.project_data.update(_get_figures_data(self.param))
                    finished_fields.extend([x for x in ['user_figures'] if x in fields])
            elif field == 'total_description':
                if(self.project_data.get(field) is None):
                    self.project_data.update(_get_description_data(self.param))
                    finished_fields.extend([x for x in ['detailed_description_figures'] if x in fields])
        return self.project_data
    
    def merge_fields_data(self, details, source_field, target_field, key_field, array_fields, str_fields, str_seprator, rename_fields, dedup=False, remove_fields=[]):
        """
        Merges data from the source field into the target field based on a key field.
        
        Args:
            details (dict): The details containing the source and target fields.
            source_field (str): The name of the source field.
            target_field (str): The name of the target field.
            key_field (str): The name of the key field used for merging.
            array_fields (dict): A dictionary mapping source array fields to target array fields.
            str_fields (dict): A dictionary mapping source string fields to target string fields.
            str_seprator (str): The separator used for joining string fields.
            rename_fields (dict): A dictionary mapping source field names to target field names for renaming.
            dedup (bool, optional): Whether to deduplicate the merged data. Defaults to False.
        
        Returns:
            list: A list of merged field details.
        """

        def hash_key(value):
            # If the value is a list, sort it and convert it to a string
            if type(value) == list:
                value = str(','.join(sorted(value)))
            # If the value is empty, return an empty string
            if not value:
                return ""
            # Convert the value to lowercase and remove leading and trailing spaces
            if type(value) == int:
                value = value
            else:
                value = str(value).lower().strip()
            return value

        # Initialize two empty dictionaries
        source_hash = {}
        target_hash = {}

        # If the source and target fields contain newline characters, keep only the first part
        if '\n\n' in details[source_field]:
            details[source_field] = details[source_field].split('\n\n')[0]
        if '\n\n' in details[target_field]:
            details[target_field] = details[target_field].split('\n\n')[0]

        # If the source and target fields are lists, keep them as they are
        # If they are strings, load them as JSON objects
        if type(details[source_field]) == list:
            details[source_field] = details[source_field]
        elif type(details[source_field]) == str:
            details[source_field] = json_repair.loads(details[source_field])
        if type(details[target_field]) == list:
            details[target_field] = details[target_field]
        elif type(details[target_field]) == str:
            details[target_field] = json_repair.loads(details[target_field])

        # Iterate over the details in the source and target fields
        # For each detail, check if the key field is a list or a single value
        # Hash each key and store the detail in the corresponding hash dictionary
        for field_details in details[source_field]:
            key_values = []
            if type(field_details[key_field]) == list:
                key_values = field_details[key_field]
            else:
                key_values = [field_details[key_field]] 
            for key in key_values:
                source_hash[hash_key(key)] = field_details
        for field_details in details[target_field]:
            if type(field_details[key_field]) == list:
                key_values = field_details[key_field]
            else:
                key_values = [field_details[key_field]] 
            for key in key_values:
                target_hash[hash_key(key)] = field_details

        # Initialize an empty list for the merged details
        merge_details = []

        # Iterate over the details in the target field
        for field_details in details[target_field]:
            if env=='dev':
                print("Before field", field_details)
            
            # Initialize empty lists for array fields and empty strings for string fields that are not already present in the detail
            for sarray_field, tarray_field in array_fields.items():
                if tarray_field not in field_details:
                    field_details[tarray_field] = []
            for sarray_field, tarray_field in str_fields.items():
                if tarray_field not in field_details:
                    field_details[tarray_field] = ""

            # Check if the key field is a list or a single value
            if type(field_details[key_field]) == list:
                key_values = field_details[key_field]
            else:
                key_values = [field_details[key_field]] 

            # Initialize empty dictionaries for array field values and string field values
            array_field_values = {}
            str_fields_values = {}

            # For each key, check if the hashed key exists in the source hash
            # If it does, retrieve the corresponding source detail and merge the array and string fields from the source detail into the target detail
            for key in key_values:
                
            
                if source_hash.get(hash_key(key), False) == False:
                    pass
                else:
                    source_details = source_hash.get(hash_key(key))
                    if env=='dev':
                        print("Found Source field", source_details)
                    for sarray_field, tarray_field in array_fields.items():
                        # Check if the target field is not in the array_field_values dictionary
                        if target_field not in array_field_values:
                            # If the target array field is not in the field details, initialize it as an empty list
                            if tarray_field not in field_details:
                                field_details[tarray_field] = []
                            # If the field detail is a string, split it into a list of strings
                            if type(field_details[tarray_field]) == str:
                                if ',' in field_details[tarray_field]:
                                    field_details[tarray_field] = [str(x).strip() for x in field_details[tarray_field].split(',')]
                                else:
                                    field_details[tarray_field] = [field_details[tarray_field]]
                            
                            # Do the same for the source array field
                            if source_details.get(sarray_field, None) == None:
                               source_details[sarray_field] = []     
                            if type(source_details[sarray_field]) == str:
                                if ',' in source_details[sarray_field]:
                                    source_details[sarray_field] = [str(x).strip() for x in source_details[sarray_field].split(',')]
                                else:
                                    source_details[sarray_field] = [source_details[sarray_field]]
                            
                            # If the target array field is not in array_field_values, add it
                            # If it is already in array_field_values, overwrite the existing value with the value from the field detail
                            if tarray_field not in array_field_values:
                                array_field_values[tarray_field] = field_details[tarray_field]
                            else:
                                array_field_values[tarray_field] = field_details[tarray_field]
                            # If the value in array_field_values is a string, convert it into a list
                            if type(array_field_values[tarray_field]) == str:
                                array_field_values[tarray_field] = [array_field_values[tarray_field]]

                        # If the value in array_field_values or the source detail is None, initialize it as an empty list
                        if tarray_field not in array_field_values or array_field_values[tarray_field] is None:
                            array_field_values[tarray_field] = []
                        if sarray_field not in source_details or source_details[sarray_field] is None:
                            source_details[sarray_field] = []    
                        # If the source detail is not a list, append it to array_field_values
                        # If it is a list, extend array_field_values with the source detail
                        if type(source_details[sarray_field]) != list:
                            array_field_values[tarray_field].append(source_details[sarray_field])
                        else:
                            array_field_values[tarray_field].extend(source_details[sarray_field])
                    # Iterate over each string field in the str_fields dictionary
                    for sarray_field, tarray_field in str_fields.items():
                        # Check if the target field is not in the str_fields_values dictionary
                        if target_field not in str_fields_values:
                            # If the target string field is not in the field details, initialize it as an empty string
                            if tarray_field not in field_details:
                                field_details[tarray_field] = ""
                            # If the target string field is not in str_fields_values, add it
                            # If it is already in str_fields_values, overwrite the existing value with the value from the field detail
                            if tarray_field not in str_fields_values:
                                str_fields_values[tarray_field] = field_details[tarray_field]
                            else:
                                str_fields_values[tarray_field] = [field_details[tarray_field]]
                            # If the value in str_fields_values is a string, convert it into a list
                            if type(str_fields_values[tarray_field]) == str:
                                str_fields_values[tarray_field] = [str_fields_values[tarray_field]]
                            # If the value in str_fields_values is None, initialize it as an empty list
                            if str_fields_values[tarray_field] is None:
                                str_fields_values[tarray_field] = []

                        # If the value in str_fields_values is None, initialize it as an empty list
                        if tarray_field not in source_details or str_fields_values[tarray_field] is None:
                            str_fields_values[tarray_field] = []
                        # If the source detail is None, initialize it as an empty list
                        if sarray_field not in source_details or source_details[sarray_field] is None: 
                            source_details[sarray_field] = []

                        # If the source detail is not a list, append it to str_fields_values
                        # If it is a list, extend str_fields_values with the source detail
                        if type(source_details[sarray_field]) != list:
                            str_fields_values[tarray_field].append(source_details[sarray_field])
                        else:
                            str_fields_values[tarray_field].extend(source_details[sarray_field])
            
            # Remove duplicates from the merged array and string fields
            for key,value in array_field_values.items():
                field_details[key] = list(set(value))
            for key,value in str_fields_values.items():
                field_details[key] = str_seprator.join(list(set(value)))
            
            # Rename certain fields in the merged detail according to the rename_fields dictionary
            mfield_details = copy.deepcopy(field_details)
            for sfield, tfield in rename_fields.items():
                mfield_details[tfield] = field_details[sfield]
                del mfield_details[sfield]
            for sfield in remove_fields:
                if sfield in mfield_details:
                    del mfield_details[sfield]
            # Append the modified detail to merge_details
            if env=='dev':
                print("After field", field_details)
            merge_details.append(mfield_details)

        # Return the merged details
        return merge_details
    
    def update_project_data(self, details: dict):
        """
        Updates project-specific data.

        Parameters:
        - details (dict): A dictionary containing the details to update.
        """
        new_fields = {}
        step_seq = details.get('step_seq', 1)
        if 'step_seq' in details:
            del details['step_seq']
        self.project_data.update(details)
        for field, value in details.items():
            tfields = [field]
            if field in  ['novelty', 'invention']:
                self.param.update(_update_project(self.param, self.project_data, step=step_seq))
            elif field in ['block_diagram_check'] and value is not None:
                json_value = json_repair.loads(value.strip("```|```|json"))
                if json_value.get("flag", "NO").lower() == "all entities have numerical identifiers":
                    return "End Sequence", new_fields
            elif field in ['additional_entities_flag'] and value is not None:
                json_value = json_repair.loads(value.strip("```|```|json"))
                if json_value.get("flag", True) == False:
                    return "End Sequence", new_fields
            elif field in ['additional_entities_flag']:
                json_value = json_repair.loads(value.strip("```|```|json"))
                if json_value.get("flag", True) == False:
                    return "End Sequence", new_fields
            elif field in ['claims','entities', 'entity_alternatives', 'entity_actions_rewritten', 'entity_generalized_rewritten', 'claim_stats', 'claim_entities', 'claim_entity_actions', 'claim_specific_attributes', 'specific_attributes', 'entity_attribute_rewritten', "grouped_entity_invention", "additional_entity_attributes_invention", "total_attributes_invention", "entity_attributes_rewritten", "missing_entity_attributes_rewritten",'claim_types', 'total_entity_attributes_rewritten','missing_entity_action_rewritten','additional_entity_attributes_invention','invention_entity_actions']:
                if value is not None and value != "":
                    def merge_mappings_by_sources(source_key1, source_key2, mappings, source_key3= None):
                        if source_key1 is not None:
                            source_data1 = self.project_data.get(source_key1)
                        source_data2 = self.project_data.get(source_key2)
                        if source_key3 is not None:
                            source_data3 = self.project_data.get(source_key3)
                        if source_key1 is not None:
                            source_data1 = json.loads(source_data1)    
                        source_data2 = json.loads(source_data2)
                        if source_key3 is not None:
                            source_data3 = json.loads(source_data3) 
                        mappings = json.loads(mappings)
                        if env == "dev":
                            print("Before merge as per key Mappings", mappings)
                        key_field1 = 'id_clm'
                        is_group_uniq = {}
                        extra_fields = []
                        for item in mappings:
                            id_clm = item.get('id_clm',"")
                            id_inv = item.get('id_inv',"")
                            extra_fields = list(item.keys()) + extra_fields
                        extra_fields = list(set(extra_fields) - set(['id_clm','id_inv']))
                        for item in mappings:
                            id_clm = item.get('id_clm',"")
                            id_inv = item.get('id_inv',"")
                            if is_group_uniq.get(id_clm, False) == False:
                                if type(id_inv) not in [list]:
                                    new_item = {"id_clm": id_clm, "id_inv": [id_inv]}
                                else:
                                    new_item = {"id_clm": id_clm, "id_inv": id_inv}
                                for field in extra_fields:
                                    new_item[field] = [item.get(field, "")]
                                is_group_uniq[id_clm] = new_item
                            else:
                                is_group_uniq[id_clm]['id_inv'] = list(set(is_group_uniq[id_clm]['id_inv'] + [id_inv]))
                                for field in extra_fields:
                                    is_group_uniq[id_clm][field] = list(set(is_group_uniq[id_clm][field] + [item.get(field, "")]))
                        mappings = list(is_group_uniq.values())
                        for item in mappings:
                            for field in extra_fields:
                                item[field] = ", ".join([str(x) for x in list(set(item[field]))])
                        if env == "dev":
                            print("After merge as per key Mappings", mappings)
                        source_dict1, source_dict2, source_dict3 = {}, {}, {}
                        if source_key1 is not None:
                            source_dict1 = {item['id_clm']: item for item in source_data1 if item.get('id_clm',None) is not None}
                        source_dict2 = {item['id_inv']: item for item in source_data2 if item.get('id_inv',None) is not None}
                        if source_key3 is not None:
                            source_dict3 = {item['id_inv']: item for item in source_data3 if item.get('id_inv',None) is not None}
                        merged_data = []
                        # fmappings = []
                        # for item in mappings:
                        #     id_clm = item.get('id_clm',None)
                        #     id_inv = item.get('id_inv',None)
                        #     id_invs = []
                        #     if id_inv is not None and type(id_inv) in [int]:
                        #         id_invs = [id_inv]
                        #     elif id_inv is not None and type(id_inv) in [str]:
                        #         if ',' in id_inv:
                        #             id_invs = [str(x).strip() for x in id_inv.split(',')]
                        #         else:
                        #             id_invs = [id_inv]
                        #     elif id_inv is not None and type(id_inv) == list:
                        #         id_invs = id_inv
                        #     for id_inv_temp in id_invs:
                        #         new_item = copy.deepcopy(item)
                        #         new_item['id_inv'] = id_inv_temp
                        #         fmappings.append(new_item)
                        #     if len(id_invs) == 0:
                        #         fmappings.append(item)
                        
                        def merge_all_invetions(id_invs, source_data, extra_source_data):
                            # all merge all id_invs for each key in source_data based on list and string type to keep unique based on respective values
                            all_invs_source_data = {}
                            for id_inv in id_invs:
                                source_details = source_data.get(id_inv, {})
                                extra_source_details = extra_source_data.get(id_inv, {})
                                source_details.update(extra_source_details)
                                for key, value in source_details.items():
                                    if key not in all_invs_source_data:
                                        all_invs_source_data[key] = []
                                    if type(value) == list:
                                        all_invs_source_data[key].extend(value)
                                    else:
                                        all_invs_source_data[key].append(value)
                            final_data = {}
                            final_data['id_inv'] = id_invs
                            for sfield, svalue in all_invs_source_data.items():
                                if type(svalue) == list:
                                    final_data[sfield] = list(set(svalue))
                                else:
                                    final_data[sfield] = list(set([svalue]))
                                if sfield in ['entity_action_invention','purpose','additional_attributes_invention','all_invention_attributes']:
                                    final_data[sfield] = ', '.join(final_data[sfield])
                            return final_data
                                    

                        for item in mappings:
                            id_clm = item.get('id_clm',None)
                            id_invs = item.get('id_inv',[])
                            merged_item = {}
                            merged_item.update(item)


                            if id_clm is not None and id_clm in source_dict1:
                                merged_item.update(**source_dict1[id_clm])
                            merged_item.update(**merge_all_invetions(id_invs, source_dict2, source_dict3))
                            merged_data.append(merged_item)
                        return merged_data
                    if field in ['invention_entity_actions']:
                        invention_entity_actions = json.loads(value)
                        grouped_entity_invention = []
                        for item in invention_entity_actions:
                            id_inv = item['id_inv']
                            entities_inv = item['entities_inv']
                            grouped_entity_invention.append({"id_inv": id_inv, "entities_inv": entities_inv})
                        self.project_data['grouped_entity_invention'] = value
                        self.project_data['grouped_entity_invention'] = json.dumps(grouped_entity_invention)
                        new_fields['grouped_entity_invention'] = json.dumps(grouped_entity_invention)
                    
                    if field in ['entity_actions_rewritten','missing_entity_action_rewritten']:#, 'missing_entity_actions']:
                        if field == 'entity_actions_rewritten':
                            merged_data = merge_mappings_by_sources('claim_entity_actions', 'invention_entity_actions', value)
                            for item in merged_data:
                                if 'inv_entities' in item:
                                    del item['inv_entities']
                        if field == 'missing_entity_action_rewritten':
                            merged_data = merge_mappings_by_sources('claim_entity_actions', 'missing_entity_actions', value, 'invention_entity_actions')
                            
                        self.project_data[field] = json.dumps(merged_data)
                        value = json.dumps(merged_data)
                        new_fields[field] = self.project_data[field]
                    elif field in ['entity_attributes_rewritten','missing_entity_attributes_rewritten']:
                        if field == 'entity_attributes_rewritten':
                            merged_data = merge_mappings_by_sources('claim_specific_attributes', 'specific_attributes', value)
                        if field == 'missing_entity_attributes_rewritten':
                            merged_data = merge_mappings_by_sources('claim_specific_attributes', 'additional_entity_attributes_rewritten', value, 'specific_attributes')
                        self.project_data[field] = json.dumps(merged_data)
                        value = json.dumps(merged_data)
                        new_fields[field] = self.project_data[field]
                    elif field in ['additional_entity_attributes_invention']:
                        inv_hash_additional_attributes_inv = {}
                        for item in json.loads(value):
                            id_inv = item.get('id_inv', None)
                            if id_inv is not None:
                                if id_inv not in inv_hash_additional_attributes_inv:
                                    inv_hash_additional_attributes_inv[id_inv] = []
                            inv_hash_additional_attributes_inv[id_inv].append(item['additional_attributes_inv'])
                        mvalue = []
                        for id_inv, additional_attributes_inv in inv_hash_additional_attributes_inv.items():
                            mvalue.append({"id_inv": id_inv, "additional_attributes_inv": ', '.join(list(set(additional_attributes_inv)))})
                        if env == "dev":
                            print("Additional Attributes Invention", mvalue)
                        value = mvalue
                        self.project_data[field] = json.dumps(mvalue)
                        value = json.dumps(mvalue)
                        new_fields[field] = self.project_data[field]
                    else:
                        pass
                        
                        
                    if field == 'missing_entity_attributes_rewritten':
                        source_field = "missing_entity_attributes_rewritten"
                        target_field = "entity_attributes_rewritten"
                        key_field = "id_clm"
                        array_fields = {"inv_entities":"inv_entities","id_inv":"id_inv"}
                        str_fields = {'additional_attributes_invention': 'additional_attributes_invention', 'all_invention_attributes': 'all_invention_attributes'}
                        rename_fields = {}
                        str_seprator = ' '
                        remove_fields = ['id_clm','id_inv','claim_numbers']
                        total_entity_attributes_rewritten = self.merge_fields_data(copy.deepcopy(self.project_data), source_field, target_field, key_field, array_fields, str_fields, str_seprator, rename_fields,True, remove_fields)
                        tfields.append("entity_attribute_rewritten")
                        new_fields['entity_attribute_rewritten'] = total_entity_attributes_rewritten
                        self.project_data['entity_attribute_rewritten'] =  json.dumps(total_entity_attributes_rewritten)
                        new_fields['total_entity_attributes_rewritten'] = total_entity_attributes_rewritten
                        self.project_data['total_entity_attributes_rewritten'] =  json.dumps(total_entity_attributes_rewritten)
                        if env == "dev":
                            print("Total Entity Attributes Rewritten", total_entity_attributes_rewritten)
                    elif field == 'missing_entity_action_rewritten':
                        self.project_data[field] = value
                        source_field = "missing_entity_action_rewritten"
                        target_field = "entity_actions_rewritten"
                        key_field = "id_clm"
                        array_fields = {'inv_entities':'inv_entities'}
                        str_fields = {'entity_action_invention':'entity_action_invention'}
                        rename_fields = {}
                        str_seprator = ', '
                        remove_fields = ['id_clm','id_inv']
                        total_entity_actions_rewritten = self.merge_fields_data(copy.deepcopy(self.project_data), source_field, target_field, key_field, array_fields, str_fields, str_seprator, rename_fields, False, remove_fields)
                        for item in total_entity_actions_rewritten:
                            if 'inv_entities' in item:
                                del item['inv_entities']
                        tfields.append("entity_actions_rewritten")
                        new_fields['entity_actions_rewritten'] = total_entity_actions_rewritten
                        self.project_data['entity_actions_rewritten'] =  json.dumps(total_entity_actions_rewritten)
                        if env == "dev":
                            print("Total Entity Actions Rewritten", total_entity_actions_rewritten)
                    elif field == 'additional_entity_attributes_invention':
                        source_field = "additional_entity_attributes_invention"
                        target_field = "specific_attributes_invention"
                        key_field = "id_inv"
                        array_fields = {}
                        str_fields = {'additional_attributes_inv':'specific_attributes_inv'}
                        rename_fields = {'specific_attributes_inv':'all_invention_attributes'}
                        str_seprator = ', '
                        remove_fields = []
                        total_attributes_invention = self.merge_fields_data(copy.deepcopy(self.project_data), source_field, target_field, key_field, array_fields, str_fields, str_seprator, rename_fields, False, remove_fields)
                        tfields.append("specific_attributes")
                        self.project_data['specific_attributes'] =  json.dumps(total_attributes_invention)
                        tfields.append("total_attributes_invention")
                        self.project_data['total_attributes_invention'] =  json.dumps(total_attributes_invention)
                        if env == "dev":
                            print("Total Attributes Invention", total_attributes_invention)
                        new_fields["total_attributes_invention"] = total_attributes_invention
                        new_fields["specific_attributes"] = total_attributes_invention

                project_data = copy.deepcopy(self.project_data)
                param = copy.deepcopy(self.param)
                param['section_history_id'] = self.param.get('claim_section_history_id')
                param['project_id'] = self.param.get('project_id')
                param['section_type'] = 'Claims'
                if field not in ['specific_attributes_invention']:
                   claim_details = _update_claim(param, project_data, step=step_seq, is_insert_claim = self.param['section_type'] == 'Claims')
                if field in ['claim_entities'] and self.param.get('section_type') == 'regenerate_claim' and value is not None:
                    project_data = copy.deepcopy(self.project_data)
                    param = copy.deepcopy(self.param)
                    project_data['regenerate_claim'] = "Not Generated"
                    project_data['is_error'] = "Error"
                    self.param.update(_update_section_history(param, project_data, step=step_seq))
                if field in ['claim_types'] and self.param.get('section_type') == 'regenerate_claim' and value is not None:
                    project_data = copy.deepcopy(self.project_data)
                    param = copy.deepcopy(self.param)
                    project_data['regenerate_claim'] = "Not Generated"
                    project_data['is_error'] = "Success"
                    self.param.update(_update_section_history(param, project_data, step=step_seq))
                    try:
                        claim_types = json_repair.loads(value)
                        project_data = copy.deepcopy(self.project_data)
                        param = copy.deepcopy(self.param)
                        for claim_type_name, claim_type_section_prefix in {'method':'flowchart','system':'block','other':'extra'}.items():
                            if claim_types.get(claim_type_name, False) == False:
                                temp_parm = copy.deepcopy(param)
                                temp_project_data = copy.deepcopy(project_data)
                                temp_parm['claim_section_history_id'] = self.param.get('claim_section_history_id')
                                temp_project_data['section_type'] = f"{claim_type_section_prefix}_diagram"
                                temp_parm['section_type'] = f"{claim_type_section_prefix}_diagram"
                                temp_parm['section_history_id'] = None
                                temp_project_data['diagram_available'] = False
                                reason_message = f"No {claim_type_section_prefix.title()} Diagram"
                                if claim_type_section_prefix in ['flowchart','extra']:
                                    temp_project_data[f'{claim_type_section_prefix}_common'] = reason_message
                                elif claim_type_section_prefix in ['block']:
                                    temp_project_data[f'{claim_type_section_prefix}_block_common'] = reason_message
                                temp_project_data['mermaid'] = {}
                                temp_project_data['is_error'] = 'Success'
                                temp_project_data['is_dd_error'] = 'Success'
                                temp_project_data['mermaids'] = []
                                _ = _update_diagram(temp_parm, temp_project_data, step=step_seq)
                    except Exception as e:
                        print("Error in claim_types", e)
                        pass
                elif self.param.get('section_type') == 'Claims':
                    self.param.update(claim_details)
                               
            elif field in ['title', 'abstract', 'background_description', 'summary', 'technical_field']:
                self.param.update(_update_section_history(self.param, self.project_data, step=step_seq))
            elif field in ['mermaids', 'mermaid', 'additional_entities_to_describe', 'breif_description', 'steps', 'flowchart_description', 'flowchart_common', 'block_diagram_common', 'breif_descriptions', 'block_diagram_description', 'component_references', 'step_references', 'claim_step_actions','references_explanation', 'flowchart_claim_nums', 'block_diagram_claim_nums', 'component_nums', "flowchart_decision_step","component_nums", "extra_diagram_claim_nums", "extra_diagram_common","additional_entities_to_describe","extra_description", "total_description", "deduplication_description","flowchart_common_desc"]:
                if value is not None:
                    if field == 'additional_entities_to_describe':
                        total_attributes_invention = self.get_project_data(['total_attributes_invention'])
                        total_attributes_invention = total_attributes_invention['total_attributes_invention']
                        if env == 'dev':
                            print("Total Attributes Invention", total_attributes_invention)
                        additional_entities_to_describe = json.loads(value)
                        if env == 'dev':
                            print("Additional Entities To Describe", additional_entities_to_describe)
                        
                        
                                                

                        # Parse the JSON string to get the list of inventions
                        inventions_list = json.loads(total_attributes_invention, strict=False)
                        # Create a dictionary to store the attributes for each entity
                        entity_attributes = {entity['entities_inv_addl']: [] for entity in additional_entities_to_describe}

                        # Iterate over the inventions list
                        for invention in inventions_list:
                            # Convert the string representation of the list back to a list
                            if isinstance(invention,dict) == False:
                                entities_list = json.loads(invention['inv_entities'])  # Use json.loads here and replace single quotes with double quotes
                            else:
                                entities_list = invention['inv_entities']
                            # For each entity in the current invention, add the attributes to the corresponding list in the dictionary
                            if isinstance(entities_list,str):
                                parts = entities_list.split(", ")
                                final_parts = []
                                temp_part = ""
                                for part in parts:
                                    if part.endswith(" source") or part.endswith(" regions"):
                                        if temp_part:
                                            final_parts.append(temp_part.strip())
                                            temp_part = ""
                                        final_parts.append(part)
                                    else:
                                        temp_part += part 
                                if temp_part:
                                    final_parts.append(temp_part.strip())
                                entities_list = final_parts

                            for entity in entities_list:
                                if entity in entity_attributes:
                                    entity_attributes[entity].append(invention['all_invention_attributes'].replace('\n',' '))

                        unique_strings = set()
                        final_descs = ""

                        for entity, attributes in entity_attributes.items():
                            for attribute in attributes:
                                unique_strings.add(attribute)
                            if len(attributes):
                                unique_strings.add(' \n\n ')
                        final_descs = '\n'.join(unique_strings)
                            
                        if env == 'dev':
                            print("missing_attributes_desc => ", final_descs)

                        
                        self.project_data['missing_attributes_desc'] =  final_descs
                    if field == 'flowchart_common':
                        steps = []
                        for step_details in json_repair.loads(value):
                            step_details = {key.lower().strip():value for key,value in step_details.items()}
                            if 'Step/Sub-Step type'.lower() in step_details:
                                if step_details['Step/Sub-Step type'.lower()].lower() == 'step':
                                    steps.append({"step_num": step_details['Step number'.lower()]})
                        self.project_data['steps'] = json.dumps(steps)
                    elif field == 'block_diagram_common':
                        steps = []
                        component_value = value
                        if type(component_value) == str:
                            component_value = json_repair.loads(value.strip())
                        def get_component_num(step_details, component_types):
                            keys = [
                                ('component type - system/component/sub-component', 'system/component number'),
                                ('component/sub-component type', 'component/sub-component number')
                            ]

                            for key1, key2 in keys:
                                if key1 in step_details and step_details[key1].lower() in component_types:
                                    if key2 in step_details:
                                        return {"component_num": step_details[key2]}
                            return None
                        for check_index in range(0,2):
                            for step_details in component_value:
                                step_details = {key.lower().strip(): value for key, value in step_details.items()}
                                component_num = get_component_num(step_details, ['system', 'component'])
                                if component_num is None and check_index > 0:
                                    component_num = get_component_num(step_details, ['system', 'component', 'sub-component'])
                                if component_num is not None:
                                    steps.append(component_num)
                            if len(steps) > 0:
                                break
                        self.project_data['component_nums'] = json.dumps(steps)
                    elif field == 'extra_diagram_common':
                        steps = []
                        for step_details in json_repair.loads(value):
                            step_details = {key.lower().strip():value for key,value in step_details.items()}
                            if 'component number'.lower() in step_details:
                                if '.' not in str(step_details['component number'.lower()]).lower():
                                    if 'component number'.lower() in step_details:
                                        steps.append({"component_num": step_details['component number'.lower()]})
                        self.project_data['component_nums'] = json.dumps(steps)
                    if field in ["extra_description", "flowchart_description", "block_diagram_description"]:
                        if field == "flowchart_description":
                            extra_flowchart_description = None
                            if '==Explanation Step Missing==' in value:
                                extra_flowchart_description = value.split('==Explanation Step Missing==')[1]
                                value = value.split('==Explanation Step Missing==')[0]  

                            flowchart_descriptions = []
                            pattern = r"==Explanation Step (\d+)==([\s\S]*?)(?===Explanation Step \d+==|$)"
                            matches = re.findall(pattern, value, re.DOTALL) 
                            explanation_steps = {}
                            for match in matches:
                                step_number = match[0]
                                step_text = match[1]
                                explanation_steps[step_number] = step_text
                                flowchart_descriptions.append({
                                    "type": "flowchart",
                                    "Step/System/Component/Element group num": f"Step {str(step_number)}",
                                    "description": str(step_text).strip().replace("\n", " ")
                                })
                            if extra_flowchart_description is not None:
                                flowchart_descriptions.append({
                                    "type": "flowchart",
                                    "Step/System/Component/Element group num": f"Attributes",
                                    "description": str(extra_flowchart_description).strip().replace("\n", " ")
                                })
                            self.project_data['flowchart_description_json'] = json.dumps(flowchart_descriptions)
                        elif field == "block_diagram_description":
                            extra_block_diagram_description = None
                            # if '==explanation_component Missing==' in value:
                            #     extra_flowchart_description = value.split('==Explanation Step Missing==')[1]
                            #     value = value.split('==Explanation Step Missing==')[0]  

                            block_diagram_descriptions = []
                            pattern = r"==explanation_component (\d+)==([\s\S]*?)(?===explanation_component \d+==|$)"
                            matches = re.findall(pattern, value, re.DOTALL) 
                            explanation_steps = {}
                            for match in matches:
                                component_number = match[0]
                                component_text = match[1]
                                explanation_steps[component_number] = component_text
                                block_diagram_descriptions.append({
                                    "type": "block_diagram",
                                    "Step/System/Component/Element group num": f"Step {str(component_number)}",
                                    "description": str(component_text).strip().replace("\n", " ")
                                })
                            # if extra_flowchart_description is not None:
                            #     block_diagram_descriptions.append({
                            #         "type": "flowchart",
                            #         "Step/System/Component/Element group num": f"Attributes",
                            #         "description": str(extra_flowchart_description).strip().replace("\n", " ")
                            #     })
                            self.project_data['block_diagram_description_json'] = json.dumps(block_diagram_descriptions)
                        elif field == "extra_description":
                            extra_description = []
                            # Adjusted pattern to match three equal signs and any text until the next occurrence of "==entities explanation" or end of string
                            pattern = r"==entities explanation (\d+)==([\s\S]*?)(?===entities explanation \d+==|$)"
                            matches = re.findall(pattern, value, re.DOTALL)  # re.DOTALL allows '.' to match newlines

                            explanation_steps = {}
                            for match in matches:
                                step_number = match[0]
                                step_text = match[1].strip()  # Strip to remove any leading/trailing whitespace
                                explanation_steps[step_number] = step_text
                                extra_description.append({
                                    "type": "extra_description",
                                    "Step/System/Component/Element group num": f"entity group {step_number}",
                                    "description": step_text.strip().replace("\n", " ")
                                })
                            self.project_data['extra_description_json'] = json.dumps(extra_description)
                    if field == 'mermaid':
                        #value = value.strip("```|```|mermaid")
                        value = json.loads(value)
                        self.project_data[field] = value
                    elif field == 'breif_descriptions' and self.param.get('section_type', None) in ['flowchart_diagram', 'block_diagram', "extra_diagram"]:
                        self.param['section_type'] = self.param.get('section_type', None)
                    self.param.update(_update_diagram(self.param, self.project_data, step=step_seq))
        return "Continue Sequence", new_fields

                     
    def _build_template_data(self):
        """
        Builds the template data from the database.

        Returns:
        - dict: A dictionary containing the template data.
        """
        templates = {}
        rows = self.db.execute({
            "query": "select_default_templates",
            "values": {}})
        for details in rows:
            templates[details['name']] = details['value']
        return templates
    
    def get_template_data(self, fields: list):
        """
        Retrieves template data.

        Parameters:
        - fields (list): A list of fields to retrieve.

        Returns:
        - dict: A dictionary containing the retrieved template data.
        """
        templates = self._build_template_data()
        templates = {k:v for k,v in templates.items() if k in fields}
        return templates
    
    def update_template_data(self, details: dict):
        """
        Updates template data.

        Parameters:
        - details (dict): A dictionary containing the details to update.
        """
        return "Continue Sequence", {}
    
    def get_pcs_data(self, fields: list):
        """
        Retrieves data from the PCS API.

        Parameters:
        - fields (list): A list of fields to retrieve.

        Returns:
        - dict: A dictionary containing the retrieved data.
        """
        for field in fields:
            if field == 'terms':
                terms, syns, semantics = _get_terms(self.project_data.get("invention"), access_token=self.pcs_access_token)
                self.project_data.update({'terms': ", ".join(terms.keys()),
                                        'pcs_terms': terms, 'pcs_syns': syns, 'pcs_semantics': semantics})
                return {'terms': ", ".join(terms.keys())}
    
    def get_entsrch_data(self, fields: list):
        """
        Retrieves data from the EntSRCH API.

        Parameters:
        - fields (list): A list of fields to retrieve.
        """
        pass

    def get_prompt_step(self, model_name: str, prompt_config: dict) -> (str, list):
        """
        Retrieves the next prompt step.

        Parameters:
        - model_name (str): The name of the model.
        - prompt_config (dict): A dictionary containing the prompt configuration.

        Returns:
        - str: The response from the prompt step.
        - list: A list of messages from the prompt step.
        """
        fields = {'project_id': 'project_id', 'section_history_id': 'section_history_id',
                  'section_type': 'section_type', 'prompt_seq_id': 'prompt_seq_id',
                  'repeat_seq_id': 'repeat_seq_id'}
        details = prompt_config
        details.update(self.param)
        details.update(self.project_data)
        if 'section_type' in self.param and self.param.get('section_type') == 'regenerate_claim' and self.param.get('section_history_id')==None:
            details.update({'section_history_id' : details.get('claim_section_history_id')})
        if details.get('section_history_id') is None and sandbox == False:
            return None, [], None
        values = {db_field: details.get(field) for field, db_field in fields.items() if field in details}
        if sandbox == True:
            values['project_id'] = 1
            values['section_history_id'] = 1
        values['is_error'] = 'Success'
        rows = self.db.execute({
            "query": "select_excute_prompt_steps",
            "values": values})
        if len(rows) > 0:
            return rows[0]['response'], rows[0]['messages'], rows[0]['execute_prompt_id']
        return None, [], None

    def create_unique_key(self, prompt_config: list):
        if self.param.get('section_history_id') is None:
            all_outputs = {}
            for each_request_details in prompt_config:
                for details in each_request_details:
                    if details.get('outputs') is not None:
                        empty_fields = {field: None  for source, sfields in details.get('outputs').items() for field in sfields  if source == 'project'}
                        all_outputs.update(empty_fields)
            all_outputs.update(self.param)
            all_outputs['step_seq'] = 0
            all_outputs['is_error'] = "Error"
            self.update_data(source = 'project', details = all_outputs)

    def update_prompt_step(self, model_name: str, max_tokens: int, prompt_config: dict, messages: list, output: str, is_error):
       
        fields = {'project_id': 'project_id', 'section_history_id': 'section_history_id',
                'section_type': 'section_type', 'output': 'response', 'api_status': 'is_error',
                'seq':'step', 'messages': 'messages', 'prompt_seq_id': 'prompt_seq_id',
                'repeat_seq_id': 'repeat_seq_id'}
        details = prompt_config 
        if details.get('section_history_id', None) is None:  
            self.project_data['is_error'] = "Error"
            section_history_vlaue = _update_diagram(self.param, self.project_data, step = 0)
            self.param.update(section_history_vlaue)
        details.update({'messages': json.dumps(messages), 'output': json.dumps(output), 'model_name': model_name, 'max_tokens': max_tokens})
        details.update(self.param)
        if 'section_type' in self.param and self.param.get('section_type') == 'regenerate_claim' and self.param.get('section_history_id')==None:
            details.update({'section_history_id' : details.get('claim_section_history_id')})
        details.update(self.project_data)
        if sandbox == True:
            if details.get('section_history_id', None) is None:
                if env == "dev":
                    print("Check why section_history_id is null?")
            details['project_id'] = 1
            details['section_history_id'] = 1
        values = {db_field: details.get(field) for field, db_field in fields.items() if field in details}
        values['is_error'] = is_error
        rows = self.db.execute({
            "query": "update_excute_prompt_steps",
            "values": values})
        if(len(rows)>0):
            return rows[0]['execute_prompt_id']
        else:
            return {}
        
        
class LLMOpenAI():
    """
    Class representing the LLMOpenAI model.

    Attributes:
        ds (Datasource): The datasource object.
        pv (PromptVersion): The prompt version object.
        output_details (dict): Details of the output.

    Methods:
        build_openai_messages: Builds the OpenAI messages.
        get_token_usage_and_cost: Calculates the token usage and cost.
        update_message_response: Updates the message response.
        update_status_field: Updates the status field.
        stream_request: Streams the request.
    """
    def __init__(self, ds: Datasource, pv: PromptVersion) -> None:
        self.ds = ds
        self.pv = pv
        self.output_details = {}
        self.project_id = self.ds.param.get('project_id', None)
    
    def build_openai_messages(self, messages):
        """
        Builds the OpenAI messages.

        Args:
            messages (list): The list of messages.

        Returns:
            tuple: A tuple containing the formatted messages and function definition.
        """
        fmessages = []
        fun_def = None
        for message in messages:
            fmessage = {}
            fmessage['role'] = message['role']
            if message['is_fun'] == True:
                try:
                    fun_def = {"type": "function", "function": json_repair.loads(message['fun_def'])}
                except Exception as e:
                    print(e)
                    pass
            fmessage['content'] = message['instructions']
            fmessages.append(fmessage)
        return fmessages, fun_def
    
    def get_token_usage_and_cost(self, model, messages, response_text, execution_time, prev_usage):
        """
        Calculates the token usage and cost.

        Args:
            model (str): The model name.
            messages (list): The list of messages.
            response_text (str): The response text.
            execution_time (int): The execution time.
            prev_usage (dict): The previous token usage.

        Returns:
            dict: The token usage and cost details.
        """
        prompt_text = ""
        for message in messages:
            if message.get("content") is not None:
                prompt_text += message.get("content")
            if message.get("function_call") is not None:
                prompt_text += json.dumps(message.get("function_call"))
        prompt_tokens = token_counter(model=model, text=prompt_text)
        completion_tokens = token_counter(model=model, text=response_text)
        prompt_tokens_cost_usd_dollar, completion_tokens_cost_usd_dollar = cost_per_token(model=model, prompt_tokens=prompt_tokens, completion_tokens=completion_tokens)
        total_tokens = prompt_tokens + completion_tokens
        total_cost_usd_dollars = prompt_tokens_cost_usd_dollar + completion_tokens_cost_usd_dollar
        usage = {
            'all_prompt_tokens': prompt_tokens + prev_usage.get('all_prompt_tokens', 0),
            'all_completion_tokens': completion_tokens + prev_usage.get('all_completion_tokens', 0),
            'all_total_tokens': total_tokens + prev_usage.get('all_total_tokens', 0),
            'all_prompt_cost': prompt_tokens_cost_usd_dollar + prev_usage.get('all_prompt_cost', 0),
            'all_completion_cost': completion_tokens_cost_usd_dollar + prev_usage.get('all_completion_cost', 0),
            'all_total_cost': total_cost_usd_dollars + prev_usage.get('all_total_cost', 0),
            'all_execution_time': execution_time + prev_usage.get('all_execution_time', 0),
        }
        usage.update({
            'prompt_tokens': prompt_tokens,
            'completion_tokens': completion_tokens,
            'total_tokens': total_tokens,
            'prompt_cost': prompt_tokens_cost_usd_dollar,
            'completion_cost': completion_tokens_cost_usd_dollar,
            'total_cost': total_cost_usd_dollars,
            'model': model,
            'execution_time': execution_time
        })
        return usage
    
    def update_message_response(self, prompt_section, messages, response):
        """
        Updates the message response.

        Args:
            prompt_section (str): The prompt section.
            messages (list): The list of messages.
            response (str): The response.

        Returns:
            dict: The updated prompt and response.
        """
        if prompt_section in ['flowchart_diagram','block_diagram']:
            return {"prompt_step2": messages, "response_step2": response}
        elif prompt_section in ['flowchart_description','block_diagram_description','regenerate_claim']:
            return {"prompt_step3": messages, "response_step3": response}
        return {"prompt_step1": messages, "response_step1": response}
        
    def update_status_field(self, prompt_section, status):
        """
        Updates the status field.

        Args:
            prompt_section (str): The prompt section.
            status (bool): The status.

        Returns:
            dict: The updated status field.
        """
        if prompt_section in ['flowchart_common', 'block_diagram_common','extra_diagram_common']:
            return_value =  {'diagram_available': True}
        elif prompt_section in ['flowchart_description', 'block_diagram_description', 'extra_description', 'block_diagram_description_with_figures','flowchart_description_with_figures', 'total_detailed_description']:
            return_value =  {'is_dd_error': status, 'diagram_available': True}
        elif prompt_section in ['block_diagram', 'flowchart_diagram']:
            return_value =  {'is_error': status, 'diagram_available': True}
        else:
            return_value = {'is_error': status}
        return return_value
        
    def track_llm_activity(self, usage: dict, meta: dict, prompt_config:dict):
        activity_data = {}
        activity_llm_fields = {  
            "project_id" : "project_id", 
            "name" : "section_type",
            "model": "gpt_model",
            "status": "api_status",
            "total_tokens": "total_tokens",
            "completion_tokens": "completion_tokens",
            "prompt_tokens": "prompt_tokens",
            "execution_time": "total_time",
            "prompt_cost": "prompt_cost",
            "completion_cost": "completion_cost",
            "total_cost": "total_cost",
            "llm_status": "long_message",
            "prompt_seq_id": "prompt_seq_id",
            "seq": "seq",
            "id": "llm_id"
        }
        activity_llm_data = {db_field: self.ds.param.get(field) or usage.get(field) or meta.get(field) or prompt_config.get(field)
                for field, db_field in activity_llm_fields.items() if self.ds.param.get(field) or usage.get(field)  or meta.get(field) or prompt_config.get(field)}
        try:
            db.execute({
                "query": "update_reports_openai_activity",
                "values": activity_llm_data
            })
        except Exception as e:
            pass
            
            
    def track_project_activity(self, meta: dict):
        try:
            activity_data = {}
            fields = {  
                "sysuser_id" : "sysuser_id",
                "project_id" : "project_id", 
                "section_type" : "section_type",
                "autoRetry":"is_retry",
                "status": "api_status",
                "section_history_id": "section_history_id"
            }
            activity_data = {db_field: self.ds.param.get(field) or self.ds.project_data.get(field) or meta.get(field)
                    for field, db_field in fields.items() if self.ds.param.get(field) or self.ds.project_data.get(field)  or meta.get(field)}
            activity_data['activity'] = f"{activity_data['section_type']} database drafted successful"
            if 'sysuser_id' in activity_data:
                email = db.execute({
                    "query": "select_sysusers",
                    "values": {
                        "sysuser_id": activity_data['sysuser_id']
                    }
                })
                activity_data['is_retry'] = "Api Request" if self.ds.param.get('autoRetry') is None or  self.ds.param.get('autoRetry') == False else "User Retry"
                email = email[0]['email'] if email and isinstance(email[0], dict) and 'email' in email[0] else ''
                domain_name = ''
                parts = email.split('@')
                if len(parts) == 2:
                    domain_name = parts[1]
                else:
                    domain_name = None
                activity_data['domain'] = domain_name
                
                db.execute({
                    "query": "update_reports_activity",
                    "values": activity_data
                })
            
        except Exception as e:
            print(f"failed to update activity table load all project: ", e)

    def print_messages(self, messages: list, config: dict):
        is_input_missing = False
        for message in messages:
            if env == "dev":
                is_input_missing = False
                content_message = message['content']
                regex = re.compile(r'{{(.*?)}}')
                matches = regex.findall(content_message)
                console.print("Message - "+message['role'], style="bold magenta", end=' ')
                console.print(content_message, style="bold blue")
                if len(matches) > 0:
                    console.print("Check Missing Input: " + ' ,'.join(matches), style="bold red")
                    is_input_missing = True
                    break
        if env == "dev":
            console.print("Model - " + str(config), style="bold magenta")  
        return is_input_missing
    
    def stream_request(self, prompt_requests: list, stream=True):
        """
        Streams the request.

        Args:
            prompt_requests (list): The list of prompt requests.

        Yields:
            str: The stream request.
        """
        outputs = {}
        SELECTED_AI_MODEL = ''
        self.output_details = {}
        messages = []
        response = {}
        source = {}
        prompt_config = {}
        repeat_prompt_requests = []        
        prompt_requests_queue = deque(prompt_requests)
        usage_cost = {}
        all_text = ""
        llm_status = ""
        response_id = None
        is_success = "Error"
        self.ds.create_unique_key(prompt_config=prompt_requests)

        while prompt_requests_queue:
            is_success = "Error"
            prompt_request = prompt_requests_queue.popleft()
            prompt_request = self.pv.format_prompts_with_cache_inputs(prompts=prompt_request)
            prompt_config = prompt_request[-1]
            first_prompt_config = prompt_request[0]

            # Check if the prompt is a stream request
            if prompt_config['is_stream'] == True:
                yield '@#@$@#@'

            # Print prompt in development environment
            if env == "dev":
                console.print("\n\n" + "*" * 5 + f"{prompt_config['prompt_seq_id']} Prompt: " + prompt_config['instructions'][0:100] + "... " + "*" * 5 + "\n", style="magenta")
            # Set repeat_seq_id if not present
            if prompt_config.get("repeat_seq_id") is None:
                prompt_config["repeat_seq_id"] = 0
            
            # Handle repeat end prompts
            if prompt_config['repeat'] == 'End':
                extra_inputs = {}
                inputs = {}
                for prompt_request_config in prompt_request:
                    if prompt_request_config.get('inputs') is not None:
                        for source, fields in prompt_request_config.get('inputs',{}).items():
                            if prompt_request_config['repeat'] == 'Start':
                                inputs = self.ds.get_data(source=source, fields=fields)
                            else:
                                for field, value in self.ds.get_data(source=source, fields=fields).items():
                                    extra_inputs[field] = value
                fprompt_request = copy.deepcopy(prompt_request)
                for i in range(len(fprompt_request)):
                    fprompt_request[i]['repeat'] = None
                    fprompt_request[i]['is_skip_delete'] = True
                repeat_prompt_requests.extend(fprompt_request)
                reversed_items = [(key, value) for key, value in list(inputs.items())]
                all_repeat_prompts = []
                repeat_index = 0
                if env == "dev":
                    print('reversed_items => \n' * 100 , reversed_items)
                for _, repeat_list in reversed_items:
                    if repeat_list is None or len(repeat_list) == 0:
                        is_success = "Error"
                        print(f"\nProject:{self.project_id} Cost {prompt_config['name']} - {prompt_config['version']} - Seq-{prompt_config['seq']} Repeat List is Empty")
                        prompt_requests_queue.clear()
                        break
                    for _, repeat_details in enumerate(repeat_list):
                        repeat_details.update(extra_inputs)
                        for i in range(len(repeat_prompt_requests)):
                            if repeat_prompt_requests[i].get("inputs") is None or repeat_prompt_requests[i]['inputs'].get('project') is None:
                                repeat_prompt_requests[i]['inputs'] = {'project': []}
                            if type(repeat_prompt_requests[i]['inputs'].get('project')) is list:
                                repeat_prompt_requests[i]['inputs']['project'] = list(set(repeat_prompt_requests[i]['inputs']['project'] + list(repeat_details.keys())))
                            else:
                                repeat_prompt_requests[i]['inputs']['project'] = list(set(list(repeat_details.keys())))
                        frepeat_prompt_requests = self.pv.format_prompts(prompts=copy.deepcopy(repeat_prompt_requests), inputs=repeat_details)
                        for i in range(len(frepeat_prompt_requests)):
                            frepeat_prompt_requests[i]['repeat_seq_id'] = repeat_index
                            repeat_index += 1
                        all_repeat_prompts.extend(frepeat_prompt_requests)
                        
                all_repeat_prompts = self.pv.get_prompt_requests(all_repeat_prompts)
                for all_repeat_prompt in reversed(all_repeat_prompts):
                    prompt_requests_queue.appendleft(all_repeat_prompt)
                    repeat_prompt_requests = []
                continue
            # Get prompt step response and messages

            SELECTED_AI_MODEL = OPEN_AI_MODEL
            if prompt_config.get("prompt_seq_model") is not None:
                SELECTED_AI_MODEL = prompt_config.get("prompt_seq_model").strip()

            elif prompt_config.get("prompt_model") is not None:
                SELECTED_AI_MODEL = prompt_config.get("prompt_model").strip()
            max_tokens = 5*1024
            if prompt_config.get("max_tokens") is not None:
                max_tokens = int(prompt_config.get("max_tokens"))
            step_response, step_messages, execute_prompt_id = self.ds.get_prompt_step(SELECTED_AI_MODEL, prompt_config)
            execution_time = 0
            llm_status = f"{prompt_config['name']} - {prompt_config['version']} - Seq-{prompt_config['seq']}"
            prompt_output_format = prompt_config.get('output_format','text')
            if prompt_output_format is None:
                prompt_output_format = 'text'
            try:
                if execute_prompt_id is None:
                    fmessages, fun_def = self.build_openai_messages(prompt_request)
                    # If there are outputs, create a message and append it to the messages list
                    if len(outputs) > 0 and prompt_config.get('skip_prompt_append', False) == False:                        
                        fmessage = {}
                        fmessage['role'] = 'assistant'
                        if outputs['is_fun'] == True:
                            fmessage['content'] = None
                            fmessage['function_call'] = {}
                            fmessage['function_call']['arguments'] = outputs['content']
                            fmessage['function_call']['name'] = outputs['fun_name']
                        else:
                            fmessage['content'] = outputs['content']
                        messages.append(fmessage)
                    # Extend the messages list with fmessages
                    if prompt_config.get('skip_prompt_append', False) == False:                
                        messages.extend(fmessages)
                    if first_prompt_config.get('multicalls') == True:
                        messages = fmessages
                    output = {}
                    is_skip = False
                    start_time = time.time()
                    #Try to execute the completion function and handle exceptions
                    is_input_missing = self.print_messages(messages, config={"model": SELECTED_AI_MODEL, "max_tokens": max_tokens})
                    if env == "dev":
                        if is_input_missing == True:
                            prompt_requests_queue.clear()
                            exit()
                            break
                    try:
                        if fun_def is not None:
                            response = completion(
                                model=SELECTED_AI_MODEL, messages=messages, temperature=0, max_tokens= max_tokens, top_p=0.1, stream=True, max_retries=2, timeout=60,
                                tools=[fun_def],
                                tool_choice={"type": "function", "function": {"name": fun_def['function']['name']}}
                            )
                            outputs['fun_name'] = fun_def['function']['name']
                        else:
                            if prompt_config.get('output_format','text') in ['text','jsonb']:
                                response = completion(
                                    model=SELECTED_AI_MODEL, messages=messages, temperature=0, max_tokens= max_tokens, top_p=0.1, stream=True, max_retries=2, timeout=60)
                            else:
                                response = completion(
                                    model=SELECTED_AI_MODEL, messages=messages, temperature=0, max_tokens= max_tokens, top_p=0.1, stream=True, max_retries=2, timeout=60, response_format={ "type": "json_object" })
                            outputs['fun_name'] = None
                    except Exception as e:
                        self.track_llm_activity(usage=usage_cost, meta={'llm_status': llm_status, 'status': 'Error', 'id':response_id}, prompt_config=prompt_config)
                        self.ds.update_prompt_step(SELECTED_AI_MODEL, max_tokens, prompt_config, messages, outputs, is_error = 'Error')
                        if env == 'dev':
                            console.print_exception(show_locals=False)
                        print(f"\nProject:{self.project_id} Cost {prompt_config['name']} - {prompt_config['version']} - Seq-{prompt_config['seq']} Error in Completion")
                        llm_status = f"\n{prompt_config['name']} - {prompt_config['version']} - Seq-{prompt_config['seq']} Error in Completion"
                        prompt_requests_queue.clear()
                        is_success = "Error"
                        break
                        pass
                    
                    # Check if the function definition is not None
                    outputs['is_fun'] = fun_def is not None
                    text = ""
                    response_id = None
                    is_response_finish = False
                    finish_reason = None
                    system_fingerprint = None
                    try:
                        # Iterate over the response chunks
                        for chunk_message in response:
                            chunk_text = ""
                            try:
                                try:
                                    response_id = chunk_message.id
                                    if chunk_message.choices[0].finish_reason == 'stop':
                                        is_response_finish = True
                                    finish_reason = chunk_message.choices[0].finish_reason
                                    system_fingerprint = chunk_message.system_fingerprint
                                    if fun_def is None:
                                        chunk_text = chunk_message.choices[0].delta.content
                                    else:
                                        chunk_text = chunk_message.choices[0].delta.tool_calls[0].function.arguments
                                except:
                                    chunk_text = ""
                                    pass
                                if chunk_text is None:
                                    chunk_text = ""
                                text = text + chunk_text
                            except Exception as e:
                                prompt_config
                                self.track_llm_activity(usage=usage_cost, meta={'llm_status': llm_status, 'status': 'Error', 'id':response_id}, prompt_config=prompt_config)
                                outputs['response'] = text
                                self.ds.update_prompt_step(SELECTED_AI_MODEL, max_tokens, prompt_config, messages, outputs, is_error = 'Error')
                                if env == 'dev':
                                    console.print_exception(show_locals=False)
                                pass
                            if prompt_config['is_stream'] == True:
                                yield chunk_text
                            if env == "dev":
                                console.print(f"{chunk_text}", end='', style="bold red")
                    except litellm.APIError as e:
                        is_response_finish = False
                        llm_status = f"{prompt_config['name']} - {prompt_config['version']} - Seq-{prompt_config['seq']} Streaming Error"
                        self.track_llm_activity(usage=usage_cost, meta={'llm_status': llm_status, 'status': 'Error', 'id':response_id}, prompt_config=prompt_config)
                        self.ds.update_prompt_step(SELECTED_AI_MODEL, max_tokens, prompt_config, messages, outputs, is_error = 'Error')
                        pass
                    except Exception as e:
                        is_response_finish = False
                        llm_status = f"{prompt_config['name']} - {prompt_config['version']} - Seq-{prompt_config['seq']} Streaming Error"
                        self.track_llm_activity(usage=usage_cost, meta={'llm_status': llm_status, 'status': 'Error', 'id':response_id}, prompt_config=prompt_config)
                        self.ds.update_prompt_step(SELECTED_AI_MODEL, max_tokens, prompt_config, messages, outputs, is_error = 'Error')
                        pass
                    
                    if finish_reason == "length" and prompt_config.get('output_format') in ['text','json']:
                        mprompt_request = copy.deepcopy(prompt_request)
                        for i in range(len(mprompt_request)):
                            mprompt_request[i]['max_tokens'] = 8_196
                            mprompt_request[i]['prompt_model'] = None
                            mprompt_request[i]['prompt_seq_model'] = None
                            mprompt_request[i]['output_format'] = prompt_config.get('output_format')
                            mprompt_request[i]['skip_prompt_append'] = True
                        prompt_requests_queue.appendleft(mprompt_request)
                        continue
                    elif finish_reason == "length" and prompt_config.get('output_format') in ['text', 'jsonb']:
                        mprompt_request = copy.deepcopy(prompt_request)
                        for i in range(len(mprompt_request)):
                            mprompt_request[i]['max_tokens'] = 16_392
                            mprompt_request[i]['prompt_model'] = None
                            mprompt_request[i]['prompt_seq_model'] = None
                            mprompt_request[i]['output_format'] = prompt_config.get('output_format')
                            mprompt_request[i]['skip_prompt_append'] = True
                        prompt_requests_queue.appendleft(mprompt_request)
                        continue
                    # Update the outputs dictionary
                    outputs['id'] = response_id
                    outputs['finish_reason'] = finish_reason
                    outputs['system_fingerprint'] = system_fingerprint
                    check_is_valid_output = False
                    gpt_text = text
                    # Check if the output is valid
                    if outputs['is_fun'] == False and prompt_config.get('output_format') == 'text':
                        if text is not None and len(text) > 0:
                            check_is_valid_output = True
                    elif prompt_config.get('output_format',None) in ['json','jsonb'] and outputs['is_fun'] == False:
                        try:
                            details = json_repair.loads(text)
                            keys = list(details.keys())
                            if len(keys) > 0:
                                check_is_valid_output = True
                        except Exception as e:
                            self.track_llm_activity(usage=usage_cost, meta={'llm_status': llm_status, 'status': 'Error', 'id':response_id}, prompt_config=prompt_config)
                            self.ds.update_prompt_step(SELECTED_AI_MODEL, max_tokens, prompt_config, messages, outputs, is_error = 'Error')
                            print("fail to parse json", e)
                            details = {}
                    elif outputs['is_fun'] == True :
                        output_config = prompt_config['outputs']
                        if text is not None and len(text) > 0:
                            try:
                                details = json_repair.loads(text)
                            except Exception as e:
                                self.track_llm_activity(usage=usage_cost, meta={'llm_status': llm_status, 'status': 'Error', 'id':response_id}, prompt_config=prompt_config)
                                self.ds.update_prompt_step(SELECTED_AI_MODEL, max_tokens, prompt_config, messages, outputs, is_error = 'Error')
                                print("fail to parse json", e)
                                details = {}
                            all_output_fields = details.keys()
                            all_execpted_output_fields = [field for _, fields in output_config.items() for field in fields]
                            missing_fields = list(set(all_execpted_output_fields) - set(all_output_fields))
                            if len(missing_fields) == 0:
                                check_is_valid_output = True
                            else:
                                print(f"\nProject:{self.project_id} Cost {prompt_config['name']} - {prompt_config['version']} - Seq-{prompt_config['seq']} Missing Fields", missing_fields)
                                llm_status = f"{prompt_config['name']} - {prompt_config['version']} - Seq-{prompt_config['seq']} Missing Fields" + ','.join(missing_fields)
                                self.track_llm_activity(usage=usage_cost, meta={'llm_status': llm_status, 'status': 'Error', 'id':response_id}, prompt_config=prompt_config)
                                self.ds.update_prompt_step(SELECTED_AI_MODEL, max_tokens, prompt_config, messages, outputs, is_error = 'Error')              
                    # If the output is valid and the response is finished, update the outputs dictionary and the prompt step
                    if check_is_valid_output == True and is_response_finish == True:
                        outputs['content'] = text
                        execution_time = time.time() - start_time
                        usage_cost = self.get_token_usage_and_cost(model=SELECTED_AI_MODEL, messages=messages, response_text=text, execution_time=execution_time, prev_usage=usage_cost)
                        outputs['usage'] = usage_cost
                        execute_prompt_id = self.ds.update_prompt_step(SELECTED_AI_MODEL, max_tokens, prompt_config, messages, outputs, is_error = 'Success')
                    else:
                        is_success = "Error"
                        llm_status = f"{prompt_config['name']} - {prompt_config['version']} - Seq-{prompt_config['seq']} Invalid Output - Finish Reason {finish_reason}"
                        prompt_requests_queue.clear()
                        break
                else:
                    outputs, messages = step_response, step_messages
                    is_input_missing = self.print_messages(messages, config={"model": SELECTED_AI_MODEL, "max_tokens": max_tokens})
                    if env == "dev":
                        if is_input_missing == True:
                            prompt_requests_queue.clear()
                            exit()
                            break
                    text = outputs['content']
                    response_id = outputs['id']
                    if text is None:
                        text = ""
                    usage_cost = outputs.get('usage')
                    if(prompt_config['is_stream']==True) or env == 'dev':
                        # This block handles the streaming of the output text.
                        for chunk_text in text.split(' '):
                            if sandbox == True and env == 'dev':
                                console.print(f"{chunk_text} ", end='', style="bold red")
                                time.sleep(0.000001)
                            else:
                                time.sleep(0.00000001)
                            if prompt_config['is_stream'] == True:
                                yield chunk_text
                                yield " "
                # Determine operation status based on prompt requests queue length  
                status = "Success" if len(prompt_requests_queue) == 0 else "Error"
                
                if env == "dev":
                    console.print(f"\nProject:{self.project_id} Cost {prompt_config['name']} - {prompt_config['version']} - Seq-{prompt_config['seq']} : "+json.dumps(usage_cost)+f" DB Status Update: {self.update_status_field(prompt_section=prompt_config['name'], status=status)}\n", style="red")
                
                output_config = prompt_config['outputs']
                all_text = all_text + f"\n\n=== Prompt:{str(prompt_config['name'])} Ver:{str(prompt_config['version'])} Seq:{str(prompt_config['seq'])} PromptID:{str(prompt_config['prompt_seq_id'])} ExecuteID: {execute_prompt_id} ===\n\n" + str(text)
                
                if outputs['is_fun'] == True:
                    # This block handles the case when the output is a function output.
                    try:
                        details = json_repair.loads(text)
                    except Exception as e:
                        print(f"Project:{self.project_id} fail to parse json", e)
                        details = {}
                elif outputs['is_fun'] == False and prompt_config['output_format'] in ['json','jsonb']:
                    temp_details = json_repair.loads(text)
                    keys = list(temp_details.keys())
                    if type(temp_details[keys[0]]) == str:
                        text = temp_details[keys[0]]
                    else:
                        text = json.dumps(temp_details[keys[0]])
                for source, fields in output_config.items():
                    # Update values for each source's fields
                    if(len(fields)==0):
                        break
                    if(len(fields)==1 and outputs['is_fun'] == False):
                        if self.output_details.get(fields[0]) is None:
                            if self.output_details.get(fields[0], None) is None:
                                self.output_details[fields[0]] = text
                            elif first_prompt_config.get('skip_append') == True or prompt_config.get('skip_append') == True:
                                self.output_details[fields[0]] = text
                            else:
                                self.output_details[fields[0]] = self.output_details[fields[0]] +"\n\n"+ text
                            if len(text) == 0:
                                self.output_details[fields[0]] = None
                                status = "Error"
                        elif type(self.output_details[fields[0]]) == str:
                            if self.output_details.get(fields[0], None) is None:
                                self.output_details[fields[0]] = text
                            elif first_prompt_config.get('skip_append') == True or prompt_config.get('skip_append') == True:
                                self.output_details[fields[0]] = text
                            else:
                                self.output_details[fields[0]] = self.output_details[fields[0]] +"\n\n"+ text
                    else:
                        for field in fields:
                            if(field in details):
                                if details[field] is None:
                                    status = "Error"
                                elif(type(details[field])==str):
                                    if self.output_details.get(field) is None:
                                        self.output_details[field] = details[field]
                                    elif type(self.output_details[field]) == str:
                                        if first_prompt_config.get('skip_append') == True:
                                            self.output_details[fields[0]] = text
                                        else:
                                            self.output_details[field] = self.output_details[field] +"\n\n"+ details[field]
                                else:
                                    self.output_details[field] = json.dumps(details[field])
                            else:
                                self.output_details[field] = None
                                status = "Error"
                    llm_status = f"{prompt_config['name']} - {prompt_config['version']} - Seq-{prompt_config['seq']} Status Success"
                    extra_fields = list(self.update_status_field(prompt_section=prompt_config['name'], status=status).keys())
                    self.output_details.update(self.update_status_field(prompt_section=prompt_config['name'], status=status ))
                    response_tracking_details = self.update_message_response(prompt_section=prompt_config['name'],messages=json.dumps(messages), response=all_text)
                    self.output_details.update(response_tracking_details)
                    _ = self.pv.update_cache_inputs(response_tracking_details)
                    self.output_details.update({'step_seq':prompt_config['seq']})
                    new_output_details = self.pv.update_cache_inputs({field:self.output_details[field] for field in fields+extra_fields})
                    ds_data_update_action, extra_output_details = self.ds.update_data(source =source, details = {field:self.pv.get_cache_inputs(field) for field in fields+extra_fields+list(response_tracking_details.keys())})
                    self.pv.update_cache_inputs(extra_output_details)
                    for field in fields:
                        if prompt_config.get('is_skip_delete') == True:
                            continue
                        del self.output_details[field]
                    self.track_llm_activity(usage=usage_cost, meta={'llm_status': llm_status, 'status': 'Success', 'id':response_id}, prompt_config=prompt_config)
                    self.ds.update_prompt_step(SELECTED_AI_MODEL, max_tokens, prompt_config, messages, outputs, is_error = 'Success')

                    is_success = status
                    if ds_data_update_action == "End Sequence":
                        prompt_requests_queue.clear()
                        yield "@#@$@#@"
                        break
                        
            except Exception as e:
                if env == 'dev':
                    console.print_exception(show_locals=False)
                print(f"Project:{self.project_id} ", e)
                self.output_details.update(self.update_status_field(prompt_section=prompt_config['name'], status='Error' ))
                self.output_details['step_seq'] = prompt_config['seq']
                self.ds.update_data(source ='project', details = self.output_details)
                prompt_requests_queue.clear()
                is_success = "Error"
                prompt_requests_queue.clear()
                self.track_llm_activity(usage=usage_cost, meta={'llm_status': llm_status, 'status': 'Error', 'id':response_id}, prompt_config=prompt_config)
                self.ds.update_prompt_step(SELECTED_AI_MODEL, max_tokens, prompt_config, messages, outputs, is_error = 'Error')
        self.track_project_activity(meta={'status': is_success})
            
    def get_outputs(self):
        return self.output_details
            
def _section_stream(data, pid, section_type, prompt_section, skip_stream=False):
    """
    Stream the prompt requests for a specific section.

    Args:
        data (dict): The data dictionary containing project details and section information.
        pid (bool): The project ID.
        section_type (str): The type of section.
        prompt_section (str): The prompt section.
        skip_stream (bool, optional): Whether to skip streaming. Defaults to False.

    Yields:
        str: The chunk of text from the stream.

    Raises:
        Exception: If there is an error during streaming.
    """
    project_id = data.get('project_id')
    section_history_id = data.get('section_history_id')
    pv = PromptVersion(db=db, logger=logger)
    ds = Datasource(db=db)
    if project_id is not None:
        project_details = _get_invention({"project_id":project_id}, project_id)
    else:
        project_details = _get_claim({"section_history_id":section_history_id})
    prompt_sections = [prompt_section]
    if prompt_section in ['flowchart_description','flowchart_diagram']:
        prompt_sections = [prompt_section]
    elif prompt_section in ['block_diagram_description','block_diagram_diagram']:
        prompt_sections = [prompt_section]
    elif prompt_section in ['extra_description']:
        prompt_sections = [prompt_section]
    _is_user_have_figures_data_flag, _ = _is_user_have_figures_data(data)
    if _is_user_have_figures_data_flag == True and prompt_section in ['block_diagram_description']:
        prompt_sections = ['block_diagram_description_with_figures']
    if(project_details.get('claims_style') =='eu' and prompt_section == 'claims'):
        prompt_sections = ['claims_eu']
    elif prompt_section in ['claim_invention']:
        prompt_sections = ['claim_invention']
        data['prompt_section_history_id'] = data.get('section_history_id')
    if env == "dev":
        print("prompt_sections: ---", prompt_sections,"---")
    prompt_requests = []
    inputs = {}
    for prompt_section in prompt_sections:
        input_sources = pv.get_inputs(prompt_section=prompt_section)
        project_details = {'project_id': project_id, 'section_type': section_type}
        if data.get('section_history_id') is not None:
            project_details['section_history_id'] = data.get('section_history_id')
        data['section_type'] = section_type
        data['prompt_section'] = prompt_section
        if pid:
            del data['section_history_id']
        ds.set_project(data)
        
        for source, fields in input_sources.items():
            for field, value in ds.get_data(source=source, fields=fields).items():
                inputs[field] = value
        prompt_requests.extend(pv.get_prompts(prompt_section=prompt_section, inputs=inputs))
    pv.set_cache_inputs(inputs)
    llm = LLMOpenAI(ds=ds, pv=pv)
    complete_text = ''
    for chunk_text in llm.stream_request(prompt_requests=prompt_requests):
        if skip_stream == False:
            try:
                yield chunk_text
                pass
            except Exception as e:
                print("Exception stream encode", e)
                break

def _section_prompt_stream(data,pid,section_type, prompt_section, skip_stream=False):
    """    Generates prompt stream for a given section.

    Args:
        data (dict): The data dictionary containing project details and section history.
        pid (bool): The prompt ID.
        section_type (str): The type of section.
        prompt_section (str): The prompt section.
        skip_stream (bool, optional): Whether to skip the stream. Defaults to False.

    Yields:
        str: The chunk text of the prompt stream.

    Raises:
        Exception: If there is an error during stream encoding.
    """
    prompt_section = f"{prompt_section}_prompt"
    project_id = data.get('project_id')
    pv = PromptVersion(db=db, logger=logger)
    ds = Datasource(db=db)
    input_sources = pv.get_inputs(prompt_section=prompt_section)
    project_details = {'project_id' :project_id,'section_type' : section_type}
    if data.get('section_history_id') is not None:
        project_details['section_history_id'] = data.get('section_history_id')
    data['section_type'] = section_type
    if(pid):
        data['prompt_section_history_id'] = data['section_history_id']
        del data['section_history_id']
    if data.get('data'):
        data['prompt_instructions'] = data.get('data')
        del data['data']
    ds.set_project(data)    
    inputs = {}
    for source, fields in input_sources.items():
        for field, value in ds.get_data(source=source, fields=fields).items():
            inputs[field] = value
    prompt_requests = pv.get_prompts(prompt_section=prompt_section, inputs=inputs)
    llm = LLMOpenAI(ds=ds, pv=pv)
    complete_text = ''
    for chunk_text in llm.stream_request(prompt_requests=prompt_requests):
        if skip_stream == False:
            try:
                yield chunk_text
                pass
            except Exception as e:
                print("Exception stream encode", e)
                break

class PCSDatasource(Datasource):
    """
    A class representing a data source for PCS (Patent Classification System).
    Inherits from the Datasource class.
    """

    def __init__(self, db: PostgresDB) -> None:
        super().__init__(db=db)
        
    def _conceptstoquery_tags_mm(self, concepts, source, syns, mm=2):
        """
        Generates a query and a set of terms based on the given concepts, source, synonyms, and minimum match (mm) value.

        Args:
            concepts (list): List of concepts.
            source (str): Source for the query.
            syns (dict): Dictionary of synonyms.
            mm (int, optional): Minimum match value. Defaults to 2.

        Returns:
            tuple: A tuple containing the generated query and the set of terms.
        """
        querylist = []
        terms = set()
        if concepts:
            for concept in concepts:
                subquery = []
                subquery.append(concept)
                terms.add(concept)
                if concept.lower() in syns:
                    for synonym in syns[concept.lower()]:
                        subquery.append(synonym)
                querylist.append(subquery)
        query = """{!edismax  qf='"""+source+"""' mm="""+str(mm)+""" } """
        for y in querylist:
            query = query + '("' + '" "'.join(y)+'")'
        return query, terms
        
    def build_search_results(self):
        """
        Builds the search results based on the project data.

        Returns:
            tuple: A tuple containing the list of patents and the formatted patents.
        """
        terms, syns, semantics = self.project_data['pcs_terms'], self.project_data['pcs_syns'], self.project_data['pcs_semantics']
        gpt_data = {}
        gpt_data['term_classification'] = json_repair.loads(self.project_data['entity_hierarchy'])
        gpt_data['cpc_codes'] = json_repair.loads(self.project_data['patent_classification'])['primary']
        miss = set({x['entity'] for x in json_repair.loads(self.project_data['high_score_entities'])} - {x['entity'] for x in json_repair.loads(self.project_data['entity_hierarchy'])})
        wfs = json_repair.loads(self.project_data['entity_wordforms'])
        for details in wfs:
            xx = details['entity']
            xx_wfs = [x['wordform'] for x in details['wordforms']]
            if xx in syns:
                syns[xx] = set(syns[xx])
                syns[xx].update(xx_wfs)
            else:
                syns[xx] = xx_wfs
        level1 = [x['entity']
                      for x in gpt_data['term_classification'] if '.' not in x['index']]
        level2 = [x['entity'] for x in gpt_data['term_classification']
                    if '.' in x['index']] + list(miss)
        patents = []
        patents_hash = {}
        flag = 0
        for xx in range(len(level1)):
            for yy in range(0, len(level2), 1):
                l1 = len(level1) - xx
                l2 = len(level2) - yy
                query1 = '(_query_:"'+ self._conceptstoquery_tags_mm(level1,
                                                                'tac', syns, mm=l1)[0].replace('"', '\\"')+'")'
                query2 = '(_query_:"'+ self._conceptstoquery_tags_mm(level2,
                                                                'tac', syns, mm=l2)[0].replace('"', '\\"')+'")'
                query = '('+query1 + ' AND ' + query2+') ' + ' AND allclass:("'+'" OR "'.join(
                    {x.split('/')[0].replace(" ", "") for x in [gpt_data['cpc_codes']]})+'")'
                fam, pats = _get_patents(self.pcs_access_token, query, 25)
                if fam is None:
                    continue

                for pat in pats:
                    ucid = pat['ucid']
                    if ucid not in patents_hash:
                        patents_hash[ucid] = pat
                        patents.append(pat)
                if len(patents_hash) >= prior_art_total_patents_to_check*4:
                    flag = 1
                    break
            if flag == 1:
                break
        if len(patents) == 0:
            query = '(allclass:("' + \
                '" OR "'.join(
                    {x.split('/')[0].replace(" ", "") for x in [gpt_data['cpc_codes']]})+'")'
            fam, patents = _get_patents(self.pcs_access_token, query, 25)
            
        fpatents = {}
        patents = patents[0:10]
        for patent in patents:
            details = {k:patent[k] for k in ['link','pn','dolcera_score','title','co','prid','cpcpri','pd','ad'] if k in patent}
            details['similarity_score'] = None
            details['similarity_summary'] = None
            fpatents.update({patent['pn']: details})
        return patents, fpatents
    
    def build_patent_similarity(self, patents):
        """
        Builds the patent similarity based on the given list of patents.

        Args:
            patents (list): List of patents.

        Returns:
            None
        """
        pass
        
def _prior_art(data):
    """
    This function retrieves prior art information for a given project and calculates similarity scores for each patent.
    
    Args:
        data (dict): A dictionary containing project information.
        
    Returns:
        None
    """
    
    project_id = data.get('project_id')
    pv = PromptVersion(db=db, logger=logger) 
    ds = PCSDatasource(db=db)
    input_sources = pv.get_inputs(prompt_section='prior_art_search_query')
    data['section_type'] = "prior_art_search_query"
    ds.set_project(data)
    inputs = {}
    for source_name in ['project','pcs']:
        source, fields = source_name, input_sources[source_name]
        inputs.update(ds.get_data(source=source, fields=fields).items())
    prompt_requests = pv.get_prompts(prompt_section='prior_art_search_query', inputs=inputs)
    llm = LLMOpenAI(ds=ds, pv=pv)
    complete_text = ''
    all_chunks = []
    for chunk_text in llm.stream_request(prompt_requests=prompt_requests):
        pass
    pats, rpats = ds.build_search_results()
    for pat_index, pat in enumerate(pats):
        pn = pat['pn']
        input_sources = pv.get_inputs(prompt_section='prior_art_similarity')
        data['section_type'] = "prior_art_similarity"
        ds.set_project(data)
        inputs = {}
        for source_name in ['project']:
            source, fields = source_name, input_sources[source_name]
            inputs.update(ds.get_data(source=source, fields=fields).items())
        inputs['reference patent'] = pat['first_claim']
        inputs['pn'] = pat['pn']
        prompt_requests = pv.get_prompts(prompt_section='prior_art_similarity', inputs=inputs)
        llm = LLMOpenAI(ds=ds, pv=pv)
        complete_text = ''
        all_chunks = []
        for chunk_text in llm.stream_request(prompt_requests=prompt_requests):
            print(chunk_text, end='', flush=True)
        details = llm.get_outputs()
        rpats[pn]['similarity_summary'] = details.get("summary")
        rpats[pn]['similarity_score'] = details.get("similarity_score")
        data['section_history_id'] = None
    sorted_patents = sorted(rpats.items(), key=lambda x: x[1]['similarity_score'], reverse=True)

data = {
    "data": "A method and system for providing therapeutic effects are disclosed. The method includes preparing a therapeutic formulation, administering it through a selected route, and assessing the therapeutic outcomes, effect, and duration of effect onset. A specific type of sublingual formulation is prepared and administered, with therapeutic agents selected for the formulation. The system comprises means for preparing, administering, and assessing the therapeutic formulation, as well as for selecting therapeutic agents. The sublingual formulation can be a hydroalcoholic formulation, and the therapeutic outcomes may include rapid pain relief with an effect onset of less than 5 minutes. The system may also include means for monitoring therapeutic effects and adjusting the dosage of therapeutic agents, potentially through a feedback loop that includes a sensor, such as a biosensor, configured to detect changes in physiological parameters of a user.",
    "project_id": "33",
    "project_history_id": 38,
    "redraft": False,
    "claim_section_history_id": 187,
    "regenerate_claim_section_history_id": 213,
    "autoRetry": False,
    "sectiom_history_id": 144,
}

# _section_stream(data, pid = None, section_type = 'block_diagram', prompt_section = 'block_diagram_description', skip_stream=False)
