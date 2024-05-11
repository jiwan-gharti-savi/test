import datetime
import json
import logging
import re
import time

import pandas as pd
import requests
from core.common.postgresql import PostgresDB
from core.config import *
from core.config import (api_key, db, db_config, env, gpt_model, gpt_regex,
                         gpt_regex_group, gpt_temperature, maximum_tokens,
                         pcs_base_client_id, pcs_base_client_secret,
                         pcs_base_url)
from core.notification import (db_format_response, draft_format_response,
                               get_notification_message)
from core.prompts import *
from core.prompts import (build_claim_message, build_section_message,
                          num_tokens_from_string, request_openai_chat)
from flask import Blueprint, Flask, jsonify, request
from flask_cors import CORS
from joblib import Parallel, delayed
from modules.mermaid_module import check_and_fix_mermaid_syntax
from modules.openai_parse_module import (
    convert_text_to_json, extract_claims_alternative_entities,
    extract_claims_alternative_entities_fun,
    extract_claims_intermediate_steps_arguments,
    extract_claims_intermediate_steps_fun,
    extract_figure_brief_description_and_mermaid,
    extract_figure_brief_description_and_mermaid_fun,
    re_written_claim_and_all_claims_re_written,
    re_written_claim_and_all_claims_re_written_fun)
from rich.console import Console

logger = logging.getLogger("draft.log")
console = Console()


def get_max_request_tokens(section_type, step):
    request_max_tokens = int(2.5*1024)
    if section_type in ['Title']:
        request_max_tokens = 512
    elif section_type in ['Abstract']:
        request_max_tokens = 1024
    elif section_type in ['detail_Description']:
        request_max_tokens = 4*1204
    elif section_type == 'Claims':
        if step == 1:
            request_max_tokens = 4*1024
        elif step == 2:
            request_max_tokens = 6*1024
    elif section_type == 'flowchart_diagram':
        if step == 1:
            request_max_tokens = 4*1024
        elif step == 2:
            request_max_tokens = 6*1024
        elif step == 3:
            request_max_tokens = 2*1024
    return request_max_tokens
    
    
prior_art_val = []
prior_art_analysis = []


def request_openai(necessary_features,generalized_entities, entity_action, alternative_entity_name,id,claim_data,type, invention, system_instructions, instructions_for_drafting, prompt_instructions, section_instructions, prior_art, template_instructions, ending_prompt_instructions, is_incremental, current_text, prior_art_val,generated_text,previous_generated_text,step, prev_messages):
    """
    Request OpenAI API to generate text based on the given parameters.

    Args:
        type (str): The type of section to generate (e.g. 'claims', 'detailed_description_figures').
        invention (str): The invention title.
        system_instructions (str): The system instructions for generating the text.
        instructions_for_drafting (str): The instructions for drafting the text.
        prompt_instructions (str): The prompt instructions for generating the text.
        section_instructions (str): The section instructions for generating the text.
        prior_art (str): The prior art information.
        template_instructions (str): The template instructions for generating the text.
        ending_prompt_instructions (str): The ending prompt instructions for generating the text.
        is_incremental (bool): Whether the text generation is incremental or not.
        current_text (str): The current text to be used as input for incremental text generation.
        prior_art_val (list): The prior art values.

    Returns:
        tuple: A tuple containing the modified messages, generated text, status, API status code, and status message.
    """
    if type in ['Claims']:
        messages, modified_messages = build_claim_message(invention, system_instructions, instructions_for_drafting,
                                                          prompt_instructions, section_instructions, prior_art, template_instructions, ending_prompt_instructions, is_incremental, current_text, type, prior_art_val, generated_text,previous_generated_text,step, prev_messages)
    
    else:
        messages, modified_messages = build_section_message(necessary_features,generalized_entities, entity_action, alternative_entity_name,claim_data,invention, system_instructions, instructions_for_drafting,
                                                            prompt_instructions, section_instructions, prior_art, template_instructions, ending_prompt_instructions, is_incremental, current_text, type, prior_art_val,generated_text,previous_generated_text,step, prev_messages)
    count = sum([num_tokens_from_string(x['content']) for x in modified_messages])
    print("count => ", count)
    limit_maximum_tokens = maximum_tokens
    req_gpt_model = gpt_model
    request_max_tokens = 2048
    if step == "":
        step = 1
    request_max_tokens = get_max_request_tokens(section_type=type, step=step)
    req_gpt_model = "gpt-4-32k"
    if count > limit_maximum_tokens:
        results = ""
        status = "Error"
        api_status_code = "max_tokens_exceeded"
        status_message = "Exceeded the maximum number of words."
    else:
        status = False
        status_message = ""
        generated_text, api_status, api_status_code, api_status_message, usage = request_openai_chat(
            id,type,model=req_gpt_model, messages=modified_messages, temperature=gpt_temperature, request_max_tokens=request_max_tokens, step=step)
        if generated_text is not None:
            for _ in range(0, 3):
                generated_text = str(generated_text).strip("```").strip()
                if ending_prompt_instructions in generated_text:
                    generated_text = generated_text.lstrip(
                        ending_prompt_instructions).strip()
                if '...' in generated_text or '. . .' in generated_text:
                    generated_text = generated_text.replace('...', ' ').replace(
                        '. . .', ' ').replace('  ', ' ').strip()
                generated_text = generated_text.strip('"').strip()
            results = generated_text
            status = api_status
            status_message = f"{type.replace('_',' ').title()}"
        else:
            results = ""
            status = api_status
            status_message = api_status_message
    if (status=='Error'):
        usage = {}
        usage['completion_tokens']=0
        usage['prompt_tokens'] = 0
        usage['total_tokens'] = 0
    return modified_messages, results, status, api_status_code, status_message,usage


def _get_invention(data,id=None):
    """
    Get the invention title from the database.

    Args:
        id (int): The ID of the project.

    Returns:
        str: The invention title.
    """
    try:
        # project_id = ''
        if 'project_id' in data:
            project_id = data['project_id']
        else:
            project_id = id


        rows = db.execute({
            "query": "invention_title",
            "values": {
                "project_id": project_id
            }
        })
        if (id):
            return {"invention":rows[0]['invention_title'], "novelty": rows[0]['novelty'], "claims_style":rows[0]['claims_style']}
        response = db_format_response(
            rows[0], "Success", "ignore", "Project data loaded successfully")
    except Exception as e:
        if (id):
            return {}
        response = db_format_response(
            "", "Error", "ignore", f"{str(e)}")
    
    return response


def _get_claim(data):
    """
    Get the invention title from the database.

    Args:
        id (int): The ID of the project.

    Returns:
        str: The invention title.
    """
    try:
        # project_id = ''
        if 'section_history_id' in data:
            section_history_id = data['section_history_id']


        rows = db.execute({
            "query": "select_section_history",
            "values": {
                "section_history_id": section_history_id
            }
        })
        return {"claims":rows[0]['text']}
    except Exception as e:
        if (id):
            return {}
        response = db_format_response(
            "", "Error", "ignore", f"{str(e)}")
    
    return response

def _get_invention_title(data,id=None):
    """
    Get the invention title from the database.

    Args:
        id (int): The ID of the project.

    Returns:
        str: The invention title.
    """
    try:
        # project_id = ''
        if 'project_id' in data:
            project_id = data['project_id']
        else:
            project_id = id


        rows = db.execute({
            "query": "invention_title",
            "values": {
                "project_id": project_id
            }
        })
        if (id):
            return rows[0]['invention_title']
        response = db_format_response(
            rows[0], "Success", "ignore", "Project data loaded successfully")
    except Exception as e:
        if (id):
            return ""
        response = db_format_response(
            "", "Error", "ignore", f"{str(e)}")
    
    return response



def update_db_section_changes(json_data, details,alternative_entity_name,extract_results,list_of_figures_text,detailed_description_figures_text,claim_section_history_id, usage, first_messages, first_generated_text, second_messages, second_generated_text, prompt_instructions, project_history_id, redraft, section_history_id, section, id, pid, results, messages, action_source="prompt", is_error="Success", message="", message_code="ignore", clm_step=-1):
    """
    Update the database with the changes made to a section.

    Args:
        prompt_instructions (str): The prompt instructions used for generating the text.
        project_history_id (int): The ID of the project history.
        section_history_id (int): The ID of the section history.
        section (str): The type of section being updated.
        id (int): The ID of the project.
        pid (int): The ID of the patent.
        results (str): The generated text.
        messages (str): The modified messages used for generating the text.
        action_source (str): The source of the action.
        is_error (str): The error status.
        message (str): The error message.
        message_code (str): The error message code.

    Returns:
        tuple: A tuple containing the status, API status code, and status message.
    """
    status = ""
    status_message = ""
    prompt = prompt_instructions
    messages = json.dumps(messages)
    project_id = id,
    message = get_notification_message(message_code, message, '')
    message_long = get_notification_message(message_code, message, '_long')
    prev_section_history_id_selected = ''
    user_data = {}
    activity_data = {}
    patent_drafted = False
    patent_redrafted = False
    section_history_value = {}
    db_id = {}
    if(section_history_id==""):
        section_history_id = None
    try:
        sysuser_id = db.execute({
            "query": "project_type",
            "values": {
                "project_id": project_id
            }
        })
        user_data['sysuser_id'] = sysuser_id[0]['sysuser_id']
        email = db.execute({
            "query": "select_sysusers",
            "values": {
                "sysuser_id": str(user_data['sysuser_id'])
            }
        })
        email = email[0]['email'] if email and isinstance(email[0], dict) and 'email' in email[0] else ''
        domain_name = ''
        parts = email.split('@')
        if len(parts) == 2:
            domain_name = parts[1]
        else:
            domain_name = None
        user_data['domain_name'] = domain_name
        section_history_row = db.execute({
            "query": "select_section_history",
            "values": {
                "project_id": project_id,
                "section_type": section,
                "is_error": "Success"
            }
        })
        same_text_section_history_data = []
        if len(same_text_section_history_data) > 0:
            same_text_section_history_data = db.execute({
                "query": "select_section_history",
                "values": {
                    "project_id": project_id,
                    "section_history_id": section_history_row[0]['section_history_id'],
                    "section_type": section,
                    "text":results,
                    "is_error":"Success"
                }
            })
        if(len(same_text_section_history_data)>0):
            id['section_history_id'] = section_history_row[0]['section_history_id']
            status = "Success"
            status_code = ""
            status_message = f"Updated {section}"
            return status, status_code, status_message, id
        
        prev_section_history_id_selected =  None
        is_selected_id = db.execute({"query": "select_section_history",
                    "values": {
                        "project_id": project_id,
                        "section_type": section,
                        "is_selected": True,
                        "is_error": "Success"
                    }
                })
        if(len(is_selected_id)>0 and is_selected_id[0]['section_history_id'] is not None):
            prev_section_history_id_selected = is_selected_id[0]['section_history_id']
        else:
            redraft = True
        current_section_history_selected = True
        if(is_error == 'Error'):
            current_section_history_selected = False
        section_row = db.execute({
            "query": "select_one_sections",
            "values": {
                "sh.project_id" : project_id,
                "sh.section_type": section,
            }
        })
        claim_section_history = db.execute({
            "query": "select_section_history",
            "values": {
                "project_id": project_id,
                "section_type": "Claims",
                "is_error": "Success"
            }
        })

        regenerate_claim_section_history = db.execute({
            "query": "select_section_history",
            "values": {
                "project_id": project_id,
                "section_type": "regenerate_claim",
                "is_error": "Success",
                "is_selected" : True
            }
        })
        
        if(claim_section_history_id==None):
            if len(claim_section_history ) > 0:
                claim_section_history_id = claim_section_history[0]['section_history_id']
                claim_section_history_id = int(claim_section_history_id)
        
        section_data = {
                    "project_id": project_id,
                    "section_type": section,
                    "text": results,
                    "prompt": "{}",
                    "action_type": "gpt",
                    "is_error": is_error,
                    "project_history_id": project_history_id
        }

        section_history_value = {
                                "project_id": project_id,
                                "section_type": section,
                                "text": results,
                                "prompt": prompt,
                                "messages": messages,
                                "action_type": "gpt",
                                "is_error": is_error,
                                "message": message,
                                "message_long": message_long,
                                "is_selected": False,
                                "prev_section_history_id": section_history_id,
                                "claim_section_history_id": claim_section_history_id,
                                "project_history_id": project_history_id,
                                "is_redraft" :True,
                                "completion_tokens": usage['completion_tokens'],
                                "prompt_tokens": usage['prompt_tokens'],
                                "total_tokens": usage['total_tokens'],
                                "parsed_json": json.dumps(json_data)
                            }
        activity_data = {
                "section_type": section,
                "api_status": is_error,
                "api_error_message": message,
                "project_id": project_id,
                "sysuser_id": user_data['sysuser_id'],
                "domain": user_data['domain_name'],
                "activity" : 'Patent Section Created'    
            }
        project_data = {
            "project_id": project_id
        }
        project_history_data = {
             "project_history_id": project_history_id
        }
        if section in ["Claims",'flowchart_diagram',"block_diagram",'regenerate_claim','embodiments_flowchart_figures','embodiments_flowchart_description_figures','embodiments_block_diagram','embodiments_block_diagram_description']:
            if (clm_step == 1):
                section_history_value['prompt_step1'] = json.dumps(first_messages)
                section_history_value['prompt_step2'] = None
                section_history_value['response_step1'] = first_generated_text
                section_history_value['text'] = ''
                section_history_value['messages'] = json.dumps('{}')
                section_history_value['is_error'] = 'Error'
                section_history_value['message'] = message
                if is_error == "Success":
                    section_history_value['step_completed'] = clm_step
            elif (clm_step == 2):
                section_history_value['text'] = ''
                section_history_value['messages'] = json.dumps('{}')
                section_history_value['prompt_step2'] = json.dumps(messages)
                section_history_value['response_step2'] = second_generated_text
                section_history_value['section_history_id'] = section_history_id
                section_history_value['is_error'] = 'Error'
                section_history_value['message'] = message
                if is_error == "Success" and (section in ["Claims",'flowchart_diagram',"block_diagram",'regenerate_claim']):
                    section_history_value['text'] = results
                    section_history_value['is_error'] = is_error
                    section_history_value['messages'] = messages
                    section_history_value['step_completed'] = clm_step
            elif (clm_step == 3 ):
                section_history_value['section_history_id'] = section_history_id
                section_history_value['prompt_step1'] = json.dumps(first_messages)
                section_history_value['response_step1'] = first_generated_text
                section_history_value['prompt_step2'] = json.dumps(second_messages)
                section_history_value['response_step2'] = second_generated_text
                section_history_value['messages'] = messages
                section_history_value['text'] = results
                section_history_value['is_error'] = is_error
                if is_error == "Success":
                    section_history_value['is_error'] = is_error
                    section_history_value['step_completed'] = clm_step
            if (section in ['flowchart_diagram', 'block_diagram']):
                diagram_data = section_history_value
                diagram_data['response_step1'] = first_generated_text
                diagram_data['list_of_figures'] = list_of_figures_text

                diagram_data['diagram_available'] = False
                if "text" in diagram_data and diagram_data['text'] and "graph" in diagram_data['text']:
                    diagram_data['diagram_available'] = True
            elif (section in ['embodiments_flowchart_figures','embodiments_flowchart_description_figures','embodiments_block_diagram','embodiments_block_diagram_description']):
                embodiments_figures_data = section_history_value
                embodiments_figures_data['list_of_figures'] = list_of_figures_text
                embodiments_figures_data['detailed_description_figures'] = detailed_description_figures_text
                embodiments_figures_data['diagram_available'] = False
                embodiments_figures_data['step_completed'] = clm_step
                embodiments_figures_data['is_error'] = 'Error'
                embodiments_figures_data["is_selected"] = False   
                embodiments_figures_data['claim_section_history_id'] = None  
                if(clm_step>1):
                    section_history_value['prompt_step1'] = json.dumps(second_messages)
                    section_history_value['response_step1'] = second_generated_text
                if((clm_step == 7 and section == 'embodiments_flowchart_figures') or (clm_step == 11 and section == 'embodiments_block_diagram_description') or (clm_step == 8 and section == 'embodiments_flowchart_description_figures') or (clm_step == 10 and section == 'embodiments_block_diagram')):
                    embodiments_figures_data['text'] = results
                    embodiments_figures_data['messages'] = messages
                    embodiments_figures_data['is_error'] = is_error
                    embodiments_figures_data["is_selected"] = True
                    embodiments_figures_data['claim_section_history_id'] = claim_section_history_id
                    if((clm_step == 7 and section == 'embodiments_flowchart_figures') or (clm_step == 10 and section == 'embodiments_block_diagram')):

                        if('graph' in results and 'FIG. 3' in list_of_figures_text and clm_step == 7):
                            embodiments_figures_data['diagram_available'] = True
                        if('graph' in results and 'FIG. 4' in list_of_figures_text and clm_step == 10):
                            embodiments_figures_data['diagram_available'] = True
                else:
                    embodiments_figures_data['is_error'] = 'Error'
                    embodiments_figures_data['messages'] = json.dumps('{}')
                    embodiments_figures_data['prompt_step2'] = json.dumps('{}')
                    embodiments_figures_data['response_step2'] = ''
                if(section in ['embodiments_flowchart_description_figures','embodiments_block_diagram_description']):
                    section_data['text'] = detailed_description_figures_text
            elif (len(extract_results)>0):
                for result in extract_results:
                    for key, value in result.items():
                        if(clm_step==0):
                            entity_section_history_value = {}
                            entity_section_data = {}
                            entity_project_data = {}
                            entity_project_history_data = {}
                            entity_project_data['project_id'] = id
                            entity_project_history_data['project_history_id'] = project_history_id
                            entity_section_history_value['section_history_id'] = claim_section_history_id
                            entity_section_data['project_id'] = id
                            entity_section_data['section_type'] = 'Claims'
                            if key == 'Entities':
                                entity_section_history_value['entity_name'] = value
                                entity_section_data['entity_name'] = value
                            elif key == 'Entity Actions':
                                entity_section_history_value['entity_action'] = value
                                entity_section_data['entity_action'] = value
                            elif key == 'Generalized Entities':
                                entity_section_history_value['generalized_entities'] = value
                                entity_section_data['generalized_entities'] = value
                            elif key == 'Necessary features':
                                entity_section_history_value['necessary_features'] = value
                                entity_section_data['necessary_features'] = value
                            elif key == 'Optional features':
                                entity_section_history_value['optional_features'] = value
                                entity_section_data['optional_features'] = value
                            elif key == 'Novelty':
                                entity_project_data['novelty'] = value
                                entity_project_history_data['novelty'] = value
                                db.execute({
                                    "query": "update_project",
                                    "values": entity_project_data
                                })
                                db.execute({
                                    "query": "update_project_history",
                                    "values": entity_project_history_data
                                })
                            db.execute({
                                "query": "update_sections",
                                "values": entity_section_data
                            })
                            db.execute({
                                "query": "update_section_history",
                                "values": entity_section_history_value
                            })
                            return 'Success', '', '', {}
                        else:
                            if key == 'Entities':
                                section_history_value['entity_name'] = value
                                section_data['entity_name'] = value
                            elif key == 'Entity Actions':
                                section_history_value['entity_action'] = value
                                section_data['entity_action'] = value
                            elif key == 'Generalized Entities':
                                section_history_value['generalized_entities'] = value
                                section_data['generalized_entities'] = value
                            elif key == 'Necessary features':
                                section_history_value['necessary_features'] = value
                                section_data['necessary_features'] = value
                            elif key == 'Optional features':
                                section_history_value['optional_features'] = value
                                section_data['optional_features'] = value
                            elif key == 'Novelty':
                                project_data['novelty'] = value
                                project_history_data['novelty'] = value
                                db.execute({
                                    "query": "update_project",
                                    "values": project_data
                                })
                                db.execute({
                                    "query": "update_project_history",
                                    "values": project_history_data
                                })
                            
                
            if(section == "regenerate_claim" and clm_step == 1):
                if(len(alternative_entity_name)>0):
                    rows = db.execute({"query": "update_sections",
                            "values":{
                                'alternative_entity_name' : alternative_entity_name,
                                "section_type" : "Claims",
                                "project_id": project_id[0]
                            }
                        })
                    rows = db.execute({"query": "update_section_history",
                        "values":{
                            'alternative_entity_name' : alternative_entity_name,
                            'section_history_id' : claim_section_history_id
                        }
                    })
        
            if(section == "flowchart_diagram" and clm_step == 1):
                invention = _get_invention_title({}, project_id)
                flowchart_description_extracted_text,flowchart_description_text, flowchart_description_prompt = figure_description(first_messages, first_generated_text, section_history_id, project_history_id, 'flowchart_figure_description', pid, project_id, type, invention, '', '', '', '', '', '', '', False, False, '')
                if(len(flowchart_description_extracted_text)>0):
                    diagram_data['detailed_description_figures'] = flowchart_description_extracted_text
                    diagram_data['prompt_step3'] = json.dumps(flowchart_description_prompt)
                    diagram_data['response_step3'] = flowchart_description_text

            if(section == "block_diagram" and clm_step == 1 ):
                invention = _get_invention_title({}, project_id)
                block_diagram_extracted_text,block_diagram_description_text, block_diagram_description_prompt = figure_description(first_messages, first_generated_text, section_history_id, project_history_id, 'block_figure_description', pid, project_id, type, invention, '', '', '', '', '', '', '', False, False, '')
                if(len(block_diagram_extracted_text)>0):
                    diagram_data['detailed_description_figures'] = block_diagram_extracted_text
                    diagram_data['prompt_step3'] = json.dumps(block_diagram_description_prompt)
                    diagram_data['response_step3'] = block_diagram_description_text
        if pid:
            activity_data["activity"] = 'Prompt-Modified Patent Section'
            rows = db.execute({"query": "update_sections",
                                "values": section_data
                })
            section_id = rows[0]['section_id']
            db_id['section_id'] = section_id
            section_history_value['section_id'] = section_id
            if len(section_history_row) > 0:
                if (section in ['flowchart_diagram', 'block_diagram']):
                    rows = db.execute({
                        "query": "update_figures_section_history",
                        "values": diagram_data
                    })
                elif (section in ['embodiments_figures','embodiments_figures_description']):
                    rows = db.execute({"query": "update_embodiments_figures_section_history",
                                       "values": embodiments_figures_data
                                       })
                else:
                    rows = db.execute({"query": "update_section_history",
                        "values": section_history_value
                    })
                db_id['section_history_id'] = rows[0]['section_history_id']
                activity_data["section_history_id"] = rows[0]['section_history_id']
        else:
            rows = db.execute({"query": "update_sections",
                            "values": section_data
                            })
            section_id = rows[0]['section_id']
            db_id['section_id'] = section_id
            section_history_value['section_id'] = section_id
            section_history_value["prev_section_history_id"] = None
            section_history_value['is_redraft'] = redraft
            if (len(section_history_row)==0 or len(rows) > 0 and 'section_history_id' not in rows[0] ):

                if (section in ['flowchart_diagram','block_diagram']):
                    rows = db.execute({"query": "update_figures_section_history",
                        "values": diagram_data
                    })
                elif (section in ['embodiments_flowchart_figures','embodiments_flowchart_description_figures','embodiments_block_diagram','embodiments_block_diagram_description']):
                    if('section_history_id' in embodiments_figures_data):
                        del embodiments_figures_data['section_history_id']
                    rows = db.execute({"query": "update_embodiments_figures_section_history",
                                        "values": embodiments_figures_data
                                        })
                else:
                    rows = db.execute({"query": "update_section_history",
                        "values": section_history_value
                    })
                section_history_id = rows[0]['section_history_id']
                print(3,section_history_id)
                activity_data["section_history_id"] = rows[0]['section_history_id']
            if(len(regenerate_claim_section_history)>0 and 'section_history_id' in regenerate_claim_section_history[0]):
                section_data["regenerate_claim_section_history_id"] = regenerate_claim_section_history[0]['section_history_id']

            if(len(rows)>0 and 'section_history_id' in rows[0]):
                print(4,section_history_id)
                section_history_id = rows[0]['section_history_id']
                db_id['section_history_id'] = section_history_id
                section_data['section_history_id'] = section_history_id
                if(section == 'regenerate_claim'):
                    section_data['regenerate_claim_section_history_id'] = section_history_id
            rows = db.execute({"query": "update_sections",
                            "values": section_data
                            })
            if(len(list_of_figures_text)>10):
                section_data['text'] = list_of_figures_text
                section_data['section_type'] = f'{section} list_of_figures_text'
                rows = db.execute({"query": "update_sections",
                            "values": section_data
                })
            if(len(detailed_description_figures_text)>10):
                section_data['text'] = detailed_description_figures_text
                section_data['section_type'] = f'{section} text'
                rows = db.execute({"query": "update_sections",
                            "values": section_data
                })
            # if (len(section_history_row)==0 or len(rows) > 0 and 'section_history_id' not in rows[0] ):
            #     if (section in ['flowchart_diagram','block_diagram']):
            #         rows = db.execute({"query": "update_figures_section_history",
            #             "values": diagram_data
            #         })
            #     elif (section in ['embodiments_flowchart_figures','embodiments_flowchart_description_figures','embodiments_block_diagram','embodiments_block_diagram_description']):
            #         if('section_history_id' in embodiments_figures_data):
            #             del embodiments_figures_data['section_history_id']
            #         rows = db.execute({"query": "update_embodiments_figures_section_history",
            #                            "values": embodiments_figures_data
            #                            })
            #     else:
            #         rows = db.execute({"query": "update_section_history",
            #             "values": section_history_value
            #         })
            print(5,section_history_id)
            if(is_error=='Error'):
                if (prev_section_history_id_selected is not None):
                    if (section == 'flowchart_diagram'):
                        db.execute({"query": "update_figures_section_history",
                                "values": {
                                    "section_history_id": prev_section_history_id_selected,
                                    "section_type": section,
                                    "is_selected": True
                                }
                            })
                    else:
                        db.execute({"query": "update_section_history",
                                    "values": {
                                        "section_history_id": prev_section_history_id_selected,
                                        "section_type": section,
                                        "is_selected": True
                                    }
                                    })
            else:
                if (prev_section_history_id_selected is not None and redraft and len(rows)>0):
                    if (section == 'flowchart_diagram'):
                        db.execute({"query": "update_figures_section_history",
                                    "values": {
                                        "section_history_id": prev_section_history_id_selected,
                                        "section_type": section,
                                        "is_selected": False
                                    }
                                })
                    else:
                        db.execute({"query": "update_section_history",
                                    "values": {
                                        "section_history_id": prev_section_history_id_selected,
                                        "section_type": section,
                                        "is_selected": False
                                    }
                                    })
                if (redraft and len(rows)>0):
                    if (section in ['flowchart_diagram','block_diagram']):
                        db.execute({"query": "update_figures_section_history",
                                    "values": {
                                        "section_history_id": section_history_id,
                                        "section_type": section,
                                        "is_selected": True
                                    }
                                })
                    elif(section == 'embodiments_figures'):
                        db.execute({"query": "update_embodiments_figures_section_history",
                                    "values": {
                                        "section_history_id": section_history_id,
                                        "section_type": section,
                                        "is_selected": True
                                    }
                                })
                    elif(section == 'embodiments_figures'):
                        db.execute({"query": "update_embodiments_figures_section_history",
                                    "values": {
                                        "section_history_id": rows[0]['section_history_id'],
                                        "section_type": section,
                                        "is_selected": True
                                    }
                                })
                    elif(section == 'embodiments_figures'):
                        db.execute({"query": "update_embodiments_figures_section_history",
                                    "values": {
                                        "section_history_id": rows[0]['section_history_id'],
                                        "section_type": section,
                                        "is_selected": True
                                    }
                                })
                    elif(section == 'embodiments_figures'):
                        db.execute({"query": "update_embodiments_figures_section_history",
                                    "values": {
                                        "section_history_id": rows[0]['section_history_id'],
                                        "section_type": section,
                                        "is_selected": True
                                    }
                                })
                    else:
                        db.execute({"query": "update_section_history",
                                    "values": {
                                        "section_history_id": section_history_id,
                                        "section_type": section,
                                        "is_selected": True
                                    }
                                    })
            if(len(rows)>0 and 'section_history_id' in rows[0]):
                db_id['section_history_id'] = rows[0]['section_history_id']
            if (section == 'list_of_figures'):
                list_of_figure_data = db.execute({
                    "query": "select_one_sections",
                    "values": {
                        "sh.section_type": "list_of_figures",
                        "sh.project_id": project_id
                    }
                })
                if (list_of_figure_data[0]['is_error']=="Error"):
                    db.execute({
                        "query": "update_sections",
                        "values": {
                            "section_type": "detailed_description_figures",
                            "project_id": project_id,
                            "is_error": list_of_figure_data[0]['is_error'],
                            "text":''
                        }
                    })
        section_row_data = db.execute({
            "query": "select_one_sections",
            "values": {
                "sh.project_id": project_id
            }
        })
        if (len(section_row_data)==10):
            patent_drafted = True
        section_history_row_data = db.execute({
            "query": "select_section_history_for_redraft",
            "values": {
                "project_id": project_id,
                "is_error" : "Success"
            }
        })
        if section_history_row_data and 'drafted_count' in section_history_row_data[0] and section_history_row_data[0]['drafted_count'] >= 2:
            patent_redrafted = True
        if section == "detailed_description_figures":
            rows = db.execute({
                "query": "update_project",
                "values": {
                    "is_inserted": True,
                    "project_id": project_id
                }
            })
        status = "Success"
        status_code = ""
        status_message = f"Updated {section}"
    except Exception as e:
        status = "Error"
        status_code = ""
        status_message = "Technical issue with the application"
        print("Error @update_db_section_changes", e)
    try:
        section_history_details = db.execute({
                "query": "select_section_history",
                "values": {
                    "section_history_id": db_id['section_history_id'],
                }
            })
        if pid and section_history_details[0]['prev_section_history_id'] is None:
            db.execute({"query": "update_section_history",
                "values": {
                    "section_history_id":  db_id['section_history_id'],
                    "prev_section_history_id":  db_id['section_history_id']
                }
            })
        if(clm_step==2 and section=='Claims'):
            db.execute({"query": "update_reports_activity",
                        "values": activity_data
            })
        elif (clm_step == 3 and section == 'flowchart_diagram'):
            db.execute({"query": "update_reports_activity",
                "values": activity_data
            })
        elif (section != 'Claims' and section != 'flowchart_diagram'):
            db.execute({"query": "update_reports_activity",
                        "values": activity_data
            })
        if (patent_redrafted):
            activity_data["activity"] = 'Patent ReDrafted'
            activity_data["section_type"] = None
            activity_data["section_history_id"] = None
            db.execute({"query": "update_reports_activity",
                        "values": activity_data
                        })
        if (patent_drafted):
            activity_data["activity"] = 'Patent Drafted'
            activity_data["section_type"] = None
            activity_data["section_history_id"] = None
            db.execute({"query": "update_reports_activity",
                        "values": activity_data
            })
    except:
        pass
    return status, status_code, status_message, db_id


def get_section_text(project_id, section_type):
    """
    Get the text of a section from the database.

    Args:
        project_id (int): The ID of the project.
        section_type (str): The type of section.

    Returns:
        str: The text of the section.
    """
    try:
        rows = db.execute({
            "query": "select_one_sections",
            "values": {
                "sh.project_id": project_id,
                "sh.section_type": section_type
            }
        })
        return rows[0]['text']
    except Exception as e:
        return ""


def get_section_history_text(section_history_id, req_data):
    """
    Get the text of a section history from the database.

    Args:
        section_history_id (int): The ID of the section history.

    Returns:
        str: The text of the section history.
    """
    try:
        rows = db.execute({
            "query": "select_section_history_internal",
            "values": {
                "section_history_id": section_history_id
            }
        })
    except Exception as e:
        return db_format_response(
            "", "Error", "ignore", f"{str(e)}")
    if (req_data == 'text'):
        return rows[0]['text']
    if (req_data == 'project_history_id'):
        return rows[0]['project_history_id']
    return rows


def get_prior_art_val(project_history_id):
    """
    Get the prior art value from the database.

    Args:
        project_history_id (int): The ID of the project history.

    Returns:
        str: The prior art value.
    """
    try:
        rows = db.execute({
            "query": "select_project_history",
            "values": {
                "project_history_id": project_history_id
            }
        })
    except Exception as e:
        return db_format_response(
            "", "Error", "ignore", f"{str(e)}")
    first_claim = ''
    if rows[0]['prior_art_analysis'] is not None:
        for i in range(0, len(rows[0]['prior_art_analysis'])):
            first_claim = first_claim + \
                str(rows[0]['prior_art_analysis'][i]['first_claim'])
    return first_claim


def get_diagram_text(claim_section_history_id,section_type):
    """
    Get the prior art value from the database.

    Args:
        project_history_id (int): The ID of the project history.

    Returns:
        str: The prior art value.
    """
    try:
        rows = db.execute({
            "query": "figures_based_on_same_claim",
            "values": {
                "claim_section_history_id": claim_section_history_id,
                "section_type": section_type,
                "is_error" : "Success",
                "diagram_available": False
            }
        })
        return rows
    except Exception as e:
        return db_format_response(
            "", "Error", "ignore", f"{str(e)}")
    


def get_prompt_generated_text(section_history_id,section_type,project_id,step_completed=1,is_section_history_id_need = False):
    try:
        select_query = "select_section_history_internal"
        if section_type in ['block_diagram','flowchart_diagram']:
            select_query = "select_figures_section_history_internal"
        if(section_type in ['embodiments_flowchart_figures','embodiments_flowchart_description_figures','embodiments_block_diagram','embodiments_block_diagram_description']):
            select_query = "select_embodiments_figures_internal"
        if section_history_id == '':
            section_history_id = None
        if section_history_id is None and is_section_history_id_need:
            rows = db.execute({
                "query": select_query,
                "values": {
                    "section_type": section_type,
                    "step_completed" : step_completed,
                    "project_id": project_id
                }
            })
            if(len(rows)>0):
                section_history_id = rows[0]['section_history_id']
        rows = None
        if section_history_id is not None:
            if(section_type in ['embodiments_flowchart_figures','embodiments_flowchart_description_figures','embodiments_block_diagram','embodiments_block_diagram_description']):
                rows = db.execute({
                    "query": select_query,
                    "values": {
                        "section_history_id": section_history_id,
                        "section_type": section_type,
                        "step_completed":step_completed
                    }
                })
            else:
                rows = db.execute({
                    "query": select_query,
                    "values": {
                        "section_history_id": section_history_id,
                        "section_type": section_type
                    }
                })
        if(rows is not None and len(rows)>0 and type(rows)==list):
            rows=rows[0]
        else:
            rows=[]
        return rows
    
    except Exception as e:
        print(e)
        return 'Error'
    
def figure_description(prompt, generated_text, section_history_id, project_history_id, section_type, pid, id, type, invention, system_instructions, instructions_for_drafting, prompt_instructions, section_instructions, prior_art, template_instruction, ending_prompt_instructions, is_incremental, redraft, invention_disclosure):
    for _ in range(0, 2):
        first_step_api_status, first_step_api_status_code, first_step_api_status_message = '','',''
        first_messages = {}
        first_generated_text = ''
        pattern = ''
        extracted_text = "figure_description not found"

        first_messages, first_generated_text, first_step_api_status, first_step_api_status_code, first_step_api_status_message, usage = request_openai(
                    '','','','',id,'',section_type, invention,'', '', '', '', '', '', '', is_incremental,'', prior_art_val, '',generated_text,1, prompt)
        if(first_step_api_status=="Success"):
            text = first_generated_text
            text = text.strip()
            
            f_pattern = r'^Step 22:(?P<flowchart_desc>.*?)(?:Step 23:|$)'
            f_match = re.search(f_pattern, text, re.DOTALL)

            b_pattern = r'^Step 25:(?P<blockdiagram_desc>.*?)(?:Step 26:|$)'
            b_match = re.search(b_pattern, text, re.DOTALL)

            if f_match and f_match.group("flowchart_desc"):
                extracted_content = f_match.group("flowchart_desc").replace('==Description==', '').strip()
            elif b_match and b_match.group("blockdiagram_desc"):
                extracted_content = b_match.group("blockdiagram_desc").replace('==Description==', '').strip()
            else:
                extracted_content = texttext = first_generated_text
            text = text.strip()
            
            f_pattern = r'^Step 22:(?P<flowchart_desc>.*?)(?:Step 23:|$)'
            f_match = re.search(f_pattern, text, re.DOTALL)

            b_pattern = r'^Step 25:(?P<blockdiagram_desc>.*?)(?:Step 26:|$)'
            b_match = re.search(b_pattern, text, re.DOTALL)

            if f_match and f_match.group("flowchart_desc"):
                extracted_content = f_match.group("flowchart_desc").replace('==Description==', '').strip()
            elif b_match and b_match.group("blockdiagram_desc"):
                extracted_content = b_match.group("blockdiagram_desc").replace('==Description==', '').strip()
            else:
                extracted_content = text.replace('==Description==', '').strip()
        else:
            if env != 'dev':
                    time.sleep(30)
        return extracted_content, first_generated_text, first_messages


def generated_diagram(regenerate_claim_section_history_id,claim_data, section_history_id, project_history_id, section_type, pid, id, type, invention, system_instructions, instructions_for_drafting, prompt_instructions, section_instructions, prior_art, template_instruction, ending_prompt_instructions, is_incremental, redraft, invention_disclosure, claim_section_history_id):
    for _ in range(0, 2):
        first_step_api_status, first_step_api_status_code, first_step_api_status_message = '', '', ''
        second_step_api_status, second_step_api_status_code, second_step_api_status_message = '', '', ''
        db_status, db_status_code, db_status_message = '', '', ''
        first_messages = ''
        first_generated_text = ''
        second_messages = ''
        second_generated_text = ''
        sections_id = {}
        usage = {'completion_tokens':0, 'prompt_tokens':0, 'total_tokens':0}
        db_data = []
        brief_description = ''
        prev_messages = ''
        api_status = "Error"
        is_block_diagram_ready = False
        claim_type = 'method'
        claim_type_reg = 'Flow'
        generalized_entities, entity_action, alternative_entity_name = '','','' 
        if section_type == 'block_diagram':
            claim_type = 'system'
            claim_type_reg = 'Block'
        is_step1_completed = False
        json_data, details = {}, {}
        def convert_to_json(text):
            json_data, details =  convert_text_to_json(text, extract_figure_brief_description_and_mermaid, extract_figure_brief_description_and_mermaid_fun)
            extracted_values = details            
            return json_data, extracted_values

        
        db_data = get_prompt_generated_text(
            section_history_id, f'{section_type}', id, 0,True)
        if 'section_history_id' in db_data:
            section_history_id = db_data['section_history_id']
        if 'is_error' in db_data:
            api_status = db_data['is_error']
        if 'response_step1' in db_data:
            first_generated_text = db_data['response_step1']
            if first_generated_text is not None and f'@@@no {claim_type} claim@@@' in first_generated_text.lower():
                api_status == "Error"
                db_data = {}
                is_step1_completed = False
            else:
                is_step1_completed = True
        if api_status and api_status == "Error":
            if is_step1_completed == True:
                api_status = "Success"
            else:
                if (len(str(invention_disclosure).strip()) > 0):
                    db_data = get_prompt_generated_text(
                        section_history_id, f'{section_type}', id,0,True)
                    if 'section_history_id' in db_data:
                        sections_id['section_history_id'] = db_data['section_history_id']
                    if 'response_step1' in db_data:
                        first_generated_text = db_data['response_step1']
                        if f'@@@no {claim_type} claim@@@' in first_generated_text.lower():
                            api_status == "Error"
                            db_data = {}
                if ((len(db_data) > 0 and db_data['response_step1'] is not None)):
                    api_status = db_data['is_error']
                if (api_status == "Error" and (len(db_data) == 0 or (len(db_data) > 0 and (db_data['response_step1'] is None or db_data['response_step1'] == '')))):
                    regenerate_claim_data = get_section_history_text(
                        section_history_id=regenerate_claim_section_history_id, req_data='')
                    prev_messages = regenerate_claim_data[0]['messages']
                    claim_data = regenerate_claim_data[0]['text']
                    entity_text_data = get_section_history_text(claim_section_history_id,'')
                    if(len(entity_text_data)>0):
                        generalized_entities = entity_text_data[0]['generalized_entities']
                        entity_action = entity_text_data[0]['entity_action']
                        alternative_entity_name = entity_text_data[0]['alternative_entity_name']
                    first_messages, first_generated_text, first_step_api_status, first_step_api_status_code, first_step_api_status_message, usage = request_openai(
                        '',generalized_entities, entity_action, alternative_entity_name,id, claim_data, type, invention, system_instructions, instructions_for_drafting, prompt_instructions, section_instructions, prior_art, template_instruction, ending_prompt_instructions, is_incremental, '', prior_art_val, '', '', 1, prev_messages)
                    first_step_api_status_code = f"{section_type}_fail"
                    db_status, db_status_code, db_status_message, sections_id = update_db_section_changes(
                       json_data, details,'','', '', '',  claim_section_history_id, usage, first_messages, first_generated_text, '', '', prompt_instructions, project_history_id, redraft, section_history_id=section_history_id, section=section_type, id=id, pid=pid, results='', messages='', action_source="prompt", is_error=first_step_api_status, message=first_step_api_status_message, message_code=first_step_api_status_code, clm_step=1)
                    if 'section_history_id' in sections_id:
                        section_history_id = sections_id["section_history_id"]
                    api_status = first_step_api_status
                else:
                    api_status = "Success"    
        db_data = get_prompt_generated_text(
            section_history_id, f'{section_type}', id,0, False)
        if api_status == "Success":
            if (len(db_data) > 0 and db_data['response_step1'] is not None and (db_data['response_step2'] is None or db_data['response_step2'] == '')):
                api_status = db_data['is_error']
            if (api_status == "Error" or (len(db_data) > 0 and db_data['response_step1'] is not None and (db_data['response_step2'] is None or db_data['response_step2'] == ''))):
                prev_messages = db_data['prompt_step1']
                first_generated_text = db_data['response_step1']
                if f'@@@no {claim_type} claim@@@' not in first_generated_text.lower():
                    second_messages, second_generated_text, second_step_api_status, second_step_api_status_code, second_step_api_status_message, usage = request_openai(
                       '','','','', id, '', type, invention, system_instructions, instructions_for_drafting, prompt_instructions, section_instructions, prior_art, template_instruction, ending_prompt_instructions, is_incremental, '', prior_art_val, first_generated_text, first_generated_text, 2, prev_messages=prev_messages)
                    json_data, details = convert_to_json(second_generated_text)
                    if details is None or  details[f"mermaid"] == '':
                        details = {}
                        db_data = []
                        second_step_api_status = "Error"
                        second_step_api_status_code = f"{section_type}_fail"
                        second_step_api_status_message = ""
                    else:
                        brief_description = details['brief description']
                        second_generated_text = details[f"mermaid"]
                        is_block_diagram_ready = True
                elif f'@@@no {claim_type} claim@@@' in first_generated_text.lower():
                    details = {
                        f"is {section_type} diagram": "",
                        f"mermaid": "",
                        "brief description": "",
                    }
                    second_step_api_status = "Error"
                    second_step_api_status_code = f"{section_type}_fail"
                    second_step_api_status_message = ""
                    second_messages, second_generated_text, second_step_api_status, second_step_api_status_code, second_step_api_status_message, usage = first_messages, first_generated_text, first_step_api_status, first_step_api_status_code, first_step_api_status_message, usage
                    is_block_diagram_ready = True
                else:
                    details = {}
                    db_data = []
                    second_step_api_status = "Error"
                    second_step_api_status_code = f"{section_type}_fail"
                    second_step_api_status_message = ""
                    first_generated_text = f'failed to generate {section_type} from chatgpt'
                if(len(details)==0):
                    details = {
                        f"is {section_type} diagram": "",
                        f"mermaid": "",
                        "brief description": "",
                    }
                for field, db_section_type in {f"mermaid": f"{section_type}", "brief description": "list_of_figures"}.items():
                    if field in details:
                        db_status, db_status_code, db_status_message, sections_id = update_db_section_changes(
                            json_data, details,'','',brief_description, '', claim_section_history_id, usage, first_messages, first_generated_text, second_messages, second_generated_text,  prompt_instructions, project_history_id, redraft, section_history_id=section_history_id, section=db_section_type, id=id, pid=pid, results=details[field], messages=second_messages, action_source="prompt", is_error=second_step_api_status, message=second_step_api_status_message, message_code=second_step_api_status_code, clm_step=2)
                    if field == f"{section_type}":
                        second_generated_text = details[field]
                if f"mermaid" in details and details[f"mermaid"] is not None:
                    api_status = second_step_api_status
                    db_data = get_prompt_generated_text(
                        section_history_id, f'{section_type}', id,0,False)
        if is_block_diagram_ready == True:
            break
        else:
            if env != 'dev':
                time.sleep(30)
    db_data = get_prompt_generated_text(
            section_history_id, f'{section_type}', id,0,False)
    if api_status == "Error" and db_data and len(db_data) == 0:
        second_step_api_status = api_status
        second_step_api_status_code = f"{section_type}_fail"
        second_step_api_status_message = ""
    elif api_status == "Success" and (len(db_data) > 0 and db_data['prompt_step1'] is not None and db_data['prompt_step2'] is not None):
        second_step_api_status = db_data['is_error']
        second_step_api_status_code = db_data['message']
        second_step_api_status_message = db_data['message_long']
    else:
        second_step_api_status = "Error"
        second_step_api_status_code = f"{section_type}_fail"
        second_step_api_status_message = ""
    return draft_format_response(type, second_generated_text, id, sections_id, section_history_id, second_step_api_status, second_step_api_status_code, second_step_api_status_message, db_status, db_status_code, db_status_message)

def embodiments_flowchart_figures(regenerate_claim_section_history_id,claim_data, section_history_id, project_history_id, section_type, pid, id, type, invention, system_instructions, instructions_for_drafting, prompt_instructions, section_instructions, prior_art, template_instruction, ending_prompt_instructions, is_incremental, redraft, invention_disclosure, claim_section_history_id):
    for _ in range(0, 1):
        first_step_api_status, first_step_api_status_code, first_step_api_status_message = '', '', ''
        next_step_api_status, next_step_api_status_code, next_step_api_status_message = '', '', ''
        db_status, db_status_code, db_status_message = '', '', ''
        first_messages = ''
        first_generated_text = ''
        next_step_messages = ''
        next_step_generated_text = ''
        sections_id = {}
        usage = {'completion_tokens':0, 'prompt_tokens':0, 'total_tokens':0}
        db_data = []
        brief_description = ''
        prev_messages = ''
        api_status = "Error"
        is_block_diagram_ready = False
        claim_type = 'method'
        claim_type_reg = 'Flow'
        entity_api_status,entity_db_status = 'Error', 'Error'
        generalized_entities, entity_action, alternative_entity_name = '','','' 
        if section_type == 'block_diagram':
            claim_type = 'system'
            claim_type_reg = 'Block'
        is_step1_completed = False
        json_data, details = {}, {}
        def convert_to_json(text):
            json_data, details =  convert_text_to_json(text, extract_figure_brief_description_and_mermaid, extract_figure_brief_description_and_mermaid_fun)
            extracted_values = details
            if extracted_values is None:
                extracted_values = {
                    'brief description': "",
                    'mermaid': ""
                }
            return json_data, extracted_values

        flowchart_data = get_diagram_text(claim_section_history_id,'flowchart_diagram')
        if(len(flowchart_data)>0 and 'section_type' in flowchart_data[0] and flowchart_data[0]['section_type']=='flowchart_diagram'):
            api_status = 'Success'
            db_status, db_status_code, db_status_message, sections_id = update_db_section_changes(
            '', '','', '', '', '',  claim_section_history_id, usage, '', '', '', '', prompt_instructions, project_history_id, redraft, section_history_id=section_history_id, section=section_type, id=id, pid=pid, results='', messages='', action_source="prompt", is_error=api_status, message=next_step_api_status_message, message_code=next_step_api_status_code, clm_step=7)        
        else: 
            regenerate_claim_data = get_section_history_text(
                        section_history_id=regenerate_claim_section_history_id, req_data='')
            claim_data = get_section_history_text(
                section_history_id=regenerate_claim_section_history_id, req_data='')
            prev_messages = regenerate_claim_data[0]['messages']
            claim_data = regenerate_claim_data[0]['text']
            entity_text_data = get_section_history_text(claim_section_history_id,'')
            if(len(entity_text_data)>0 and ('generalized_entities' in entity_text_data[0]) and (entity_text_data[0]['generalized_entities'] == None or len(entity_text_data[0]['generalized_entities'])==0  or entity_text_data[0]['generalized_entities'] == 'Not Available')):
                invention = _get_invention_title({}, id)
                entity_api_status,entity_db_status = entity_for_old_project(claim_section_history_id, project_history_id,'Claims', pid, id, 'Claims', invention, system_instructions, instructions_for_drafting, prompt_instructions, section_instructions, prior_art, template_instruction, ending_prompt_instructions, is_incremental, redraft, invention_disclosure)
                entity_text_data = get_section_history_text(claim_section_history_id,'')
            else:    
                first_step_api_status = 'Success'
            if(first_step_api_status == 'Success' or (len(entity_text_data)>0 and entity_api_status == 'Success' and entity_db_status == 'Success')):
                generalized_entities = entity_text_data[0]['generalized_entities']
                entity_action = entity_text_data[0]['entity_action']
                alternative_entity_name = entity_text_data[0]['alternative_entity_name']
                necessary_features = entity_text_data[0]['necessary_features']
                first_messages, first_generated_text, first_step_api_status, first_step_api_status_code, first_step_api_status_message, usage = request_openai(
                    necessary_features,generalized_entities, entity_action,alternative_entity_name ,id, claim_data, type, invention, system_instructions, instructions_for_drafting, prompt_instructions, section_instructions, prior_art, template_instruction, ending_prompt_instructions, is_incremental, '', prior_art_val, '', '', 1, prev_messages)
                db_status, db_status_code, db_status_message, sections_id = update_db_section_changes(
                        json_data, details,'', '', '', '',  claim_section_history_id, usage, first_messages, first_generated_text, '', '', prompt_instructions, project_history_id, redraft, section_history_id=section_history_id, section=section_type, id=id, pid=pid, results='', messages='', action_source="prompt", is_error=first_step_api_status, message=first_step_api_status_message, message_code=first_step_api_status_code, clm_step=1)

            if(first_step_api_status=='Success'):
                for i in range(2,8):
                    db_data = get_prompt_generated_text(section_history_id, f'{section_type}', id, i-1,True)
                    prev_messages = db_data['prompt_step1']
                    previous_generated_text = db_data['response_step1']
                    next_step_messages, next_step_generated_text, next_step_api_status, next_step_api_status_code, next_step_api_status_message, usage = request_openai(
                    '','', '', '',id, claim_data, type, invention, system_instructions, instructions_for_drafting, prompt_instructions, section_instructions, prior_art, template_instruction, ending_prompt_instructions, is_incremental, '', prior_art_val, '', previous_generated_text, i, prev_messages)
                    if(i != 7):
                        db_status, db_status_code, db_status_message, sections_id = update_db_section_changes(
                        json_data, details,'', '', '', '',  claim_section_history_id, usage, first_messages, first_generated_text, next_step_messages, next_step_generated_text, prompt_instructions, project_history_id, redraft, section_history_id=section_history_id, section=section_type, id=id, pid=pid, results='', messages='', action_source="prompt", is_error=first_step_api_status, message=first_step_api_status_message, message_code=first_step_api_status_code, clm_step=i)
                    else:
                        json_data, details = convert_to_json(next_step_generated_text)
                        if(details is not None):
                            db_status, db_status_code, db_status_message, sections_id = update_db_section_changes(
                                json_data, details,'', '', details['brief description'], '',  claim_section_history_id, usage, first_messages, first_generated_text, next_step_messages, next_step_generated_text, prompt_instructions, project_history_id, redraft, section_history_id=section_history_id, section=section_type, id=id, pid=pid, results=details['mermaid'], messages=next_step_messages, action_source="prompt", is_error=first_step_api_status, message=first_step_api_status_message, message_code=first_step_api_status_code, clm_step=i)
                        else:
                            next_step_api_status = "Error"
                            db_status, db_status_code, db_status_message, sections_id = update_db_section_changes(
                                json_data, details,'', '', details['brief description'], '',  claim_section_history_id, usage, first_messages, first_generated_text, next_step_messages, next_step_generated_text, prompt_instructions, project_history_id, redraft, section_history_id=section_history_id, section=section_type, id=id, pid=pid, results=details['mermaid'], messages=next_step_messages, action_source="prompt", is_error=first_step_api_status, message=first_step_api_status_message, message_code=first_step_api_status_code, clm_step=i)
        db_data = get_prompt_generated_text(section_history_id, f'{section_type}', id, 7, True) 
        if next_step_api_status == "Error":
            next_step_api_status = api_status
            next_step_api_status_code = "embodiments_flowchart_fail"
            next_step_api_status_message = ""
        elif next_step_api_status == "Success":
            next_step_api_status = 'Success'
            next_step_api_status_code = db_data['message']
            next_step_api_status_message = db_data['message_long']
        
    return draft_format_response(type, next_step_generated_text, id, sections_id, section_history_id, next_step_api_status, next_step_api_status_code, next_step_api_status_message, db_status, db_status_code, db_status_message)

def embodiments_flowchart_description_figures(regenerate_claim_section_history_id,claim_data, section_history_id, project_history_id, section_type, pid, id, type, invention, system_instructions, instructions_for_drafting, prompt_instructions, section_instructions, prior_art, template_instruction, ending_prompt_instructions, is_incremental, redraft, invention_disclosure, claim_section_history_id):
    for _ in range(0, 1):
        first_step_api_status, first_step_api_status_code, first_step_api_status_message = '', '', ''
        next_step_api_status, next_step_api_status_code, next_step_api_status_message = '', '', ''
        db_status, db_status_code, db_status_message = '', '', ''
        first_messages = ''
        first_generated_text = ''
        next_step_messages = ''
        next_step_generated_text = ''
        sections_id = {}
        usage = {'completion_tokens':0, 'prompt_tokens':0, 'total_tokens':0}
        db_data = []
        brief_description = ''
        prev_messages = ''
        api_status = "Error"
        is_block_diagram_ready = False
        claim_type = 'method'
        claim_type_reg = 'Flow'
        embodiments_figures_db_data = {}
        mermaid_text = ''
        brief_description = ''
        generalized_entities, entity_action, alternative_entity_name = '','','' 
        if section_type == 'block_diagram':
            claim_type = 'system'
            claim_type_reg = 'Block'
        is_step1_completed = False 
        json_data, details = {}, {}
        def convert_to_json(text):
            description_text = "not available"
            description_text = text.replace('==Description==','').strip()
            return description_text

        flowchart_data = get_diagram_text(claim_section_history_id,'flowchart_diagram')
        if(len(flowchart_data)>0 and 'section_type' in flowchart_data[0] and flowchart_data[0]['section_type']=='flowchart_diagram'):
            api_status = 'Success'
            db_status, db_status_code, db_status_message, sections_id = update_db_section_changes(
            '', '','', '', '', '',  claim_section_history_id, usage, '', '', '', '', prompt_instructions, project_history_id, redraft, section_history_id=section_history_id, section=section_type, id=id, pid=pid, results='', messages='', action_source="prompt", is_error=api_status, message=next_step_api_status_message, message_code=next_step_api_status_code, clm_step=8)
        else: 
            db_data = get_prompt_generated_text(section_history_id,'embodiments_flowchart_figures', id, 7,True)
            prev_messages = db_data['prompt_step1']
            previous_generated_text = db_data['response_step1']
            for i in range(8,9):
                if(i!=8):
                    db_data = get_prompt_generated_text(section_history_id, 'embodiments_figures_description', id, i-1,True)
                    if('prompt_step1' in db_data):
                        prev_messages = db_data['prompt_step1']
                    if('response_step1' in db_data):
                        previous_generated_text = db_data['response_step1']
                next_step_messages, next_step_generated_text, next_step_api_status, next_step_api_status_code, next_step_api_status_message, usage = request_openai(
                    '','', '', '',id, claim_data, type, invention, system_instructions, instructions_for_drafting, prompt_instructions, section_instructions, prior_art, template_instruction, ending_prompt_instructions, is_incremental, '', prior_art_val, '', previous_generated_text, i, prev_messages)
            details = convert_to_json(next_step_generated_text)
            if(details is not None):
                db_status, db_status_code, db_status_message, sections_id = update_db_section_changes(
                        json_data, details,'','', brief_description, details,  claim_section_history_id, usage, first_messages, first_generated_text, next_step_messages, next_step_generated_text, prompt_instructions, project_history_id, redraft, section_history_id=section_history_id, section=section_type, id=id, pid=pid, results=mermaid_text, messages=next_step_messages, action_source="prompt", is_error=next_step_api_status, message=next_step_api_status_message, message_code=next_step_api_status_code, clm_step=i)
            else:
                api_status = 'Error'
            api_status = next_step_api_status
        db_data = get_prompt_generated_text(section_history_id, f'{section_type}', id, 8,True)
                    
        if api_status == "Error":
            next_step_api_status = api_status
            next_step_api_status_code = "embodiments_flowchart_fail"
            next_step_api_status_message = ""
        elif api_status == "Success" :
            next_step_api_status = 'Success'
            next_step_api_status_code = db_data['message']
            next_step_api_status_message = db_data['message_long']
        
        return draft_format_response(type, next_step_generated_text, id, sections_id, section_history_id, next_step_api_status, next_step_api_status_code, next_step_api_status_message, db_status, db_status_code, db_status_message)


def embodiments_block_diagram(regenerate_claim_section_history_id,claim_data, section_history_id, project_history_id, section_type, pid, id, type, invention, system_instructions, instructions_for_drafting, prompt_instructions, section_instructions, prior_art, template_instruction, ending_prompt_instructions, is_incremental, redraft, invention_disclosure, claim_section_history_id):
    for _ in range(0, 1):
        first_step_api_status, first_step_api_status_code, first_step_api_status_message = '', '', ''
        next_step_api_status, next_step_api_status_code, next_step_api_status_message = 'Error', '', ''
        db_status, db_status_code, db_status_message = '', '', ''
        first_messages = ''
        first_generated_text = ''
        next_step_messages = ''
        next_step_generated_text = ''
        sections_id = {}
        usage = {'completion_tokens':0, 'prompt_tokens':0, 'total_tokens':0}
        db_data = []
        brief_description = ''
        prev_messages = ''
        api_status = "Error"
        is_block_diagram_ready = False
        claim_type = 'method'
        claim_type_reg = 'Flow'
        generalized_entities, entity_action, alternative_entity_name = '','','' 
        if section_type == 'block_diagram':
            claim_type = 'system'
            claim_type_reg = 'Block'
        is_step1_completed = False
        json_data, details = {}, {}
        def convert_to_json(text):
            json_data, details =  convert_text_to_json(text, extract_figure_brief_description_and_mermaid, extract_figure_brief_description_and_mermaid_fun)
            extracted_values = details
            if extracted_values is None:
                extracted_values = {
                    'brief description': "",
                    'mermaid': ""
                }
            return json_data, extracted_values

        block_diagram_data = get_diagram_text(claim_section_history_id,'block_diagram')
        if(len(block_diagram_data)>0 and 'section_type' in block_diagram_data[0] and block_diagram_data[0]['section_type']=='block_diagram'):
            next_step_api_status = 'Success'
            db_status, db_status_code, db_status_message, sections_id = update_db_section_changes(
            '', '','', '', '', '',  claim_section_history_id, usage, '', '', '', '', prompt_instructions, project_history_id, redraft, section_history_id=section_history_id, section=section_type, id=id, pid=pid, results='', messages='', action_source="prompt", is_error=next_step_api_status, message=next_step_api_status_message, message_code=next_step_api_status_code, clm_step=10)
        if(next_step_api_status=='Error'):
            db_data = get_prompt_generated_text(section_history_id,'embodiments_flowchart_description_figures', id, 8,True)
            prev_messages = db_data['prompt_step1']
            previous_generated_text = db_data['response_step1']
            for i in range(9,11):
                if(i!=9):
                    db_data = get_prompt_generated_text(section_history_id, f'{section_type}', id, i-1,True)
                    prev_messages = db_data['prompt_step1']
                    previous_generated_text = db_data['response_step1']
                
                next_step_messages, next_step_generated_text, next_step_api_status, next_step_api_status_code, next_step_api_status_message, usage = request_openai(
                '','', '', '',id, claim_data, type, invention, system_instructions, instructions_for_drafting, prompt_instructions, section_instructions, prior_art, template_instruction, ending_prompt_instructions, is_incremental, '', prior_art_val, '', previous_generated_text, i, prev_messages)
                if(i==10):
                    json_data,details = convert_to_json(next_step_generated_text)
                    if(details is not None):
                        db_status, db_status_code, db_status_message, sections_id = update_db_section_changes(
                            json_data, details,'', '', details['brief description'], '',  claim_section_history_id, usage, next_step_messages, next_step_generated_text, next_step_messages, next_step_generated_text, prompt_instructions, project_history_id, redraft, section_history_id=section_history_id, section=section_type, id=id, pid=pid, results=details['mermaid'], messages=next_step_messages, action_source="prompt", is_error=next_step_api_status, message=next_step_api_status_message, message_code=next_step_api_status_code, clm_step=i)
                    else:
                        next_step_api_status = 'Error'
                else:
                    db_status, db_status_code, db_status_message, sections_id = update_db_section_changes(
                    json_data, details,'', '', '', '',  claim_section_history_id, usage, next_step_messages, next_step_generated_text, next_step_messages, next_step_generated_text, prompt_instructions, project_history_id, redraft, section_history_id=section_history_id, section=section_type, id=id, pid=pid, results='', messages='', action_source="prompt", is_error=next_step_api_status, message=next_step_api_status_message, message_code=next_step_api_status_code, clm_step=i)
        db_data = get_prompt_generated_text(section_history_id, f'{section_type}', id, 10, True)
                    
        if next_step_api_status == "Error":
            next_step_api_status = 'Error'
            next_step_api_status_code = "embodiments_block_diagram_fail"
            next_step_api_status_message = ""
        elif next_step_api_status == "Success" :
            next_step_api_status = 'Success'
            if 'message' in db_data:
                next_step_api_status_code = db_data['message']
                next_step_api_status_message = db_data['message_long']
            else:
                next_step_api_status_code = ""
                next_step_api_status_message = ""
    return draft_format_response(type, next_step_generated_text, id, sections_id, section_history_id, next_step_api_status, next_step_api_status_code, next_step_api_status_message, db_status, db_status_code, db_status_message)

def embodiments_block_diagram_description(regenerate_claim_section_history_id,claim_data, section_history_id, project_history_id, section_type, pid, id, type, invention, system_instructions, instructions_for_drafting, prompt_instructions, section_instructions, prior_art, template_instruction, ending_prompt_instructions, is_incremental, redraft, invention_disclosure, claim_section_history_id):
    for _ in range(0, 1):
        first_step_api_status, first_step_api_status_code, first_step_api_status_message = '', '', ''
        next_step_api_status, next_step_api_status_code, next_step_api_status_message = '', '', ''
        db_status, db_status_code, db_status_message = '', '', ''
        first_messages = ''
        first_generated_text = ''
        next_step_messages = ''
        next_step_generated_text = ''
        sections_id = {}
        usage = {'completion_tokens':0, 'prompt_tokens':0, 'total_tokens':0}
        db_data = []
        brief_description = ''
        prev_messages = ''
        api_status = "Error"
        is_block_diagram_ready = False
        claim_type = 'method'
        claim_type_reg = 'Flow'
        embodiments_figures_db_data = {}
        mermaid_text = ''
        brief_description = ''
        generalized_entities, entity_action, alternative_entity_name = '','','' 
        json_data, details = {}, {}
        if section_type == 'block_diagram':
            claim_type = 'system'
            claim_type_reg = 'Block'
        is_step1_completed = False 

        def convert_to_json(text):
            description_text = "not available"
            description_text = text.replace('==Description==','').strip()
            return description_text

        block_diagram_data = get_diagram_text(claim_section_history_id,'block_diagram')
        if(len(block_diagram_data)>0 and 'section_type' in block_diagram_data[0] and block_diagram_data[0]['section_type']=='block_diagram'):
            api_status = 'Success'
            db_status, db_status_code, db_status_message, sections_id = update_db_section_changes(
            '', '','', '', '', '',  claim_section_history_id, usage, '', '', '', '', prompt_instructions, project_history_id, redraft, section_history_id=section_history_id, section=section_type, id=id, pid=pid, results='', messages='', action_source="prompt", is_error=api_status, message=next_step_api_status_message, message_code=next_step_api_status_code, clm_step=11)
        else:    
            embodiments_figures_db_data = get_prompt_generated_text(section_history_id, 'embodiments_block_diagram', id, 10,True)
            for i in range(11,12):
                if(i==11):
                    if('prompt_step1' in embodiments_figures_db_data):
                        prev_messages = embodiments_figures_db_data['prompt_step1']
                    if('response_step1' in embodiments_figures_db_data):
                        previous_generated_text = embodiments_figures_db_data['response_step1']
                next_step_messages, next_step_generated_text, next_step_api_status, next_step_api_status_code, next_step_api_status_message, usage = request_openai(
                '','', '', '',id, claim_data, type, invention, system_instructions, instructions_for_drafting, prompt_instructions, section_instructions, prior_art, template_instruction, ending_prompt_instructions, is_incremental, '', prior_art_val, '', previous_generated_text, i, prev_messages)
                details = convert_to_json(next_step_generated_text)
                if(details is not None):
                    db_status, db_status_code, db_status_message, sections_id = update_db_section_changes(
                        json_data, details,'', '', brief_description, details,  claim_section_history_id, usage, first_messages, first_generated_text, next_step_messages, next_step_generated_text, prompt_instructions, project_history_id, redraft, section_history_id=section_history_id, section=section_type, id=id, pid=pid, results=mermaid_text, messages=next_step_messages, action_source="prompt", is_error=next_step_api_status, message=next_step_api_status_message, message_code=next_step_api_status_code, clm_step=i)
                else:
                    api_status = 'Error'
            api_status = next_step_api_status
        db_data = get_prompt_generated_text(section_history_id, f'{section_type}', id, 11, True)
        if api_status == "Error":
            next_step_api_status = api_status
            next_step_api_status_code = "embodiments_block_diagram_fail"
            next_step_api_status_message = ""
        elif api_status == "Success" :
            next_step_api_status = 'Success'
            if 'message' in db_data:
                next_step_api_status_code = db_data['message']
                next_step_api_status_message = db_data['message_long']
            else:
                next_step_api_status_code = ""
                next_step_api_status_message = ""
            
        
        return draft_format_response(type, next_step_generated_text, id, sections_id, section_history_id, next_step_api_status, next_step_api_status_code, next_step_api_status_message, db_status, db_status_code, db_status_message)


def generate_detailed_description_of_figures(first_messages, first_generated_text, second_messages, second_generated_text,section_history_id, project_history_id, section_type, pid, id, modified_list_of_figure_text, type, invention, system_instructions, instructions_for_drafting, prompt_instructions, section_instructions, prior_art, template_instruction, ending_prompt_instructions, is_incremental, redraft):
    """
    Generate the detailed description of figures section.

    Args:
        section_history_id (int): The ID of the section history.
        project_history_id (int): The ID of the project history.
        section_type (str): The type of section.
        pid (int): The ID of the patent.
        id (int): The ID of the project.
        modified_list_of_figure_text (list): The modified list of figure text.
        type (str): The type of section.
        invention (str): The invention title.
        system_instructions (str): The system instructions for generating the text.
        instructions_for_drafting (str): The instructions for drafting the text.
        prompt_instructions (str): The prompt instructions for generating the text.
        section_instructions (str): The section instructions for generating the text.
        prior_art (str): The prior art information.
        template_instruction (str): The template instructions for generating the text.
        ending_prompt_instructions (str): The ending prompt instructions for generating the text.
        is_incremental (bool): Whether the text generation is incremental or not.

    Returns:
        dict: The response containing the generated text and status.
    """
    json_data, details = {}, {}
    def process_request(i):
        prev_text = modified_list_of_figure_text[i]
        _messages, _generated_text, _api_status, _api_status_code, _api_status_message, usage = request_openai(
           '','','','',id,'',type, invention, system_instructions, instructions_for_drafting, prompt_instructions,
            section_instructions, prior_art, template_instruction, ending_prompt_instructions,
            is_incremental,  prev_text, section_type, '', '', 0, None)
        if _api_status == "Success":
            if '==Detail Description==' in _generated_text:
                _generated_text = _generated_text.replace("==Detail Description==","").strip()
            return _generated_text, _messages, _api_status, _api_status_code, _api_status_message
        else:
            return None, _api_status, _messages, _api_status_code, _api_status_message
    results = Parallel(n_jobs=1)(
        delayed(process_request)(i) for i in range(0, min(10, len(modified_list_of_figure_text)))
    )
    modified_generated_text_list = []
    usage = {}
    _messages, _api_status, _api_status_code, _api_status_message = {}, None, None, None
    for i, (result, messages, api_status, api_status_code, api_status_message) in enumerate(results):
        _messages, _api_status, _api_status_code, _api_status_message = messages, api_status, api_status_code, api_status_message
        if _api_status == "Success":
            modified_generated_text_list.append(result)
        else:
            result, messages, api_status, api_status_code, api_status_message, usage = process_request(
                i)
            _messages, _api_status, _api_status_code, _api_status_message, usage = messages, api_status, api_status_code, api_status_message, usage
            if _api_status == "Success":
                modified_generated_text_list.append(result)
            else:
                break
    modified_generated_text = '\n\n'.join(modified_generated_text_list)
    db_status, db_status_code, db_status_message, sections_id = update_db_section_changes(json_data, details, '', '','','',usage, first_messages, first_generated_text, second_messages, second_generated_text, prompt_instructions, project_history_id, redraft, section_history_id=section_history_id, section=section_type,
                                                                                          id=id, pid=pid, results=modified_generated_text, messages=_messages, action_source="prompt", is_error=_api_status, message=_api_status_message, message_code=_api_status_code)
    return draft_format_response(type, modified_generated_text,  id, sections_id, section_history_id,
                                 _api_status, _api_status_code, _api_status_message, db_status, db_status_code, db_status_message)


def regenerate_claim(claim_data,section_history_id, project_history_id, section_type, pid, id, type, invention, system_instructions, instructions_for_drafting, prompt_instructions, section_instructions, prior_art, template_instruction, ending_prompt_instructions, is_incremental, redraft, invention_disclosure,claim_section_history_id):
    for _ in range(0, 2):
        first_step_api_status, first_step_api_status_code, first_step_api_status_message = '', '', ''
        second_step_api_status, second_step_api_status_code, second_step_api_status_message = '', '', ''
        db_status, db_status_code, db_status_message = '', '', ''
        first_messages = ''
        first_generated_text = ''
        second_messages = ''
        second_generated_text = ''
        sections_id = {}
        usage = {'completion_tokens':0, 'prompt_tokens':0, 'total_tokens':0}
        db_data = []
        api_status = "Error"
        is_regenerate_claim_ready = False
        usage = {}
        re_written_claims = None

        def convert_to_json(text):
            extracted_values = {
                "Re-written claims": text,
                "Are all claims re-written": "Not available"
            }
            json_data, details =  convert_text_to_json(text, re_written_claim_and_all_claims_re_written, re_written_claim_and_all_claims_re_written_fun)
            
            extracted_values = details

            return json_data, extracted_values
        
        if api_status == "Error":
            if (len(str(invention_disclosure).strip()) > 0) or (section_history_id is not None and section_history_id != ''):
                db_data = get_prompt_generated_text(
                    section_history_id, section_type, id,0, True)
                if 'section_history_id' in db_data:
                    sections_id['section_history_id'] = db_data['section_history_id']
                    section_history_id = db_data['section_history_id']
            if (len(db_data) > 0 and db_data['response_step1'] is not None):
                api_status = db_data['is_error']
            if (api_status == "Error" and (len(db_data) == 0 or (len(db_data) > 0 and ('step: 7' not in first_generated_text.lower() or db_data['response_step1'] == '')))):
                if (len(db_data) > 0 and db_data['prompt_step1'] is not None):
                    first_messages = db_data['prompt_step1']
                first_messages, first_generated_text, first_step_api_status, first_step_api_status_code, first_step_api_status_message, usage = request_openai(
                  '','','','', id, claim_data, type, invention, system_instructions, instructions_for_drafting, prompt_instructions, section_instructions, prior_art, template_instruction, ending_prompt_instructions, is_incremental, '', prior_art_val, '', '', 1, prev_messages=None)
                if('step 7:' not in first_generated_text.lower()):
                    first_step_api_status = 'Error'
                    first_step_api_status_code = 'flowchart_diagram_fail'
                    first_step_api_status_message = ''
                    first_generated_text = 'failed to generate flowchart diagram from chatgpt'
                alternative_entity_name, alternative_entity_api_status = alternative_object(section_history_id, project_history_id, section_type, pid, id, type, invention, system_instructions, instructions_for_drafting, prompt_instructions, section_instructions, prior_art, template_instruction, ending_prompt_instructions, is_incremental, redraft, invention_disclosure)
                if(alternative_entity_api_status == 'Success'):
                    db_status, db_status_code, db_status_message, sections_id = update_db_section_changes(
                        {}, {},alternative_entity_name, '','', '', claim_section_history_id, usage, first_messages, first_generated_text, '', '', prompt_instructions, project_history_id, redraft, section_history_id=section_history_id, section=section_type, id=id, pid=pid, results='', messages='', action_source="prompt", is_error=first_step_api_status, message=first_step_api_status_message, message_code=first_step_api_status_code, clm_step=1)
                    api_status = first_step_api_status
                else:
                    api_status = alternative_entity_api_status
            else:
                api_status = "Success"
            db_data = get_prompt_generated_text(
                section_history_id, section_type, id,0, False)
        if api_status == "Success":
            if 'section_history_id' in sections_id:
                section_history_id = sections_id['section_history_id']
                db_data = get_prompt_generated_text(
                    section_history_id, section_type, id, 0,False)
                if 'section_history_id' in db_data:
                    section_history_id = db_data['section_history_id']
            if ((len(db_data) > 0 and db_data['response_step1'] is not None and db_data['response_step2'] is not None)):
                api_status = db_data['is_error']
            if (api_status == "Error" or (len(db_data) > 0 and db_data['response_step1'] is not None and db_data['response_step2'] is None)):
                prev_messages = db_data['prompt_step1']
                first_generated_text = db_data['response_step1']
                second_messages, second_generated_text, second_step_api_status, second_step_api_status_code, second_step_api_status_message, usage = request_openai(
                    '','','','',id, '', type, invention, system_instructions, instructions_for_drafting, prompt_instructions, section_instructions, prior_art, template_instruction, ending_prompt_instructions, is_incremental, '', prior_art_val, first_generated_text, first_generated_text, 2, prev_messages=prev_messages)
                if '@@@yes all claims are re-written@@@' in second_generated_text.lower():
                    json_data, details = convert_to_json(second_generated_text)
                    is_regenerate_claim_ready = True
                else:
                    details = {}
                    db_data = []
                    second_step_api_status = "Error"
                    second_step_api_status_code = "flowchart_diagram_fail"
                    second_step_api_status_message = ""
                if (details is not None and 'Re-written claims' in details):
                    second_generated_text = details['Re-written claims']
                else:
                    second_step_api_status = 'Error'
                db_status, db_status_code, db_status_message, sections_id = update_db_section_changes(
                      json_data, details,'', '','', '', claim_section_history_id, usage, first_messages, first_generated_text, second_messages, second_generated_text,  prompt_instructions, project_history_id, redraft, section_history_id=section_history_id, section=section_type, id=id, pid=pid, results=second_generated_text, messages=second_messages, action_source="prompt", is_error=second_step_api_status, message=second_step_api_status_message, message_code=second_step_api_status_code, clm_step=2)
            if is_regenerate_claim_ready == True:
                break
            else:
                if env != 'dev':
                    time.sleep(30)
    
    db_data = get_prompt_generated_text(
                section_history_id, section_type, id,0, False)
    api_status = second_step_api_status
    if api_status == "Success" and (len(db_data) > 0 and db_data['text'] is not None):
        db_status = 'Success'
        second_step_api_status = 'Success'
        second_step_api_status_code = db_data['message']
        second_step_api_status_message = db_data['message_long']
        second_generated_text = db_data['text']
    elif db_data and len(db_data) == 0:
        second_step_api_status = api_status
        second_step_api_status_code = "flowchart_diagram_fail"
        second_step_api_status_message = ""
    elif is_regenerate_claim_ready == False:
        second_step_api_status = "Error"
        second_step_api_status_code = "flowchart_diagram_fail"
        second_step_api_status_message = ""
    return draft_format_response(type, second_generated_text, id, sections_id, section_history_id, second_step_api_status, second_step_api_status_code, second_step_api_status_message, db_status, db_status_code, db_status_message)

def alternative_object(section_history_id, project_history_id, section_type, pid, id, type, invention, system_instructions, instructions_for_drafting, prompt_instructions, section_instructions, prior_art, template_instruction, ending_prompt_instructions, is_incremental, redraft, invention_disclosure):
    first_step_api_status, first_step_api_status_code, first_step_api_status_message = '','',''
    first_messages = ''
    first_generated_text = ''
    extracted_text = 'Alternative Entity Not Found'
    alternative_entity_api_status = 'Success'
    first_messages, first_generated_text, first_step_api_status, first_step_api_status_code, first_step_api_status_message, usage = request_openai(
                '','','','',id,'','alternative_object', invention,'', '', '', '', '', '', '', is_incremental,'', prior_art_val, '','',1, prev_messages=None)
    if(first_step_api_status=="Success" and 'step 3:' in first_generated_text.lower()):
        json_data, details =  convert_text_to_json(first_generated_text, extract_claims_alternative_entities, extract_claims_alternative_entities_fun)
        if(len(details)>0 and 'total_alternative_entities' in details and details['total_alternative_entities'] >0):
            extracted_text = details['alternative_entities']
    if extracted_text == 'Alternative Entity Not Found' or extracted_text == '' or extracted_text == None:
        alternative_entity_api_status = 'Error'

    return extracted_text,alternative_entity_api_status

def entity_for_old_project(section_history_id, project_history_id, section_type, pid, id, type, invention, system_instructions, instructions_for_drafting, prompt_instructions, section_instructions, prior_art, template_instruction, ending_prompt_instructions, is_incremental, redraft, invention_disclosure):
    for _ in range(0, 1):
        first_step_api_status, first_step_api_status_code, first_step_api_status_message = '','',''
        second_step_api_status, second_step_api_status_code, second_step_api_status_message = '','',''
        third_step_api_status, third_step_api_status_code, third_step_api_status_message = '','',''
        db_status, db_status_code, db_status_message = '', '', ''
        first_messages = ''
        first_generated_text = ''
        second_messages = ''
        second_generated_text = ''
        sections_id = {}
        db_data = []
        api_status = "Error"
        usage = {'completion_tokens':0, 'prompt_tokens':0, 'total_tokens':0}
        instructions_for_drafting = instructions_for_claims_drafting
        def extracted_information(text):
            json_data, details =  convert_text_to_json(text, extract_claims_intermediate_steps_arguments, extract_claims_intermediate_steps_fun)
            result_list = []
            if(details is not None and details['total_entities']>0):
                extracted_values = details
                del extracted_values['total_entities']
            else:
                return None
            for key, value in extracted_values.items():
                if(value not in ['Not Available', '', 'None']):
                    result_list.append({key: value})
            return result_list,json_data
            

        if api_status == "Error":
            if (len(str(invention_disclosure).strip()) > 0):
                db_data = get_prompt_generated_text(section_history_id,section_type,id,0,True)
                if 'section_history_id' in db_data:
                    sections_id['section_history_id'] = db_data['section_history_id']
            if(len(db_data)>0  and  db_data['response_step1'] is not None):
                api_status = db_data['is_error']
                first_generated_text = db_data['response_step1']
            if(api_status == "Error" and  (len(db_data)==0 or (len(db_data)>0  and  ('step' not in first_generated_text.lower() or db_data['response_step1'] =='')))):
                if (len(db_data) > 0 and db_data['prompt_step1'] is not None):
                    first_messages = db_data['prompt_step1']
                first_messages, first_generated_text, first_step_api_status, first_step_api_status_code, first_step_api_status_message, usage = request_openai(
                    '','','','', id,'',type, invention, system_instructions, instructions_for_drafting, prompt_instructions, section_instructions, prior_art, template_instruction, ending_prompt_instructions, is_incremental,'', prior_art_val, '','',1, prev_messages=None)
                if('step' not in first_generated_text.lower()):
                    first_step_api_status = 'Error'
                    first_step_api_status_code = "claims_fail"
                    first_step_api_status_message = ''
                    first_generated_text = 'failed to generate claim from chatgpt'
                extract_results, json_data = extracted_information(first_generated_text)
                if(extract_results is None):
                    api_status = 'Error'
                else:
                    db_status, db_status_code, db_status_message, sections_id = update_db_section_changes(
                       extract_results,json_data, '',extract_results,'','',None,usage, first_messages, first_generated_text, '', '', prompt_instructions, project_history_id, redraft, section_history_id=section_history_id, section=section_type, id=id, pid=pid, results='', messages='', action_source="prompt", is_error=first_step_api_status, message=first_step_api_status_message, message_code=first_step_api_status_code, clm_step=0)
                    api_status = first_step_api_status
            else:
                api_status = "Success"
    return api_status,db_status

def generate_claims(section_history_id, project_history_id, section_type, pid, id, type, invention, system_instructions, instructions_for_drafting, prompt_instructions, section_instructions, prior_art, template_instruction, ending_prompt_instructions, is_incremental, redraft, invention_disclosure):
    for _ in range(0, 2):
        first_step_api_status, first_step_api_status_code, first_step_api_status_message = '','',''
        second_step_api_status, second_step_api_status_code, second_step_api_status_message = '','',''
        third_step_api_status, third_step_api_status_code, third_step_api_status_message = '','',''
        db_status, db_status_code, db_status_message = '', '', ''
        first_messages = ''
        first_generated_text = ''
        second_messages = ''
        second_generated_text = ''
        sections_id = {}
        db_data = []
        api_status = "Error"
        usage = {'completion_tokens':0, 'prompt_tokens':0, 'total_tokens':0}
        json_data, details = {}, {}
        def extracted_information(text):
            result_list = []

            json_data, details =  convert_text_to_json(text, extract_claims_intermediate_steps_arguments, extract_claims_intermediate_steps_fun)
            result_list = []
            if(details is not None and details['total_entities']>0):
                extracted_values = details
                del extracted_values['total_entities']
            else:
                return None
            for key, value in extracted_values.items():
                if(value not in ['Not Available', '', 'None']):
                    result_list.append({key: value})
            return result_list, json_data

        if api_status == "Error":
            if (len(str(invention_disclosure).strip()) > 0):
                db_data = get_prompt_generated_text(section_history_id,section_type,id,0,True)
                if 'section_history_id' in db_data:
                    sections_id['section_history_id'] = db_data['section_history_id']
            if(len(db_data)>0  and  db_data['response_step1'] is not None):
                api_status = db_data['is_error']
                first_generated_text = db_data['response_step1']
            if(api_status == "Error" and  (len(db_data)==0 or (len(db_data)>0  and  ('step 7:' not in first_generated_text.lower() or db_data['response_step1'] =='')))):
                if (len(db_data) > 0 and db_data['prompt_step1'] is not None):
                    first_messages = db_data['prompt_step1']
                first_messages, first_generated_text, first_step_api_status, first_step_api_status_code, first_step_api_status_message, usage = request_openai(
                    '','','','', id,'',type, invention, system_instructions, instructions_for_drafting, prompt_instructions, section_instructions, prior_art, template_instruction, ending_prompt_instructions, is_incremental,'', prior_art_val, '','',1, prev_messages=None)
                if('step 7:' not in first_generated_text.lower()):
                    first_step_api_status = 'Error'
                    first_step_api_status_code = "claims_fail"
                    first_step_api_status_message = ''
                    first_generated_text = 'failed to generate claim from chatgpt'
                extract_results, json_data = extracted_information(first_generated_text)
                if(extract_results is None):
                    api_status = 'Error'
                else:
                    db_status, db_status_code, db_status_message, sections_id = update_db_section_changes(
                       json_data, details, '',extract_results,'','',None,usage, first_messages, first_generated_text, '', '', prompt_instructions, project_history_id, redraft, section_history_id=section_history_id, section=section_type, id=id, pid=pid, results='', messages='', action_source="prompt", is_error=first_step_api_status, message=first_step_api_status_message, message_code=first_step_api_status_code, clm_step=1)
                    api_status = first_step_api_status
            else:
                api_status = "Success"
            db_data = get_prompt_generated_text(section_history_id, section_type, id,0,False)
        if api_status == "Success":
            if  'section_history_id' in sections_id:
                section_history_id = sections_id['section_history_id']
                db_data = get_prompt_generated_text(section_history_id, section_type, id,0,False)
                if 'section_history_id' in db_data:
                    section_history_id = db_data['section_history_id']
            if((len(db_data)>0 and db_data['response_step1'] is not None and db_data['response_step2'] is not None)):
                api_status = db_data['is_error']
            if (api_status == "Error" or (len(db_data) > 0 and db_data['response_step1'] is not None and db_data['response_step2'] is None)):
                prev_messages = db_data['prompt_step1']
                first_generated_text = db_data['response_step1']
                second_messages, second_generated_text, second_step_api_status, second_step_api_status_code, second_step_api_status_message, usage = request_openai(
                   '','','','',id,'',type, invention, system_instructions, instructions_for_drafting, prompt_instructions, section_instructions, prior_art, template_instruction, ending_prompt_instructions, is_incremental, '', prior_art_val, first_generated_text, first_generated_text, 2, prev_messages=prev_messages)
                if('claim' in second_generated_text):
                    db_status, db_status_code, db_status_message, sections_id = update_db_section_changes(
                    json_data, details,'','','','', None,usage, first_messages, first_generated_text, second_messages, second_generated_text,  prompt_instructions, project_history_id, redraft, section_history_id=section_history_id, section=section_type, id=id, pid=pid, results=second_generated_text, messages=second_messages, action_source="prompt", is_error=second_step_api_status, message=second_step_api_status_message, message_code=second_step_api_status_code, clm_step=2)
                    api_status = second_step_api_status
                else:
                    api_status = 'Error'
                db_data = get_prompt_generated_text(section_history_id, section_type,id,0,False)
        else:
            if env != 'dev':
                        time.sleep(30)
        if (db_data and len(db_data) == 0) or (api_status == 'Error'):
            second_step_api_status = api_status
            second_step_api_status_code = "claims_fail"
            second_step_api_status_message = ""
        elif (len(db_data) > 0  and db_data['prompt_step1'] is not None and db_data['prompt_step2'] is not None and db_data['messages'] != '{}'):
            second_step_api_status = db_data['is_error']
            second_step_api_status_code = db_data['message']
            second_step_api_status_message = db_data['message_long']
    return draft_format_response(type, second_generated_text, id, sections_id, section_history_id, second_step_api_status, second_step_api_status_code, second_step_api_status_message, db_status, db_status_code, db_status_message)

def _generate_sections_type(section_type,data, pid=None):
    """
    Generate the sections of a patent.

    Args:
        section_type (str): The type of section.
        pid (int): The ID of the patent.

    Returns:
        dict: The response containing the generated text and status.
    """
    global system_instructions
    id = ''
    data = request.get_json()
    invention_disclosure = ''
    claim_section_history_id = None
    regenerate_claim_section_history_id = None
    if 'data' in data:
        invention_disclosure = data['data']
    if 'project_id' in data :
        id = data['project_id']
    project_history_id = None
    if 'project_history_id' in data:
        project_history_id = data['project_history_id']
    if 'claim_section_history_id' in data:
        claim_section_history_id = data['claim_section_history_id']
    if 'regenerate_claim_section_history_id' in data:
        regenerate_claim_section_history_id = data['regenerate_claim_section_history_id']
    redraft = False
    if('redraft' in data):
        redraft = data['redraft']
    db_status, db_status_message = "Error", 'Technical issue with the application'
    modifed_section_type = section_type.replace('_', ' ')
    type = section_type
    invention = invention_disclosure
    prompt_instructions = ""
    prev_text = ""
    section_history_id = None
    is_incremental = False
    generated_text=''
    combined_name = f'instructions_for_{section_type}_drafting'
    instructions_for_drafting = eval(combined_name.lower())
    section_instructions = section_type
    template_instruction = ""
    ending_prompt_instructions = f"{modifed_section_type}:"
    clm_step =''
    extracted_values = []
    section_history_id = data.get('section_history_id', None)
    if section_history_id and section_history_id == '':
        section_history_id = None
    prior_art = None  # get_prior_art_val(project_history_id)
    claim_data = ''
    is_skip_generate = False
    json_data, details = {}, {}
    if (pid and len(str(invention_disclosure).strip()) > 0):
        invention = _get_invention_title({},id)
        prompt_instructions = invention_disclosure
        section_history_id = data['section_history_id']
        if section_history_id and section_history_id == '':
            section_history_id = None
        prev_text = get_section_history_text(section_history_id, 'text')
        if(section_type == 'Claims'):
            prev_claim_data = get_section_history_text(section_history_id, '')
            extracted_values.append({"Entities": prev_claim_data[0]['entity_name']})
            extracted_values.append({"Entity Actions": prev_claim_data[0]['entity_action']})
            extracted_values.append({"Generalized Entities": prev_claim_data[0]['generalized_entities']})
            extracted_values.append({"Necessary features": prev_claim_data[0]['necessary_features']})
            extracted_values.append({ "Optional features": prev_claim_data[0]['optional_features']})
        is_incremental = True
        project_history_id = get_section_history_text(
            section_history_id, 'project_history_id')
    else:
        if section_type == 'Title':
            invention = _get_invention_title({},id)
            system_instructions = system_instructions_for_title_and_claims
        elif section_type =='Claims':
            invention = _get_invention_title({}, id)
            system_instructions = system_instructions_for_title_and_claims
            messages = {}
            return generate_claims(section_history_id, project_history_id, section_type, pid, id, type,
                                   invention, system_instructions, instructions_for_drafting, prompt_instructions, section_instructions, prior_art, template_instruction, ending_prompt_instructions, is_incremental, redraft, invention_disclosure)
        elif (section_type == "technical_Field" or section_type == "background_Description"):
             invention = _get_invention_title({}, id)
             clm_step = 1

        elif section_type != "detailed_description_figures":
            invention = get_section_text(id, "Claims")
            system_instructions = system_instructions_not_for_title_and_claims
        
        if section_type == "list_of_figures":
            invention = get_section_text(id, "flowchart_diagram")
            invention = invention.strip()
            if invention.startswith("mermaid"):
                invention = invention[len("mermaid"):]
            system_instructions = instructions_for_list_of_figures_drafting
            invention = f"FIG. 1: {invention}"
            if invention == "" or 'graph' not in invention:
                is_skip_generate = True
        elif section_type == "detailed_description_figures":
            list_of_figure_text = get_section_text(id, "list_of_figures")
            if list_of_figure_text != "":
                if len(prompt_instructions) == 0 or (pid == None):
                    modified_list_of_figure_text = re.findall(
                        r'^(FIG. \d+:.*)', list_of_figure_text, re.MULTILINE)
                    system_instructions = instructions_for_detailed_description_figures_drafting
                    modified_list_of_figure_text = [get_section_text(id, "flowchart_diagram")]
                    return generate_detailed_description_of_figures('', '', '', '',section_history_id, project_history_id, section_type, pid, id, modified_list_of_figure_text, type, list_of_figure_text, system_instructions, instructions_for_drafting, prompt_instructions, section_instructions, prior_art, template_instruction, ending_prompt_instructions, is_incremental, redraft)
            else:
                is_skip_generate = True
    if is_skip_generate == False:
        messages, generated_text, api_status, api_status_code, api_status_message, usage = request_openai(
        '','','','',id,claim_data,type, invention, system_instructions, instructions_for_drafting, prompt_instructions, section_instructions, prior_art, template_instruction, ending_prompt_instructions, is_incremental, prev_text, prior_art_val, generated_text, '',clm_step, prev_messages=None)    
    else:
        generated_text = 'Not Available'
        messages = {}
        api_status = "Success"
        api_status_code = ''
        api_status_message = ''
        usage = {}
    db_status, db_status_code, db_status_message, sections_id = update_db_section_changes(
        json_data, details,'',extracted_values,'','',claim_section_history_id, usage,'', '', '', '',prompt_instructions, project_history_id, redraft, section_history_id=section_history_id, section=section_type, id=id, pid=pid, results=generated_text, messages=messages, action_source="prompt", is_error=api_status, message=api_status_message, message_code=api_status_code)
    return draft_format_response(type, generated_text, id, sections_id, section_history_id, api_status, api_status_code, api_status_message, db_status, db_status_code, db_status_message)
    