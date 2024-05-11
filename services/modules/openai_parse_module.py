import json
import os
import time
from random import randint

import json_repair
import litellm
from core.config import api_key  # , env, sandbox, sandbox_generate
from litellm import completion

os.environ["OPENAI_API_KEY"] = api_key

extract_claims_intermediate_steps_arguments = [
    {
        'name': 'extract_intermediate_results',
        'description': 'Get all intermediate results of the Claims',
        'parameters': {
            'type': 'object',
            'properties': {
                'entities': {
                    'type': 'array',
                    'description': 'Entities from Step 1',
                    'items':{
                        'type': 'object',
                        'properties':{
                            'entity':{
                                'type': 'string'
                            }
                        }
                    }
                },
                'entity_quantification': {
                    'type': 'array',
                    'description': 'Quantification for the entities from Step 3',
                    'items':{
                        'type': 'object',
                        'properties':{
                            'entity':{
                                'type': 'string'
                            },
                            'quantification':{
                                'type': 'string',
                                'description': 'complete quantification of entity'
                            }
                        }
                    }
                },
                'entity_generalised': {
                    'type': 'array',
                    'description': 'Generalized Entities from Step 4',
                    'items':{
                        'type': 'object',
                        'properties':{
                            'entity':{
                                'type': 'string'
                            },
                            'generalised_language':{
                                'type': 'string'
                            }
                        }
                    }
                },
                'entity_generalised_actions': {
                    'type': 'array',
                    'description': 'Entity Actions from Step 5. exp: Backyard -> Being monitored -> Generalised language: Undergoing surveillance',
                    'items':{
                        'type': 'object',
                        'properties':{
                            'entity':{
                                'type': 'string',
                                'description': 'exp: Backyard'
                            },
                            'entity_action':{
                                'type': 'string',
                                'description': 'exp: Being monitored'
                            },
                            'generalised_language':{
                                'type': 'string',
                                'description': 'exp: Generalised language: Undergoing surveillance'
                            }
                        }
                    }
                },
                'novelty': {
                    'type': 'string',
                    'description': 'Novelty from Step 6'
                },
                'necessary_features': {
                    'type': 'string',
                    'description': 'extract Necessary features details from Step 6 with comma seperator'
                },
                'optional_features': {
                    'type': 'string',
                    'description': 'extract Optional features from Step 6 details with comma seperator'
                }
            }
        }
    }
]

def extract_claims_intermediate_steps_fun(entities: dict, entity_quantification: dict, entity_generalised: dict, entity_generalised_actions: dict, novelty: str, necessary_features: str = "", optional_features: str = ""):
    details = {}
    details['Entities'] = "\n".join(f"{index+1}. {x['entity']}" for index, x in enumerate(entities)).strip()
    #details['Entity Actions'] = "\n ".join(f"{index+1}. {x['entity']} - {x['quantification']}" for index, x in enumerate(entity_quantification)).strip()
    details['Generalized Entities'] = "\n".join(f"{index+1}. {x['entity']} -> {x['generalised_language']}" for index, x in enumerate(entity_generalised)).strip()
    details['Entity Actions'] = "\n".join(f"{index+1}. {x['entity']} -> {x['entity_action']} -> Generalised language: {x['generalised_language']}" for index, x in enumerate(entity_generalised_actions)).strip()
    details['Novelty'] = novelty
    details['Necessary features'] = necessary_features
    details['Optional features'] = optional_features
    details['total_entities'] = len(entities)
    return details

extract_claims_alternative_entities = [
    {
        'name': 'extract_claims_alternative_entities',
        'description': 'alternatives for each entity from Step 4',
        'parameters': {
            'type': 'object',
            'properties': {
                'entities': {
                    'type': 'array',
                    'items':{
                        'type': 'object',
                        'properties':{
                            'entity':{
                                'type': 'string'
                            },
                            'alternative_entities':{
                                'type': 'string',
                                'description': 'as comma seperated'
                            }
                        }
                    }
                }
            }
        }
    }
]

def extract_claims_alternative_entities_fun(entities: dict):
    details = {}
    details['alternative_entities'] = "\n".join(f"{index+1}. {x['entity']} -> {x['alternative_entities']}" for index, x in enumerate(entities)).strip()
    details['total_alternative_entities'] = len(entities)
    return details


# extract_method_system_claim_nos = [
#     {
#         'name': 'extract_method_system_claim_nos',
#         'description': 'Get all method and system claim numbers from Step 2',
#         'parameters': {
#             'type': 'object',
#             'properties': {
#                 'method_claims': {
#                     'type': 'array',
#                     'description': 'all the method claim numbers from the Step 1',
#                     'items':{
#                         'type': 'object',
#                         'properties':{
#                             'claim_no':{
#                                 'type': 'number'
#                             }
#                         }
#                     }
#                 },
#                 'system_claims': {
#                     'type': 'array',
#                     'description': 'all the system claim numbers from the Step 1',
#                     'items':{
#                         'type': 'object',
#                         'properties':{
#                             'claim_no':{
#                                 'type': 'number'
#                             }
#                         }
#                     }
#                 },
                
#             }
#         }
#     }]


# def extract_method_system_claim_nos_fun(method_claims: dict = {}, system_claims: dict = {}):
#     details = {}
#     details["method_claims"] = list([x['claim_no'] for x in method_claims])
#     details["system_claims"] = list([x['claim_no'] for x in system_claims])
#     details["is_method_claims"] = True if len(details["method_claims"]) > 0 else False
#     details["is_system_claims"] = True if len(details["system_claims"]) > 0 else False
#     return details


re_written_claim_and_all_claims_re_written = [
    {
        'name': 're_written_claim_and_all_claims_re_written',
        'description': 'Get Re-written claims and Are All Claims Re-written',
        'parameters': {
            'type': 'object',
            'properties': {
                're_written_claims': {
                    'type': 'string',
                    'description': 'Re-written claims from Step 9',
                },
                'are_all_claims_re_written': {
                    'type': 'boolean',
                    'description': 'is @@@Yes all claims are re-written@@@ from Step 10',
                }
            }
        }
    }]

def re_written_claim_and_all_claims_re_written_fun(re_written_claims: str, are_all_claims_re_written: bool):
    details = {}
    details["Re-written claims"] = re_written_claims
    details["Are all claims re-written"] = are_all_claims_re_written
    return details

extract_figure_brief_description_and_mermaid = [
    {
        'name': 'extract_figure_brief_description_and_mermaid',
        'description': 'Get figure brief description and the mermaid of figure',
        'parameters': {
            'type': 'object',
            'properties': {
                'brief_description': {
                    'type': 'string',
                    'description': 'brief description of figure',
                },
                'mermaid': {
                    'type': 'string',
                    'description': 'mermaid of figure',
                }
            }
        }
    }]

def extract_figure_brief_description_and_mermaid_fun(brief_description: str = None, mermaid: str = None):

    details = {}
    details["brief description"] = ""
    details["mermaid"] = "" 
    if brief_description is not None:
        details["brief description"] = brief_description
    if mermaid is not None:
        details["mermaid"] = mermaid
    return details

def convert_text_to_json(content, function_arguments, function_def):
    for i in range(0,1):
        try:
            response = completion(
                model = 'gpt-4-32k',
                messages = [{'role': 'user', 'content': content}],
                functions = function_arguments,
                function_call = 'auto'
            )
            response = response.model_dump(mode='json')
            json_response = {}
            try:
                json_response = json_repair.loads(response['choices'][0]['message']['function_call']['arguments'])
            except:
                json_response = {}
            data_details =  function_def(**json_response)
            return json_response, data_details
        except Exception as e:
            print(e)
            continue
    return None, None