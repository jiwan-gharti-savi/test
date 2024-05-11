import base64
import datetime
import io
import json
import logging
import os
import random
import re
import time
# import magic
import jwt
import requests
from blob_storage.storage import Storage
from core.config import *
from core.config import db_config
from core.notification import db_format_response, get_notification_message, get_error_code_from_type
from docx.shared import Inches
from docxtpl import DocxTemplate, InlineImage
from flask import Blueprint, Flask, jsonify, make_response, request, send_file
from flask_cors import CORS
from modules.patent_module import (_get_invention_title, prior_art_analysis,
                                   prior_art_val)
from modules.file_storage_module import upload_file_to_cloud
from modules.search_module import _build_project_index, _search_projects

from PIL import Image
from rich.console import Console
from werkzeug.utils import secure_filename
import urllib

console = Console()

project_api_blueprint = Blueprint('db', __name__, url_prefix='/')

logger = logging.getLogger("draft.log")
import stytch


def get_sysuser_id(email = '', project_id = None,sysuser_id = None):
    sysuser_id = sysuser_id
    data = {}
    try:
        if(project_id==None and sysuser_id == None):
            sysuser_id = db.execute({
                "query": "select_sysusers",
                "values": {
                    "email": email
                }
            })
            data['sysuser_id'] = sysuser_id[0]['sysuser_id']
            domain_name = ''
            parts = email.split('@')
            if len(parts) == 2:
                domain_name = parts[1]
            else:
                domain_name = None
            data['domain_name'] = domain_name
        elif(email==''):
            if (project_id == None):
                data['sysuser_id'] = sysuser_id
            else:
                sysuser_id_data = db.execute({
                    "query": "project_type",
                    "values": {
                        "project_id":project_id
                    }
                })
                data['sysuser_id'] = sysuser_id_data[0]['sysuser_id']
            email = db.execute({
                "query": "select_sysusers",
                "values": {
                    "sysuser_id": data['sysuser_id']
                }
            })
            email = email[0]['email'] if email and isinstance(email[0], dict) and 'email' in email[0] else ''
            domain_name = ''
            parts = email.split('@')
            if len(parts) == 2:
                domain_name = parts[1]
            else:
                domain_name = None
            data['domain_name'] = domain_name
        return data
    except Exception as e:
        data['domain_name'] = 'domain not found'
        data['sysuser_id'] = None
        response = data
        print("Error in project_module file and get_sysuser_id function => ", e)
    return response

def _check_access(data, is_results=False):
    activity_data = {}
    try:
        results = {}
        values = {
            'sysuser_id': data['id'],
            'project_id': data.get('project_id')
        }
        activity_data['project_id'] = data.get('project_id')
        project_access_rows = db.execute({
            "query": "check_access",
            "values": values
        })
        if (len(project_access_rows) > 0):
            results['project'] = 'yes'
        else:
            results['project'] = 'no'
        sysrole_rows = db.execute({
            "query": "select_roles",
            "values": {
                'sysuser_id': data['id'],
                # 'project_id': data['project_id']
            },
        })
        if (len(project_access_rows) > 0):
            results['project'] = 'yes'
        else:
            results['project'] = 'no'
        sysrole_rows = db.execute({
            "query": "select_roles",
            "values": {
                "id": 2
            },
        })
        results['features'] = sysrole_rows[0]['name']
        apiStatus = "Error"
        if(results['project'] == "yes"):
            apiStatus = "Success"
        if is_results == True:
            return results
        response = db_format_response(
            results, apiStatus, "ignore", "")
    except Exception as e:
        print("Error in project_module file and _check_access function => ", e)
        response = db_format_response(
            "", "Error", "project_access_denied", f"")
        if is_results == True:
            return {"project": "no", "features": "no"}
    return response

def generate_jwt(user_data,response):
    # In a real application, you would authenticate the user and check credentials.
    # For this example, let's assume the user is authenticated with the username 'test_user'.
    username = 'test_user'
    token = jwt.encode({'email': user_data['email'], 'sysuser_id':response['id'],'role_id':response['role_id'], 'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=jwt_expiry_time)},
                       jwt_SECRET_KEY, algorithm='HS256')
    return token


def _jwt_verification(data):
    try:
        token = None

        # Check if the Authorization header is present and starts with 'Bearer'
        if 'Authorization' in data:
            auth_header = data['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]

        if not token:
            return db_format_response("Token is missing!", "Error", "signup_failure", f"")
        try:
            # Verify the token using the secret key
            jwt_data = jwt.decode(token, jwt_SECRET_KEY, algorithms=['HS256'])
            current_user = jwt_data['email']
        except jwt.ExpiredSignatureError:
            return db_format_response("Token has expired!", "Error", "signup_failure", f"")
        except jwt.InvalidTokenError:
            return db_format_response("Invalid token!", "Error", "signup_failure", f"")
        return db_format_response(jwt_data, "Success", "signup_successful", "")
    except Exception as e:
        print("Error in project_module file and _jwt_verification function => ", e)


def _signup(user_data):
    response = _select_login(is_flag=True)
    activity_data = {}
    if 'sysuser_id' in response:
        sysrole_rows = db.execute({
            "query": "select_roles",
            "values": {
                "id": response['role_id']
            },
        })
        response['id'] = response['sysuser_id']
        response['roles'] = sysrole_rows[0]['name']
        response['token'] = generate_jwt(user_data,response)
        return db_format_response(response, "Success", "login_successful", "")
    try:
        data = {}
        sysuser_rows = db.execute({
            "query": "update_sysusers",
            "values": {
                "role_id": user_data['role_id'],
                "company": "dolcera",
                "email": user_data["email"],
                "password": "dolcera@1234"
            },
        })
        sysrole_rows = db.execute({
            "query": "select_roles",
            "values": {
                "id": user_data['role_id']
            },
        })
        domain_name = ''
        email = user_data["email"]
        parts = email.split('@')
        if len(parts) == 2:
            domain_name = parts[1]
        else:
            domain_name = None
        if(domain_name):
            activity_data['domain'] = domain_name
        if(len(sysuser_rows)>0):
            activity_data['sysuser_id'] = sysuser_rows[0]['sysuser_id']
        activity_data['activity'] = "Login Successful"
        data = {}
        data['id'] = sysuser_rows[0]['sysuser_id']
        data['role_id'] = user_data['role_id']
        data['roles'] = sysrole_rows[0]['name']
        data['token'] = generate_jwt(user_data,data)
        response = db_format_response(
            data, "Success", "signup_successful", "")
    except Exception as e:
        print("Error in project_module file and _signup function => ", e)
        response = db_format_response(
            "", "Error", "signup_failure", f"")
    try:
        db.execute({
            "query": "update_reports_activity",
            "values": activity_data
        })
    except Exception as e:
        print(f"failed to update activity table in project_module file and _signup function : ", e)
    return response


def _is_project_completed(data):
    result = {}
    result['is_prior_art'] = False
    result['is_flowchart_diagram'] = False
    result['is_block_diagram'] = False
    result['claims'] = False
    result['completed_sections'] = 0
    result['project_finish'] = False
    result['is_download_btn_active'] = False
    result['flowchart_diagram_flag'] = 'Error'
    result['block_diagram_flag'] = 'Error'
    result['extra_diagram_flag'] = 'Error'
    result['total_detailed_description_flag'] = 'Error'

    try:
        value = {
            "is_project_completed": False,
            "is_prior_art": False
        }
        project_id = data['project_id']
        selected_project_history_id = db.execute({
            "query": "select_project_history",
            "values": {
                "project_id": project_id,
                "is_selected": True
            }
        })
        if (len(selected_project_history_id) > 0 and selected_project_history_id[0]['prior_art_analysis'] is not None):
            result['is_prior_art'] = True

        total_section_id_row = _get_project_details(data,is_results=True)
        
        empty_section_id_row = db.execute({
            "query": "select_one_sections",
            "values": {
                "sh.project_id" : project_id,
                "sh.text": ''
            }
        })
        for section_details in total_section_id_row:
            if  section_details.get('section_type') in ['flowchart_diagram', 'block_diagram','extra_diagram','total_detailed_description']:
                if section_details.get('is_error') == 'Success' and section_details.get('is_dd_error') == "Success":
                    result[f"is_{section_details.get('section_type')}"] = True
                    result[f"{section_details.get('section_type')}_flag"] = "Success"
                if result.get(f"{section_details.get('section_type')}_flag") is None and section_details.get('response_step3') == "No Flowchart":
                    result[f"{section_details.get('section_type')}_flag"] = "Success"
        total_success_section = len(total_section_id_row) - len(empty_section_id_row)
        result['completed_sections'] = total_success_section
        sections_track = ["Title","Abstract","Claims","background_Description","technical_Field","summary"]
        check_sections_track = [x['section_type'] for x in total_section_id_row]
        result['claims'] = 'Claims' in check_sections_track
        missing_count = len(list(set(sections_track) - set(check_sections_track)))
        result['completed_sections'] = len(sections_track) - missing_count
        missing_fields = list(set(sections_track) - set(check_sections_track))
        result['missing_sections'] = [x.lower() for x in list(set(sections_track) - set(check_sections_track))]
        if missing_count == 0:
            result['is_download_btn_active'] = True
        if len(result) and result['total_detailed_description_flag'] == "Success":
            result['project_finish'] = True
        response = result
    except Exception as e:
        response = {}
        print("Error in project_module file and _is_project_completed function => ", e)
    return response

def _is_claim_invention(data):
    """
    This function is used to check if the project has a claim and an invention.
    It also handles exceptions and logs errors.
    """
    response = {
       'is_invention':False,
       'is_claim':False 
    }
    
    try:
        values = {
            "project_id": data.get('project_id'),
            "section_type": "Claims"
        }
        claim_data = db.execute({
                "query": "select_one_section_type",
                "values": values
            })
        invention_data = _get_invention_title({}, data.get('project_id'))
        if len(invention_data)>0:
            response['is_invention'] = True
        if(len(claim_data) and 'text' in claim_data[0]):
            response['is_claim'] = True
        return response
    except Exception as e:
        response = {}
        print("Error in project_module file and _is_claim_invention function => ", e)
    return response

def _insert_claim_data(data):
    """
    This function is used to insert claim data into the database.
    It also handles exceptions and logs errors.
    """
    # Prepare the values to be inserted into the database
    values = {
        'project_id': data.get('project_id'),
        'text': data.get('claim_data'),
        'section_type': 'Claims',
        'is_error': 'Success',
        'project_history_id': data.get('project_history_id'),
        'version': 1,
        'is_selected' : True
    }

    # Add section_history_id to values if it exists in data
    if 'section_history_id' in data:
        values['section_history_id'] = data['section_history_id']

    try:
        # Execute the database query to update the section history
        section_history_rows = db.execute({
            "query": "update_section_history",
            "values": values
        })

        # Get the section_history_id from the database response
        section_history_id = section_history_rows[0]['section_history_id']

        # Update the values to be inserted into the database
        values['section_history_id'] = section_history_id
        del values['version']
        del values['is_selected']

        # Execute the database query to update the sections
        sections_rows = db.execute({
            "query": "update_sections",
            "values": values
        })

        # Get the section_id from the database response
        section_id = sections_rows[0]['section_id']

        # Return the section_history_id and section_id
        return {"section_history_id": section_history_id, "section_id": section_id}

    except Exception as e:
        print("Error in project_module file and insert_claim_data function => ", e)
        return {}
    

def _insert_project_data(data):
    """
    This function is used to insert project data into the database.
    It also handles exceptions and logs errors.
    """
    try:
        # Clean up the invention title
        invention_title = data['invention'].strip()
        invention_title = re.sub(r'\\n{2,}', '\\n\\n', invention_title)
        invention_title = re.sub(r'\\t{2,}', '\\t', invention_title)
        invention_title = invention_title.strip()
        
        claims = data['claims'].strip()
        claims = re.sub(r'\\n{2,}', '\\n\\n', claims)
        claims = re.sub(r'\\t{2,}', '\\t', claims)
        claims = claims.strip()

        if len(claims) > 0 and len(invention_title) >0:
            title_and_claim = "title_and_claim"
        elif len(claims) > 0:
            title_and_claim = "claims"
        elif len(invention_title) > 0:
            title_and_claim = "invention"
            
      

        # Prepare the values to be inserted into the database
        values = {
            "invention_title": invention_title,
            "sysuser_id": data['user_id'],
            'project_type' : data['project_type'],
            "prior_art": json.dumps(prior_art_val),
            "prior_art_analysis": json.dumps(prior_art_analysis),
            'is_error':'Success',
            'claims_style': data['claims_style'].lower()
        }

        # Add project_id to values if it exists in data
        if 'project_id' in data:
            values['project_id'] = data['project_id']

        # Execute the database query to update the project
        project_row = db.execute({
            "query": "update_project",
            "values": values
        })

        # Prepare the response to be returned
        db_response = {'project_id': project_row[0]['project_id']}

        # Add project_history_id to values if it exists in data
        if 'project_history_id' in data:
            values['project_history_id'] = data['project_history_id']

        # Update the values to be inserted into the database
        values['is_selected'] = True
        del values['sysuser_id']
        del values['project_type']
        del values['prior_art']
        del values['prior_art_analysis']
        values['project_id'] = project_row[0]['project_id']

        # Execute the database query to update the project history
        project_history_row = db.execute({
            "query": "update_project_history",
            "values": values,
        })

        # Get the user data
        user_data = get_sysuser_id('', project_row[0]['project_id'], None)

        # Prepare the activity data to be inserted into the database
        activity_data = {
            'sysuser_id': user_data.get('sysuser_id'),
            'project_id': str(project_row[0]['project_id']) if project_row and 'project_id' in project_row[0] else None,
            'domain': user_data.get('domain_name'),
            'activity': "Invention update in project table"
        }

        # Update the response to be returned
        db_response['project_history_id'] = project_history_row[0]['project_history_id']

        # Check if there is a claim in the invention title or in the data
        if title_and_claim == "title_and_claim" :
            db_response['is_claim'] = True
            claim_data = {
                'project_id': db_response['project_id'],
                'project_history_id': db_response['project_history_id']
            }

            # Add claim data to claim_data if it exists in title_and_claim or in data
            claim_data['claim_data'] = claims
            # if 'claim_invention' in data:
            #     claim_data['claim_data'] = data.get('claim_invention')
            #     claim_data['section_history_id'] = data['section_history_id']

            # Insert the claim data into the database
            claim_section_data = _insert_claim_data(claim_data)

            # Update the response to be returned
            db_response.update({
                "section_history_id": claim_section_data["section_history_id"],
                "section_id": claim_section_data["section_id"],
                'is_invention': True
            })
        # Format the response to be returned
        response = db_format_response(
            db_response, "Success", "project_creation_successful", "")

    except Exception as e:
        print("Error in project_module file and insert_project_data function => ", e)
        response = db_format_response(
            "", "Error", "project_creation_failure", f"{str(e)}")

    try:
        # Update the activity in the database
        db.execute({
            "query": "update_reports_activity",
            "values": activity_data
        })
    except Exception as e:
        print(f"Failed to update activity table in project_module file and insert_project_data function : ", e)

    return response

def _invention_disclosure_invention(data):
    """
        This function is used to get the invention title and yield it in chunks.
        It also handles exceptions and logs errors.
    """
    try:
        invention_data = _get_invention_title({}, data.get('project_id'))
        invention_data = invention_data.strip()
        invention_data_obj = {"invention_disclosure_invention" : invention_data}
        invention_data_json_string = json.dumps(invention_data_obj)
        yield "@#@$@#@"
        for text in invention_data_json_string.split():        
            yield text + " "
            time.sleep(0.1)
    except Exception as e:
        print("Error in project_module file and _invention_disclosure_invention function => ", e)
        response = db_format_response(
            "", "Error", "_invention_disclosure_invention", f"{str(e)}")

def _invention_disclosure_claim(data):
    """
    This function is used to get the claim data and yield it in chunks.
    It also handles exceptions and logs errors.
    """
    try:
        # Prepare the values to be used in the database query
        values = {
            "project_id": data.get('project_id'),
            "section_type": "Claims"
        }

        # Execute the database query to get the claim data
        claim_data = db.execute({
            "query": "select_one_section_type",
            "values": values
        })

        yield "@#@$@#@"

        # Get the claim text and convert it to a JSON string
        claim_text = claim_data[0]['text'].strip()
        claim_text_json_string = json.dumps({"invention_disclosure_claim": claim_text})

        # Yield the claim data in chunks
        for text in claim_text_json_string.strip().split():    
            yield text + " "
            time.sleep(0.1)

    except Exception as e:
        print("Error in project_module file and invention_disclosure_claim function => ", e)
        return db_format_response("", "Error", "invention_disclosure_claim", f"{str(e)}")

def _update_project_history(data):
    try:
        db_response = {}
        activity_data = {}
        project_row = db.execute({
            "query": "update_project",
            "values": {
                'project_id' : data['project_id'],
                'is_error':'Success',
                'claims_style': data['claims_style'].lower()
            }
        })

        db_response['project_id'] = project_row[0]['project_id']
        project_history_row = db.execute({
            "query": "update_project_history",
            "values": {
                "project_id": str(project_row[0]['project_id']),
                "project_history_id": str(data['project_history_id']),
                "is_selected": True,
                'is_error':'Success',
                'claims_style': data['claims_style'].lower()
            }
        })
        user_data = get_sysuser_id('', project_row[0]['project_id'],None)
        if 'sysuser_id' in user_data:
            activity_data['sysuser_id'] = user_data['sysuser_id']
        if project_row  and 'project_id' in project_row[0]:
            activity_data['project_id'] = str(project_row[0]['project_id'])
        if 'domain_name' in user_data:
            activity_data['domain'] = user_data['domain_name']
        activity_data['activity'] = "Invention update in project history table"

        db_response['project_history_id'] = project_history_row[0]['project_history_id']
        response = db_format_response(
            db_response, "Success", "project_creation_successful", "")
    except Exception as e:
        print("Error in project_module file and _update_project_history function => ", e)
        response = db_format_response(
            "", "Error", "project_creation_failure", f"{str(e)}")

    try:
        db.execute({
            "query": "update_reports_activity",
            "values": activity_data
        })
    except Exception as e:
        print(f"failed to update activity table in project_module file and _update_project_history function : ", e)
    return response


def _is_finished(data):
    is_finish_data = {}
    try:
        is_finish_details = _is_project_completed(data)
        is_finish_data['project_finish'] = is_finish_details.get('project_finish')
        is_finish_data['claims'] = is_finish_details.get('claims')
        is_finish_data['is_prior_art'] = is_finish_details.get('is_prior_art')
        if (is_finish_details.get('project_finish')==True):
            is_finish_data['claims'] = False
            is_finish_data['is_prior_art'] = False
        elif(is_finish_details.get('claims') == True and is_finish_details.get('is_prior_art') == True):
            is_finish_data['is_prior_art'] = True
            is_finish_data['claims'] = False
            is_finish_data['project_finish'] = False
        elif (is_finish_details.get('is_prior_art') == False and is_finish_details.get('claims') == True ):
            is_finish_data['is_prior_art'] = False
            is_finish_data['claims'] = True
            is_finish_data['project_finish'] = False
        else:
            selected_project_id = db.execute({
                "query": "project_type",
                "values": {
                    "project_id": data.get("project_id")
                }
            })
            if len(selected_project_id) > 0:
                if (selected_project_id[0]['project_type'] is not None and selected_project_id[0]['project_type']=='prior_art'):
                    is_finish_data['is_prior_art'] = True
                    is_finish_data['claims'] = False
                else:
                    is_finish_data['is_prior_art'] = False
                    is_finish_data['claims'] = True
                is_finish_data['project_finish'] = False
            else:
                is_finish_data['is_prior_art'] = False
                is_finish_data['claims'] = True
                is_finish_data['project_finish'] = False
        response = db_format_response(
            is_finish_data, "Success", "login_successful", "")
    except Exception as e:
        print("Error in project_module file and _is_finished function => ", e)
        response = db_format_response(
            "", "Error", "login_failure", f"")
    try:
        activity_data = {}
        user_data = get_sysuser_id('', data['project_id'],None)
        if 'sysuser_id' in user_data:
            activity_data['sysuser_id'] = user_data['sysuser_id']
            activity_data['project_id'] = data['project_id']
        if 'domain_name' in user_data:
            activity_data['domain'] = user_data['domain_name']
        activity_data['activity'] = f"Project Opened"
        db.execute({
            "query": "update_reports_activity",
            "values": activity_data
        })
    except Exception as e:
        print(f"failed to update activity table in project_module file and _is_finished function : ", e)
    return response


def _claim_change(data):
    try:
        db.execute({"query": "update_section_history",
                                "values": {
                                    'section_history_id': data['section_history_id'],
                                    "is_selected": True,
                                }
                                })
        section_history_data_project = db.execute({"query": "select_section_history",
                                "values": {
                                    'project_id': data['project_id']
                                }
                            })

        for i in range(len(section_history_data_project)):
            if(len(section_history_data_project[i]) > 0 and 'section_history_id' in section_history_data_project[i]):
                db.execute({"query": "update_section_history",
                            "values": {
                                'section_history_id': section_history_data_project[i]['section_history_id'],
                                "is_selected": False
                            }
                        })

        section_history_id_data = []
        for section in [ "Title", "Abstract", "technical_Field", "summary", "background_Description", "regenerate_claim"]:
            row = db.execute({"query": "select_section_history",
                        "values": {
                            'claim_section_history_id': data['section_history_id'],
                            "section_type" : section
                        }
                    })
            section_history_id_data.append(row)


        for i in range(len(section_history_id_data)):
            if(len(section_history_id_data[i])>0 and len(section_history_id_data[i][0]) and 'section_history_id' in section_history_id_data[i][0]):
                row = db.execute({"query": "update_section_history",
                            "values": {
                                'section_history_id': section_history_id_data[i][0]['section_history_id'],
                                "is_selected": True
                            }
                        })
            
                row = db.execute({"query": "update_sections",
                            "values": {
                                'section_history_id': section_history_id_data[i][0]['section_history_id'],
                                'text' : section_history_id_data[i][0]['text'],
                                'project_id' : data['project_id'],
                                'section_type' : section_history_id_data[i][0]['section_type'],
                                'section_history_id':data['section_history_id']
                            }
                        })  
       
    except Exception as e:
        print("Error in project_module file and _claim_change function => ", e)

def _insert_section_history(data):
    """
    Inserts a section history into the database.

    Args:
        data (dict): The data containing the section history details.

    Returns:
        dict: The response indicating the success or failure of the operation.
    """
    activity_data = {}
    try:
        section_history_id = data['section_history_id']
        text = _clean_section_text(data.get('content'))
        version = data['version']
        claim_selected_more_than_one(data['project_id'])
        is_manual_edit = execute_db_query("select_section_history", {'text': text, 'section_history_id': section_history_id})
        existion_section_history = execute_db_query("select_section_history_internal", {'section_history_id': section_history_id})
        new_section_history = existion_section_history
        if(data['section_type'] == 'Claims'):
            _handle_claims(data)
        if len(is_manual_edit) == 0:
            section_history_id = _handle_manual_edit(data, text, version, existion_section_history)
        data['section_history_id'] = section_history_id
        _handle_section_selected(data, existion_section_history)
        try:
            sysuser_data = get_sysuser_id(email = '', project_id = data['project_id'] ,sysuser_id = None)
            activity_data['sysuser_id'] = sysuser_data['sysuser_id']
            activity_data['project_id'] = data['project_id']
            activity_data['domain'] = sysuser_data['domain_name']
            activity_data['activity'] = f"{data['section_type']} modified manually successfully"
            activity_data['section_type'] = data['section_type']
            activity_data['section_history_id'] = data['section_history_id']
            db.execute({
                "query": "update_reports_activity",
                "values": activity_data
            })
        except Exception as e:
            print(f"failed to update activity table in project_module file and _update_invention_title function : ", e)

        return db_format_response(
                data, "Success", "section_save_successful", "")
    
    except Exception as e:
        print("Error in project_module file and _insert_section_history function => ", e)
    

def claim_selected_more_than_one(project_id):
    try:
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
    except Exception as e:
        print("Error in project_module file and claim_selected_more_than_one function => ", e)


def _clean_section_text(text):
    try:
        if text is not None:
            text = text.strip()
            text = re.sub(r'\\n{2,}', '\\n\\n', text)
            text = re.sub(r'\\t{2,}', '\\t', text)
            text = text.strip()
        return text
    except Exception as e:
        print("Error in project_module file and _clean_section_text function => ", e)

def execute_db_query(query, values):
    return db.execute({"query": query, "values": values})

def _handle_manual_edit(data, text, version, existion_section_history):
    try:
        action_type = "manual"
        values = {
            "project_id": data['project_id'],
            "section_type": data['section_type'],
            "text": text,
            "prompt": "",
            "messages": "{}",
            "action_type": "manual",
            "is_error": "Success",
            "is_selected": True,
            'version': int(version)+1,
            'section_id': existion_section_history[0]['section_id'],
            'prev_section_history_id': data['section_history_id'],
            'project_history_id': existion_section_history[0]['project_history_id'],
            'claim_section_history_id': existion_section_history[0]['claim_section_history_id']
        }
        if data['section_type'] == "Claims":
            fields = ["entity_name","specific_attributes","entities_without_sequence","entities_with_sequence",
                        "entity_generalised_sequence","entity_attributes","generalized_entities","entity_action",
                        "necessary_features_generalised","necessary_features","optional_features","alternative_entity_name"]
            for field in fields:
                if values.get(field) is None and existion_section_history[0].get(field) is not None:
                    values[field] = existion_section_history[0][field]
        values['prev_section_history_id'] = existion_section_history[0]['section_history_id']
        rows = db.execute({"query": "update_section_history",
                    "values": values
        })
        if len(rows) > 0:
            _ = db.execute({"query": "update_section_history",
            "values": {
                'section_history_id': data['section_history_id'],
                "is_selected": False,
            }
            })
            return rows[0]['section_history_id']
    except Exception as e:
        print("Error in project_module file and _handle_manual_edit function => ", e)


def _handle_section_selected(data, existion_section_history):
    try:
        selected_section = db.execute({
            "query": "select_section_history",
            "values": {
                'is_selected': True,
                'section_type': data['section_type']
            }
        })
        if len(selected_section) > 0:
            _ = db.execute({"query": "update_section_history",
                "values": {
                    'section_history_id': selected_section[0]['section_history_id'],
                    "is_selected": False,
                }
            })
            rows = db.execute({"query": "update_section_history",
                "values": {
                    'section_history_id': data['section_history_id'],
                    "is_selected": True,
                }
            })
            section_data = rows[0]
            values = {
                "project_history_id": data.get("project_history_id"),
                "project_id": data['project_id'],
                "section_type": data['section_type'],
                "text": section_data.get('text'),
                "prompt": section_data.get('prompt'),
                "action_type": section_data.get('action_type'),
                "section_history_id": section_data.get('section_history_id'),
                "claim_section_history_id": section_data.get("claim_section_history_id")
            }
            section_id = db.execute({"query": "update_sections",
                    "values": values
            })
    
    except Exception as e:
        print("Error in project_module file and _handle_section_selected function => ", e)


def _handle_claims(data):
    try:
        is_partial_finish_project = True
        fields = {"fields_section_history": ['Title','Abstract','background_Description','regenerate_claim','summary','technical_Field'],
                    "fields_figures_section_history": ['flowchart_diagram','block_diagram']
                    }
        updated_sections = []
        for prefix in ["", "_figures"]:
            all_section_history_data = db.execute({"query": f"select_edit{prefix}_section_history",
            "values": {
                'claim_section_history_id': data['section_history_id']
            }
            })
            # makr all section histories are is_selected True and sections table
            for section_data in all_section_history_data:
                updated_sections.append(section_data['section_type'])
        if len(updated_sections) == 0 or len(updated_sections) == (len(fields['fields_section_history']) + len(fields['fields_figures_section_history'])):
            is_partial_finish_project = False
        for prefix in ["", "_figures"]:
            # select all section history data based on is_selected True
            selected_rows = db.execute({"query": f"select{prefix}_section_history",
            "values": {
                'project_id' : data['project_id'],
                "is_selected": True,
            }
            })
            # mark all sections are False
            for section_data in selected_rows:
                if(section_data['section_type'] != 'Claims'):
                    rows = db.execute({"query": f"update{prefix}_section_history",
                        "values": {
                            'section_history_id': section_data['section_history_id'],
                            "is_selected": False,
                        }
                    })
            # select all section history based on claim_section_history_id
            all_section_history_data = db.execute({"query": f"select_edit{prefix}_section_history",
            "values": {
                'claim_section_history_id': data['section_history_id']
            }
            })
            # makr all section histories are is_selected True and sections table
            updated_sections = []
            for section_data in all_section_history_data:
                if(section_data['section_type'] != 'Claims'):
                    rows = db.execute({"query": f"update{prefix}_section_history",
                        "values": {
                            'section_history_id': section_data['section_history_id'],
                            "is_selected": True,
                        }
                    })
                    section_id = db.execute({"query": "update_sections",
                                        "values": {
                                            "project_history_id": data.get("project_history_id"),
                                            "project_id": data['project_id'],
                                            "section_type": section_data.get('section_type'),
                                            "text": section_data.get('text'),
                                            "prompt": section_data.get('prompt'),
                                            "action_type": section_data.get('action_type'),
                                            "section_history_id": section_data.get('section_history_id'),
                                            "claim_section_history_id": section_data.get("claim_section_history_id")
                                        }
                    })
                    updated_sections.append(section_data['section_type'])
            missing_sections = list(set(fields[f"fields{prefix}_section_history"]) - set(updated_sections))

    except Exception as e:
        print("Error in project_module file and _handle_claims function => ", e)


def _update_figure_data(data):
    response = {}
    try:
        email = db.execute({
            "query": "select_sysusers",
            "values": {
                "sysuser_id": data.get('sysuser_id')
            }
        })
        email = email[0]['email'] if email and isinstance(email[0], dict) and 'email' in email[0] else ''
        domain_name = ''
        parts = email.split('@')
        if len(parts) == 2:
            domain_name = parts[1]
        else:
            domain_name = None
        data['domain'] = domain_name
        rows = []
        for field in ['company','user','project']:
            sysuser_id = data.get('sysuser_id')
            project_id = data.get('project_id')
            if data.get(field) is not None:
                for figure_details in data.get(field):
                    if figure_details.get('name') is None or len(figure_details.get('name')) == 0:
                        continue
                    fig_id = figure_details.get('fig_id')
                    base64_image = figure_details.get('base64_image')
                    padding_needed = len(base64_image) % 4
                    #print("padding_needed",padding_needed,field)
                    if padding_needed > 0:
                        base64_image += '=' * (4 - padding_needed)
                    # binary_image = base64.b64decode(base64_image.encode('utf-8'))
                    binary_image = base64.b64decode(base64_image)
                    values = {
                            'name': figure_details.get('name'),
                            'summary' : figure_details.get('summary'), 
                            'brief_description' : figure_details.get('brief_description'),
                            'access_level' : field,
                            'detailed_description' : figure_details.get('detailed_description'),
                            'domain' : data.get('domain'),
                            'sysuser_id' : sysuser_id,
                            'project_id' : project_id,
                            'base64_image' : binary_image
                        }
                    if fig_id is not None:
                        values['fig_id'] = fig_id
                    rrows = db.execute({"query": "update_figure_data",
                        "values": values
                    })
                    rows.extend(rrows)
   
        response = db_format_response(rows, "Success", "update_figure_success", "Figure saved successfully")
    except Exception as e:
        print("Error in project_module file and _update_figure_data function => ", e)
        response = db_format_response([], "Error", "update_figure_fail", f"Failed to save figure: {str(e)}")


    return response



def _update_invention_title(data):
    results = {}
    activity_data = {}
    try:
        project_id = data['project_id']
        project_history_id = data['project_history_id']
        text = data['invention']
        def clean_invention(text):
            text = text.strip()
            text = re.sub(r'\\n{2,}', '\\n\\n', text)
            text = re.sub(r'\\t{2,}', '\\t', text)
            text = text.strip()
            return text
        text = clean_invention(text)
        selected_invention_details = db.execute({
            "query": "select_project_history",
            "values": {
                'project_history_id': project_history_id
        }})
        actual_text = ""
        if len(selected_invention_details) > 0 and 'invention_title' in selected_invention_details[0]:
            actual_text = selected_invention_details[0]['invention_title']
            actual_text = clean_invention(actual_text)
        is_manual_edit = db.execute({
            "query": "select_project_history",
            "values": {
                'invention_title': text,
                'project_history_id': project_history_id
            }})
        is_manual_edit_flag = False
        if len(is_manual_edit) == 0 and (text != actual_text):
            is_manual_edit_flag = True
        current_selected_versions = db.execute({
            "query": "select_project_history",
            "values": {
                'project_id': project_id,
                'is_selected': True
            }})
        for selected_version in current_selected_versions:
            rows = db.execute({"query": "update_project_history",
                               "values": {
                                   'project_history_id': selected_version['project_history_id'],
                                   "is_selected": False,
                               }
                               })
        new_project_history_id = project_history_id
        if is_manual_edit_flag == True:
            existion_section_history = db.execute({
                "query": "select_project_history",
                "values": {
                    'project_history_id': project_history_id
                }})
            rows = db.execute({"query": "update_project_history",
                               "values": {
                                   "project_id": project_id,
                                   "invention_title": text,
                                   "action_type": "manual",
                                   "is_error": "Success",
                                   "is_selected": True
                               }
                               })
            new_project_history_id = rows[0]['project_history_id']
        results['project_history_id'] = new_project_history_id
        rows = db.execute({"query": "update_project_history",
                           "values": {
                               'project_history_id': new_project_history_id,
                               "is_selected": True,
                           }
                           })
        section_id = db.execute({"query": "update_project",
                                 "values": {
                                     "project_id": project_id,
                                     "invention_title": text,
                                     "is_error": "Success"
                                 }
                                 })
        db.execute({"query": "update_section_history",
                    "values": {
                        "is_redraft": True
                    }
                    })
        response = db_format_response(
            results, "Success", "section_save_successful", "")
        user_data = get_sysuser_id('',project_id,None)
        if 'sysuser_id' in user_data:
            activity_data["sysuser_id"] = user_data['sysuser_id']
        if project_id is not None:
            activity_data['project_id'] = project_id
        if 'domain_name' in user_data:
            activity_data['domain'] = user_data['domain_name']
        activity_data['activity'] = "Invention Modified"
        activity_data['api_error_message'] = "Invention Modified successfully"
        activity_data['api_status'] = "Success"
    except Exception as e:
        print("Error in project_module file and _update_invention_title function => ", e)
        response = db_format_response(
            results, "Error", "section_save_fail", f"{str(e)}")
    try:
        if len(activity_data) > 0:
            db.execute({
                "query": "update_reports_activity",
                "values": activity_data
            })
    except Exception as e:
        print(f"failed to update activity table in project_module file and _update_invention_title function : ", e)
    return response


def _select_login(data={},is_flag=False):
    try:
        email = data["email"]
        rows = db.execute({
            "query": "select_sysusers",
            "values": {
                "email": email
            }
        })
        if is_flag == True:
            return rows[0]
        response = db_format_response(
            rows[0], "Success", "login_successful", "")
    except Exception as e:
        #print("Error in project_module file and _select_login function => ", e)
        if is_flag == True:
            return {}
        response = db_format_response(
            "", "Error", "login_failure", f"")
    return response


def _delete_project_data(data={}, is_flag=False):
    try:
        project_id = data.get('project_id')
        
        # Assuming you have a list of tables from which you want to delete data
        tables_to_delete = ['figures', 'figures_section_history', 'project_history', 'section_history', 'sections','project']  # Add more tables as needed
        for table in tables_to_delete:
            rows = db.execute({
                "query": "delete_project",
                "values": {
                    "project_id": project_id,
                },
                "table": table
            })
            
        response = db_format_response(
            "", "Success", "project_deleted_successful", "")
    except Exception as e:
        print("Error in project_module file and _delete_project_data function => ", e)
        response = db_format_response(
            "", "Error", "project_delete_failure", f"")
    return response





def _archive_project_data(data={}):
    try:
        project_id = data.get('project_id')
        values = {
                "project_id":project_id,
                "is_archive":True
            }
        if(data.get('type') == 'unarchive'):
            values['is_archive'] = False
        rows = db.execute({
            "query": "update_archive",
            "values": values
        })
        response = db_format_response(
            rows[0], "Success", "project_archive_successful", "")
        
    except Exception as e:
        print("Error in project_module file and _archive_project_data function => ", e)
        response = db_format_response(
            "", "Error", "project_archive_failure", f"")
    return response


def _load_all_project(data, is_flag = False):
    activity_data = {}
    value = {}
    try:
        sysuser_id = data.get('user_id')
        value["sysuser_id"] = sysuser_id
        rows = db.execute({
            "query": "load_all_project",
            "values": value
        })
        user_data = get_sysuser_id('', None, sysuser_id)
        if 'sysuser_id' in user_data:
            activity_data["sysuser_id"] = user_data['sysuser_id']
        if 'domain_name' in user_data:
            activity_data['domain'] = user_data['domain_name']
        activity_data['activity'] = "Home Page Visit"
        activity_data['api_status'] = "Success"
        if(is_flag == True):
            return rows
        response = db_format_response(
            rows, "Success", "ignore", "project data load successfully")
    except Exception as e:
        print("Error in project_module file and _load_all_project function => ", e)
        response = db_format_response(
            "", "Error", "ignore", f"")
    try:
        db.execute({
            "query": "update_reports_activity",
            "values": activity_data
        })
    except Exception as e:
        print(f"failed to update activity table in project_module file and _load_all_project function : ", e)
    return response

def _search_project_data(data):
    try:
        query_text = data.get('query_text')
        is_archive = data.get('is_archive')
        results = []
        all_project_data = _load_all_project(data,True)
        project_index = _build_project_index(all_project_data)
        filtered_projects = _search_projects(project_index, query_text)
        for project_data in all_project_data:
            if ((project_data['is_archive'] == is_archive) and project_data['project_id'] in filtered_projects) :
                results.append(project_data)
        response = db_format_response(
            results, "Success", "ignore", "project data load successfully")
    except Exception as e:
        print("Error in project_module file and _search_project_data function => ", e)
        response = db_format_response(
            "", "Error", "ignore", f"")
    return response

def _is_inserted_project(data):
    try:
        data = request.get_json()
        project_id = data['project_id']
        rows = db.execute({
            "query": "is_inserted_project",
            "values": {
                "project_id": project_id
            }
        })
        response = db_format_response(
            rows[0], "Success", "ignore", "project data load successfully")
    except Exception as e:
        print("Error in project_module file and _is_inserted_project function => ", e)
        response = db_format_response(
            "", "Error", "ignore", f"Error: Unable to insert into project. Please try it later. {str(e)}")
    return response


def _select_project_history(data,is_results=False):
    try:
        rows = db.execute({
            "query": "select_project_history",
            "values": {
                "project_id": data['project_id'],
            }
        })
        if is_results == True:
            return rows
        if len(rows) > 0 and 'prior_art' in rows[0]:
            del rows[0]['prior_art']
        rows = add_error_messages(rows, "prior-art")
        response = db_format_response(
            rows, "Success", "ignore", "project history data load successfully")
    except Exception as e:
        print("Error in project_module file and _select_project_history function => ", e)
        if is_results == True:
            return {}
        response = db_format_response(
            "", "Error", "ignore", f"{str(e)}")
    return response


def _select_one_project_history(data):
    try:
        rows = db.execute({
            "query": "select_one_project_history",
            "values": {
                "project_history_id": data['project_history_id']
            }
        })
        response = db_format_response(
            rows, "Success", "ignore", "project history data load successfully")
    except Exception as e:
        print("Error in project_module file and _select_one_project_history function => ", e)
        response = db_format_response(
            "", "Error", "ignore", f"{str(e)}")
    return response

def add_error_messages(rows, section_type_module=None):
    # return rows
    frows = []
    for row in rows:
        frow = row
        section_type = frow.get('section_type',None)
        if section_type_module is not None:
            section_type = section_type_module
        if section_type and frow.get("is_error",'Error') != "Success":
            api_status_code = get_error_code_from_type(section_type)
            frow['message_long'] = get_notification_message(api_status_code, '', '')
            frow['message'] = get_notification_message(api_status_code, '', '_long')
        if section_type and frow.get("is_dd_error",'Error') != "Success":
            api_status_code = "detailed_description_fail"
            frow['message_dd_long'] = get_notification_message(api_status_code, '', '')
            frow['message_dd'] = get_notification_message(api_status_code, '', '_long')
        frows.append(frow)
    return frows
            
def _get_project_details(data,is_results=False):
    try:
        data = request.get_json()
        rows = db.execute({
            "query": "select_one_sections",
            "values": {
                "sh.project_id": data['project_id']
            }
        })
        figure_rows = db.execute({
            "query": "select_one_figure_sections",
            "values": {
                "sh.project_id": data['project_id']
            }
        })
        for i in range (0,len(figure_rows)):
            rows.append(figure_rows[i])
        for row in rows:
            if 'is_error' in row and row['is_error'] == 'Error':
                value = db_format_response("Error","ignore",f"{(row['section_type']).lower()}_fail","Error", flag = False)
                row['message'] = value['message']
                row['message_long'] = value['message_long']
            if row['section_type'] in ['extra_diagram', 'flowchart_diagram', 'block_diagram', 'total_detailed_description'] and 'is_dd_error' in row and  row['is_dd_error'] == 'Error':
                value = db_format_response("Error","ignore",f"{(row['section_type']).lower()}_description_fail","Error", flag = False)
                row['message_dd'] = value['message']
                row['message_dd_long'] = value['message_long']
        if is_results == True:
            return rows
        response = db_format_response(
            rows, "Success", "ignore", "section data load successfully")
    except Exception as e:
        print("Error in project_module file and _get_project_details function => ", e)
        if is_results == True:
            return {}
        
        response = db_format_response(
            f"{data['section_type']}_fail", "Error", "ignore", f"{str(e)}")
    return response


def _is_detailed_discription_based_on_same_claim(data):
    Detailed_Discription_Of_Figure ={
        "is_redraft_needed":"no"
    }
    try:
        number_of_claim_for_project_id = db.execute({
            "query": "select_section_history",
            "values": {
                "project_id": data['project_id'],
                "section_type": "Claims"
            }
        })
        number_of_summary_for_project_id = db.execute({
            "query": "select_section_history",
            "values": {
                "project_id": data['project_id'],
                "section_type": "summary"
            }
        })
        details_section_history_id = []
        if len(number_of_claim_for_project_id) > 1 and len(number_of_summary_for_project_id) > 0:
            claim_section_history_id = db.execute({
                "query": "is_selected_true",
                "values": {
                    "project_id": data['project_id'],
                    "section_type": "Claims",
                    "is_selected" : True
                }
            })
            details_section_history_id = db.execute({
                "query": "select_section_history",
                "values": {
                    "project_id": data['project_id'],
                    "section_type": "summary",
                    "is_selected" : True,
                    "claim_section_history_id": claim_section_history_id[0]['section_history_id']
                }
            })
        if len(details_section_history_id) == 0 and len(number_of_claim_for_project_id) > 1 and len(number_of_summary_for_project_id) > 0:
            Detailed_Discription_Of_Figure["is_redraft_needed"]="yes"
        response = db_format_response(
            Detailed_Discription_Of_Figure, "Success", "ignore", "section data load successfully")
    except Exception as e:
        print("Error in project_module file and _is_detailed_discription_based_on_same_claim function => ", e)
        response = db_format_response(
            Detailed_Discription_Of_Figure, "Success", "ignore", f"{str(e)}")
    return response

def _select_one_section(data):
    return _get_project_details(data,is_results=False)


def _select_one_section_type(data,is_results=False):
    try:
        value = {}
        data = request.get_json()
        rows = db.execute({
            "query": "select_one_sections",
            "values": {
                "sh.project_id": data['project_id']
            }
        })
        for i in range(0,len(rows)):
            if(rows[i]['section_type']==data['section_type']):
                value = rows[i]
                break
        if(is_results == True):
            return value
        if 'is_error' in value and value['is_error'] == 'Error':
            db_value = db_format_response("Error","ignore",f"{(value['section_type']).lower()}_fail","Error", flag = False)
            value['message'] = db_value['message']
            value['message_long'] = db_value['message_long']
        response = db_format_response(
            value, "Success", "ignore", "section data load successfully")
    except Exception as e:
        print("Error in project_module file and _select_one_section_type function => ", e)
        if is_results == True:
            return {}
        response = db_format_response(
            f"{data['section_type']}_fail", "Error", "ignore", f"{str(e)}")
    return response


def _select_section_type(data,is_results=False):
    try:
        value = {}
        if(is_results == False):
            data = request.get_json()
        rows = db.execute({
            "query": "select_one_section_type",
            "values": {
                "sh.project_id": data['project_id']
            }
        })
        for i in range(0,len(rows)):
            if(rows[i]['section_type']==data['section_type']):
                value = rows[i]
                break
        if(is_results == True):
            return value
        response = db_format_response(
            value, "Success", "ignore", "section data load successfully")
    except Exception as e:
        print("Error in project_module file and _select_section_type function => ", e)
        if is_results == True:
            return {}
        response = db_format_response(
            f"{data['section_type']}_fail", "Error", "ignore", f"{str(e)}")
    return response



def _export_prior_art(data):
    activity_data = {}
    response = {}
    export_data = {}
    prior_art_analysis_data = []
    export_format = data.get("format","docx")
    date_mappings = {'priority_date': 'prid', 'application_date': 'ad', 'publication_date': 'pd'}
    selected_date_filter = 'priority_date'
    try:
        project_id = data['project_id']
        if data.get('filters') is not None:
            try:
                for field in ['priority_date', 'application_date', 'publication_date']:
                    if data.get('filters').get(field) is not None and len(data.get('filters').get(field))>0:
                        selected_date_filter = field
                        break
            except:
                pass 
        invention = _get_invention_title({}, project_id)
        details = _select_project_history(data, is_results=True)
        prior_art_analysis = details[0]['prior_art_analysis']
        invention_summary = ""
        for index, patent in enumerate(prior_art_analysis):
            export_data = {}
            if index == 0:
                invention_summary = patent['invention_summary']
            export_data['sno'] = index+1
            for field in ['ucid','title','prid','co','similarity_summary','claims_summary','similarity_score','difference', 'cpcpri', 'explanation', 'similarity_sentences']:        
                if field == 'ucid' and patent.get(field) is None:
                    value = patent['pn']
                else:
                    value = patent.get(field, "")
                value = re.sub('<[^<]+?>', '', str(value))
                if value is None:
                    value = ""
                export_data[field] = value
            export_data['date_name'] = selected_date_filter.replace("_"," ").title()
            export_data['date'] = "-"
            if date_mappings[selected_date_filter] in patent:
                export_data['date'] = patent[date_mappings[selected_date_filter]]
                
            for f in ['difference','similarity_summary']:
                try:
                    if export_data.get('ucid',None) is not None:
                        if export_data.get("ucid") in  export_data.get(f,""):
                            export_data[f] = export_data.get(f,"").replace(export_data.get("ucid"),f"Document {export_data.get('sno')}")                        
                except:
                    pass
            prior_art_analysis_data.append(export_data)
        page_num = data.get('page_num',1)//5
        prior_art_analysis_data = prior_art_analysis_data[5*(page_num-1):5*page_num]
        parent_path = os.path.dirname(os.path.abspath(__file__))
        invention_summary_short = " ".join(invention.split(" ")[0:15]).replace("\n"," ")
        if export_format == "masked_docx":
            download_name = f"IPAuthor - Masked Prior-Art - {invention_summary_short}.docx"
            template_path = f'{parent_path}/../templates/priorart_masked_template.docx'
        else:
            download_name = f"IPAuthor - Masked Prior-Art - {invention_summary_short}.docx"
            template_path = f'{parent_path}/../templates/priorart_template.docx'
            export_format = "docx"
        if invention is None:
            invention = ""
        if invention_summary is None:
            invention_summary = ""
        invention = re.sub('<[^<]+?>', '', invention)
        invention_summary = re.sub('<[^<]+?>', '', invention_summary)
        if export_format in ['docx', 'masked_docx']:
            template = DocxTemplate(template_path)
            template.render({"invention": invention, "invention_summary": invention_summary,
                            "patents": prior_art_analysis_data})
            output = io.BytesIO()
            template.save(output)
            output.seek(0)
            response = make_response(output.getvalue())
            # Set the headers for file download
            response.headers.set('Content-Disposition',
                                'attachment', filename=download_name)
            response.headers.set(
                'Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
            response.headers.set('x-filename', download_name)
        else:
            pass
        user_data = get_sysuser_id('', project_id,None)
        if 'sysuser_id' in user_data:
            activity_data["sysuser_id"] = user_data['sysuser_id']
        if project_id is not None:
            activity_data['project_id'] = project_id
        if 'domain_name' in user_data:
            activity_data['domain'] = user_data['domain_name']
        activity_data['activity'] = "Prior-art Exported"
        activity_data['api_error_message'] = "Prior-art Exported successfully"
        activity_data['api_status'] = "Success"
        
    except Exception as e:
        if env=='dev':
            console.print_exception(show_locals=False)
        else:
            print("Error in project_module file and _export_prior_art function => ", e)
        response = "No prior art"
    try:
        if len(activity_data) > 0:
            db.execute({
                "query": "update_reports_activity",
                "values": activity_data
            })
    except Exception as e:
        print(f"failed to update activity table in project_module file and _export_prior_art function : ", e)
        pass
    return response


def _check_each_section_type(data):
    try:
        rows = db.execute({
            "query": "check_each_section_type",
            "values": {
                "project_id": data['project_id'],
                "section_type": data['section_type']
            }
        })
        response = db_format_response(
            rows, "Success", "ignore", "project data load successfully")
    except Exception as e:
        print("Error in project_module file and _check_each_section_type function => ", e)
        response = db_format_response(
            "", "Error", "ignore", f"{str(e)}")
    return response


def _select_section_history(data, is_results=False):
    try:
        rows = []
        selected_claim_history_id = {}
        claim_section_history_id = None
        project_history_id = None
        if(data['section_type'] != 'Claims'):
            selected_claim_history_id  = db.execute({
                "query": "select_section_history",
                "values": {
                    "project_id": data['project_id'],
                    "section_type": 'Claims',
                    "is_error": "Success",
                    "is_selected":True
                }
            })
            if(len(selected_claim_history_id)>0):
                claim_section_history_id = selected_claim_history_id[0].get('claim_section_history_id')
                project_history_id = selected_claim_history_id[0].get('project_history_id')
        value = {
            "project_id": data['project_id'],
            "section_type": data['section_type'],
            "is_error": "Success",
        }
        success_histories = db.execute({
            "query": "select_section_history",
            "values": value
        })
        failed_histories = db.execute({
            "query": "select_section_history",
            "values": {
                "project_id": data['project_id'],
                "section_type": data['section_type'],
                "is_error": "Error"
            }
        })
        rows = success_histories
        if len(failed_histories) > 0 and len(success_histories) == 0:
            rows = [failed_histories[0]]
        elif len(success_histories) > 0 and len(failed_histories) > 0:
            success_version_id = success_histories[0]['section_history_id']
            failed_version_id = failed_histories[0]['section_history_id']
            failed_prev_version_id = failed_histories[0]['prev_section_history_id']
            if failed_version_id > success_version_id:
                failed_histories[0]['version'] = len(success_histories) + 1
                failed_histories[0]['section_history_id'] = failed_prev_version_id
                rows.insert(0, failed_histories[0])

        version = len(rows)
        for i in range(0, len(rows)):
            display_section_name = data['section_type'].replace("_"," ").title()
            if (not rows[i]['prompt'] or rows[i]['prompt'] is None) and rows[i]['is_error'] == "Success":
                if rows[i]['action_type'] == 'manual':
                    rows[i]['prompt'] = f"{display_section_name} modified manually "
                else:
                    rows[i]['prompt'] = f"Drafted {display_section_name} with ChatGPT"
                rows[i]['is_prompt'] = False
            else:
                rows[i]['is_prompt'] = True
            rows[i]['version'] = version
            version = version - 1
        if is_results == True:
            return rows
        for row in rows:
            if 'is_error' in row and row['is_error'] == 'Error':
                value = db_format_response("Error","ignore",f"{(row['section_type']).lower()}_fail","Error", flag = False)
                row['message'] = value['message']
                row['message_long'] = value['message_long']
        response = db_format_response(
            rows, "Success", "ignore", "project data load successfully")
    except Exception as e:
        print("Error in project_module file and _select_section_history function => ", e)
        response = db_format_response(
            "", "Error", "ignore", f"{str(e)}")
    return response


def _is_re_draft_claim(data):
    try:
        value = {
            "redraft_claim_need" : False
        }
        project_id = data['project_id']
        section_history_id_row = db.execute({
            "query": "select_section_history",
            "values": {
                "project_id": project_id
            }
        })
        number_of_claim_for_project_id = db.execute({
            "query": "select_section_history",
            "values": {
                "project_id": data['project_id'],
                "section_type": "Claims",
                "is_error": "Success"
            }
        })
        if(len(section_history_id_row)==0):
            response = db_format_response(
                value, "Success", "ignore", "project data load successfully")
        selected_project_history_id = db.execute({
            "query": "select_project_history",
            "values": {
                "project_id": project_id,
                "is_selected": True
            }
        })
        is_selected_claim = db.execute({
            "query": "select_section_history",
            "values": {
                "project_history_id": selected_project_history_id[0]['project_history_id'],
                "section_type":"Claims",
                "is_selected" : True
            }
        })
        is_selected_claim_project_id = db.execute({
            "query": "select_section_history",
            "values": {
                "project_id": project_id,
                "is_selected": False,
                "section_type":"Claims"
            }
        })
        if(len(number_of_claim_for_project_id) > 0 and len(is_selected_claim) == 0):
                value['redraft_claim_need']=True
        response = db_format_response(
            value, "Success", "ignore", "project data load successfully")
    except Exception as e:
        print("Error in project_module file and _is_re_draft_claim function => ", e)
        response = db_format_response(
            "", "Error", "ignore", f"{str(e)}")
    return response

    
def _download_btn_active(data):
    try:
        value = _is_project_completed(data)
        value['is_download_btn_active'] = value['is_download_btn_active']
        response = db_format_response(
                value, "Success", "ignore", "project data load successfully")
    except Exception as e:
        print("Error in project_module file and _download_btn_active function => ", e)
        response = db_format_response(
            "", "Error", "ignore", f"{str(e)}")
    return response


def _is_prior_art(data):
    try:
        value = {
            "is_prior_art": False
        }
        project_id = data['project_id']
        selected_project_id = db.execute({
            "query": "project_type",
            "values": {
                "project_id": project_id
            }
        })
        
        if (selected_project_id[0]['project_type'] is not None):
            if (selected_project_id[0]['project_type']=='prior_art'):
                value['is_prior_art'] = True
        selected_project_history_id = db.execute({
            "query": "select_project_history",
            "values": {
                "project_id": project_id,
                "is_selected": True
            }
        })
        if len(selected_project_history_id) > 0 and selected_project_history_id[0]['prior_art_analysis'] is not None:
            value['is_prior_art'] = True
        response = db_format_response(
            value, "Success", "ignore", "project created successfully using prior art")
    
            
    except Exception as e:
        print("Error in project_module file and _is_prior_art function => ", e)
        response = db_format_response(
            "", "Error", "ignore", f"{str(e)}")
    return response



def _select_flowchart_diagram(data, is_results=False):
    try:
        if is_results == False:
            data = request.get_json()
        rows = db.execute({
            "query": "figures_based_on_same_claim",
            "values": {
                "claim_section_history_id" : data['claim_section_history_id'],
                "section_type": "flowchart_diagram",
            },
        })
        if is_results == True:
            return rows
        if len(rows)>0 and 'is_error' in rows[0] and rows[0]['is_error'] == 'Error':
            value = db_format_response("Error","ignore",f"{(rows[0]['section_type']).lower()}_fail","Error", flag = False)
            rows[0]['message'] = value['message']
            rows[0]['message_long'] = value['message_long']
        if len(rows)>0 and 'is_dd_error' in rows[0] and rows[0]['is_dd_error'] == 'Error':
            value = db_format_response("Error","ignore",f"{(rows[0]['section_type']).lower()}_description_fail","Error", flag = False)
            rows[0]['message_dd'] = value['message']
            rows[0]['message_dd_long'] = value['message_long']
        response = db_format_response(
            rows, "Success", "ignore", "section data load successfully")
    except Exception as e:
        print("Error in project_module file and _select_flowchart_diagram function => ", e)
        if is_results == True:
            return None
        response = db_format_response(
            f"{data['section_type']}_fail", "Error", "ignore", f"{str(e)}")
    return response


def _select_block_diagram(data, is_results=False):
    try:
        if is_results == False:
            data = request.get_json()
        rows = db.execute({
            "query": "figures_based_on_same_claim",
            "values": {
                "claim_section_history_id": data['claim_section_history_id'],
                "section_type": "block_diagram"
            }
        })
        if len(rows)>0 and 'is_error' in rows[0] and rows[0]['is_error'] == 'Error':
            value = db_format_response("Error","ignore",f"{(rows[0]['section_type']).lower()}_fail","Error", flag = False)
            rows[0]['message'] = value['message']
            rows[0]['message_long'] = value['message_long']
        if len(rows)>0 and 'is_dd_error' in rows[0] and rows[0]['is_dd_error'] == 'Error':
            value = db_format_response("Error","ignore",f"{(rows[0]['section_type']).lower()}_description_fail","Error", flag = False)
            rows[0]['message_dd'] = value['message']
            rows[0]['message_dd_long'] = value['message_long']
        if is_results == True:
            return rows
        response = db_format_response(
            rows, "Success", "ignore", "section data load successfully")
    except Exception as e:
        print("Error in project_module file and _select_block_diagram function => ", e)
        if is_results == True:
            return None
        response = db_format_response(
            f"{data['section_type']}_fail", "Error", "ignore", f"{str(e)}")
    return response


def _select_regenerate_claim(data):
    try:
        data = request.get_json()
        rows = db.execute({
            "query": "select_section_history",
            "values": {
                "claim_section_history_id": data['claim_section_history_id'],
                'section_type': 'regenerate_claim'
            }
        })
        response = db_format_response(
            rows, "Success", "ignore", "section data load successfully")
    except Exception as e:
        print("Error in project_module file and _select_regenerate_claim function => ", e)
        response = db_format_response(
            "", "Error", "ignore", f"{str(e)}")
    return response


def _is_selected_clm_id(data):
    try:
        data = request.get_json()
        rows = db.execute({
            "query": "is_selected_true",
            "values": {
                "project_id" : data['project_id'],
                "section_type": "Claims",
                "is_selected" : True
            }
        })
        response = db_format_response(
            rows, "Success", "ignore", "section data load successfully")
    except Exception as e:
        print("Error in project_module file and _is_selected_clm_id function => ", e)
        response = db_format_response(
            "", "Error", "ignore", f"{str(e)}")
    return response

def _export_project(data):
    activity_data = {}
    project_id = data['project_id']
    figure_blobs = {}
    response = {}
    user_data = {}
    list_of_figures_titles = []
    try:
        for key in ['flowcharts','block_diagrams', 'figures_base64']:
            if data.get(key):
                for fig in data.get(key):
                    if fig.get('mermaid') and 'base64' in fig.get('mermaid'):
                        name = fig.get('name')
                        mermaid = fig.get('mermaid')
                        figure_blobs[name] = mermaid
                        list_of_figures_titles.append(name)
        details = _get_project_details(data, is_results=True)
        details_hash = {x['section_type']: x for x in details}
        claims_data = {"project_id": project_id, "section_type":"Claims"}
        claims_details = _select_section_history(claims_data, is_results=True)
        flowchart_details = None
        blockdiagram_details = None
        claims_section_history_id = None
        total_description_details = None
        extra_description_details = []
        if claims_details and len(claims_details) > 0 and 'section_history_id' in claims_details[0]:
            claims_section_history_id = claims_details[0]['section_history_id']
        for claims_details_option in claims_details:
            if claims_details_option is not None and 'is_selected' in claims_details_option and   claims_details_option['is_selected'] == True:
                claims_section_history_id = claims_details[0]['section_history_id']
        if 'claim_section_history_id' in data and data['claim_section_history_id'] is not None:
            claims_section_history_id = data['claim_section_history_id']
        if claims_section_history_id is not None:
            flowchart_details = _select_flowchart_diagram(data= {"claim_section_history_id": claims_section_history_id}, is_results=True)
            blockdiagram_details = _select_block_diagram(data= {"claim_section_history_id": claims_section_history_id}, is_results=True)
            extra_description_details = _select_other_detailed_description_clm(data= {"claim_section_history_id": claims_section_history_id}, is_results=True)
            total_description_details = _select_total_detailed_description_clm(data= {"claim_section_history_id": claims_section_history_id}, is_results=True)
            user_figure_details = _select_project_figure_data(data, is_results=True)
        title = details_hash["Title"]["text"]
        sections = {"Title":"title", "Abstract":"abstract", "technical_Field":"technical_field", "background_Description":"background", "summary":"summary",
                    "list_of_figures":"list_of_figures", "detail_Description":"detail_description", "detailed_description_figures":"detailed_description_figures", "Claims":"claims"}
        list_of_figures = []
        detailed_description_figures = []
        for figure_index, figure in enumerate([flowchart_details, blockdiagram_details, extra_description_details]):
            if figure is None or len(figure) == 0:
                continue
            if figure[0].get("main_breif_description") and len(figure[0].get("main_breif_description")) > 0:
                for figure_details in figure[0].get("main_breif_description"):
                    if figure_details.get('brief_description') and len(figure_details.get('brief_description')) > 0:
                        list_of_figures.append(f"{figure_details.get('title') if 'title' in figure_details else (figure_details.get('main_mermaid_number') if 'main_mermaid_number' in figure_details else 'FIG')} {figure_details['brief_description']}")
                        list_of_figures_titles.append(figure_details.get('title') if 'title' in figure_details else (figure_details.get('main_mermaid_number') if 'main_mermaid_number' in figure_details else ''))
                        
            if figure[0].get("breif_descriptions"):
                for figure_details in figure[0].get("breif_descriptions"):
                    if figure_details.get('brief_description') and len(figure_details.get('brief_description')) > 0:
                        list_of_figures.append(f"{figure_details.get('title') if 'title' in figure_details else (figure_details.get('sub_mermaid_number') if 'sub_mermaid_number' in figure_details else 'FIG')} {figure_details['brief_description']}")
                        list_of_figures_titles.append(figure_details.get('title') if 'title' in figure_details else (figure_details.get('main_mermaid_number') if 'main_mermaid_number' in figure_details else 'FIG'))
            # if figure[0].get("detailed_description_figures") and len(figure[0].get("detailed_description_figures")) > 0:
            #     detailed_description_figures.append(figure[0].get("detailed_description_figures"))
        
        if total_description_details[0].get("detailed_description_figures") and len(total_description_details[0].get("detailed_description_figures")) > 0:
            detailed_description_figures.append(total_description_details[0].get("detailed_description_figures"))
        for figure_index, figure_details in enumerate(user_figure_details):
            if figure is None or len(figure) == 0:
                continue
            if figure_details.get('brief_description') and len(figure_details.get('brief_description')) > 0:
                        list_of_figures.append(f"{figure_details.get('title') if 'title' in figure_details else (figure_details.get('sub_mermaid_number') if 'sub_mermaid_number' in figure_details else 'FIG')} {figure_details['brief_description']}")
                        list_of_figures_titles.append(figure_details.get('title') if 'title' in figure_details else (figure_details.get('main_mermaid_number') if 'main_mermaid_number' in figure_details else 'FIG'))
            if figure_details.get("detailed_description") and len(figure_details.get("detailed_description")) > 0:
                detailed_description_figures.append(figure_details.get("detailed_description"))
        list_of_figures_array = list_of_figures[:]
        if len(list_of_figures) > 0:
            list_of_figures = "\n\n".join(list_of_figures)
        else:
            list_of_figures = ""
        
        if len(detailed_description_figures) > 0:
            detailed_description_figures = "\n\n".join(detailed_description_figures)
        else:
            detailed_description_figures = ""
            
        draft_data = {}
        sections_data = []
        for section, section_key in sections.items():
            if section in details_hash:
                section_name = section.replace("_", " ")
                if section_name == "detail Description":
                    section_name = "detailed Description"
                if section_name in ["background Description", "background_Description"]:
                    section_name = "background"

                section_name = section_name.upper()
                value = details_hash[section]['text']
                if value is None:
                    value = ""
                sections_data.append(
                    {"name": section_name, "value": value})
                draft_data[section_key] = value
        draft_data['list_of_figures'] = list_of_figures
        draft_data['detailed_description_figures'] = detailed_description_figures
        parent_path = os.path.dirname(os.path.abspath(__file__))
        template_path = f'{parent_path}/../templates/patent_template.docx'
        template = DocxTemplate(template_path)
        figure_inline_images = {}
        draft_data[f"figures"] = []
        #for figure_blob in figure_blobs:
        list_of_figures_titles = [str(x) for x in list_of_figures_titles]
        list_of_figures_titles = list(set(sorted(list_of_figures_titles)))
        for fname in list_of_figures_titles:
            if figure_blobs.get(fname) is not None:
                figure_blob = figure_blobs[fname]
                try:
                    flowchart_base64 = figure_blob.split(",")[1]
                    padding_needed = len(flowchart_base64) % 4
                    if padding_needed > 0:
                        flowchart_base64 += '=' * (4 - padding_needed)
                    flowchart_bytes = base64.b64decode(flowchart_base64)
                    flowchart_stream = io.BytesIO(flowchart_bytes)
                    # Get original image dimensions to respect aspect ratio
                    with Image.open(flowchart_stream) as img:
                        original_width, original_height = img.size
                        aspect_ratio = original_width / original_height  # Width-to-height ratio
                        
                        desired_width = Inches(7)
                        desired_height = desired_width / aspect_ratio

                        if desired_height > Inches(10):
                            desired_height = Inches(10)
                            desired_width = desired_height * aspect_ratio

                        flowchart_stream.seek(0)
                        flowchart = InlineImage(template, flowchart_stream, width=desired_width, height=desired_height)
                        draft_data[f"figures"].append(flowchart)
                except Exception as e:
                    print("Error in project_module file and _export_project 1 function => ", e)
                    pass
        for key, value in draft_data.items():
            if value is None:
                draft_data[key] = ""
        template.render({**draft_data})
        output = io.BytesIO()
        template.save(output)
        output.seek(0)
        download_name = f"IPAuthor - {title}.docx"
        # return send_file(output, download_name=download_name, as_attachment=True)

        # Create a response object
        response = make_response(output.getvalue())

        # Set the headers for file download
        response.headers.set('Content-Disposition',
                            'attachment', filename=download_name)
        response.headers.set(
            'Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
        response.headers.set('x-filename', download_name)
        user_data = get_sysuser_id('',project_id,None)
    except Exception as e:
        print("Error in project_module file and _export_project 2 function => ", e)

    if 'sysuser_id' in user_data:
        activity_data["sysuser_id"] = user_data['sysuser_id']
    if project_id is not None:
        activity_data['project_id'] = project_id
    if 'domain_name' in user_data:
        activity_data['domain'] = user_data['domain_name']
    activity_data['activity'] = "Project Exported"
    activity_data['api_error_message'] = "Project Exported successfully"
    activity_data['api_status'] = "Success"
    try:
        db.execute({
            "query": "update_reports_activity",
            "values": activity_data
        })
    except Exception as e:
        print(f"failed to update activity table in project_module file and _export_project function : ", e)
    return response

def get_base64_image(rows):
    for row in rows:
        try:
            binary_image_data = row["base64_image"]
            base64_image= base64.b64encode(binary_image_data).decode('utf-8')
            base64_image = base64_image.replace("dataimage/pngbase64", "data:image/png;base64,")
            row["base64_image"] = base64_image.rstrip('=')
        except:
            print("Error in project_module file and get_base64_image function => ", e)
            pass
    return rows

def _select_figure_data(data, is_results=False):
    email = db.execute({
        "query": "select_sysusers",
        "values": {
            "sysuser_id": data.get('sysuser_id')
        }
    })
    email = email[0]['email'] if email and isinstance(email[0], dict) and 'email' in email[0] else ''
    domain_name = ''
    parts = email.split('@')
    if len(parts) == 2:
        domain_name = parts[1]
    else:
        domain_name = None
    data['domain'] = domain_name
    try:
        domain_rows = db.execute({
            "query": "select_figure_data",
            "values": {
                'access_level': 'company',
                'domain': data.get('domain')
            }
        })
        domain_rows = get_base64_image(domain_rows)
        sysuser_rows = db.execute({
            "query": "select_figure_data",
            "values": {
                'access_level': 'user',
                'sysuser_id': data.get('sysuser_id')
            }
        })
        
        sysuser_rows = get_base64_image(sysuser_rows)
        project_rows = db.execute({
            "query": "select_figure_data",
            "values": {
                'access_level': 'project',
                'project_id': int(data.get('project_id'))
            }
        })
        project_rows = get_base64_image(project_rows)
        rows = {"company": domain_rows, "user": sysuser_rows, "project": project_rows}
        if is_results == True:
            return rows
        response = db_format_response(rows, "Success", "section_save_success", "Data retrieved successfully")

    except Exception as e:
        print("Error in project_module file and _select_figure_data function => ", e)
        if is_results == True:
            print("error", e)
            return None
        response = db_format_response([], "Error", "section_save_fail", f"Failed to retrieve data: {str(e)}")

    return response

def _is_user_have_figures_data(data):
    try:
        rows = _select_figure_data(data, is_results=True)
        if rows is None:
            return False, []
        all_figures = []
        for _, user_figures in rows.items():
            all_figures.extend(user_figures)
        if len(all_figures) > 0:
            return True, all_figures
        return False, []
    except Exception as e:
        print("Error in project_module file and _is_user_have_figures_data function => ", e)
        return False, []

def _select_project_figure_data(data, is_results = False):
    rows = []
    try:
        figure_rows = db.execute({
                "query": "select_one_figure_sections",
                "values": {
                    "sh.project_id": data['project_id']
                }
        })
        if len(figure_rows) > 0:
            claims_section_history_id = figure_rows[0].get('claim_section_history_id')
            if claims_section_history_id is not None:
                rows = []
                if claims_section_history_id is not None:
                    flowchart_details = _select_flowchart_diagram(data= {"claim_section_history_id": claims_section_history_id}, is_results=True)
                    blockdiagram_details = _select_block_diagram(data= {"claim_section_history_id": claims_section_history_id}, is_results=True)
                    flowchart_details = flowchart_details[0] if len(flowchart_details) > 0 else {}
                    blockdiagram_details = blockdiagram_details[0] if len(blockdiagram_details) > 0 else {}
                    flowchart_user_figures = flowchart_details.get("user_figures",[])
                    blockdiagram_user_figures = blockdiagram_details.get("user_figures",[])
                    flowchart_user_figures = flowchart_user_figures if flowchart_user_figures is not None else []
                    blockdiagram_user_figures = blockdiagram_user_figures if blockdiagram_user_figures is not None else []
                    selected_figures = {}
                    for figure_details in flowchart_user_figures + blockdiagram_user_figures:
                        if figure_details is not None and figure_details.get("fig") is not None:
                            selected_figures[figure_details.get("fig").lower()] = figure_details
                    selected_figure_names = list(selected_figures.keys())
                    user_figures_details = _select_figure_data(data,is_results = True)
                    if user_figures_details is not None:
                        for _, user_figures in user_figures_details.items():
                            for fig in user_figures:
                                fig_name = fig['name']
                                if fig_name.lower() in selected_figure_names:
                                    fig['breif_descriptions'] = fig['brief_description']
                                    rows.append(fig)
                if is_results == True:
                    return rows
        else:
            rows = []
        if is_results == True:
            return rows
        else:
            response = db_format_response(rows, "Success", "section_save_success", "Data retrieved successfully")
        
        return response
    except Exception as e:
        print("Error in project_module file and _select_project_figure_data function => ", e)
        
def _select_other_detailed_description_clm(data, is_results=False):
    try:
        if is_results == False:
            data = request.get_json()
        rows = db.execute({
            "query": "figures_based_on_same_claim",
            "values": {
                "claim_section_history_id": data['claim_section_history_id'],
                "section_type": "extra_diagram"
            }
        })
        if is_results == True:
            return rows
        if len(rows)>0 and 'is_error' in rows[0] and rows[0]['is_error'] == 'Error':
            value = db_format_response("Error","ignore",f"{(rows[0]['section_type']).lower()}_fail","Error", flag = False)
            rows[0]['message'] = value['message']
            rows[0]['message_long'] = value['message_long']
        if len(rows)>0 and 'is_dd_error' in rows[0] and rows[0]['is_dd_error'] == 'Error':
            value = db_format_response("Error","ignore",f"{(rows[0]['section_type']).lower()}_description_fail","Error", flag = False)
            rows[0]['message_dd'] = value['message']
            rows[0]['message_dd_long'] = value['message_long']
        response = db_format_response(
            rows, "Success", "ignore", "section data load successfully")
    except Exception as e:
        print("Error in project_module file and _select_other_detailed_description_clm function => ", e)
        if is_results == True:
            return None
        response = db_format_response(
           f"{data['section_type']}_fail", "Error", "ignore", f"{str(e)}")
    return response



def _select_total_detailed_description_clm(data, is_results=False):
    try:
        if is_results == False:
            data = request.get_json()
        rows = db.execute({
            "query": "figures_based_on_same_claim",
            "values": {
                "claim_section_history_id": data['claim_section_history_id'],
                "section_type": "total_detailed_description"
            }
        })
        if is_results == True:
            return rows
        if len(rows)>0 and 'is_error' in rows[0] and rows[0]['is_error'] == 'Error':
            value = db_format_response("Error","ignore",f"{(rows[0]['section_type']).lower()}_fail","Error", flag = False)
            rows[0]['message'] = value['message']
            rows[0]['message_long'] = value['message_long']
        if len(rows)>0 and 'is_dd_error' in rows[0] and rows[0]['is_dd_error'] == 'Error':
            value = db_format_response("Error","ignore",f"{(rows[0]['section_type']).lower()}_fail","Error", flag = False)
            rows[0]['message_dd'] = value['message']
            rows[0]['message_dd_long'] = value['message_long']
        response = db_format_response(
            rows, "Success", "ignore", "section data load successfully")
    except Exception as e:
        print("Error in project_module file and _select_total_detailed_description_clm function => ", e)
        if is_results == True:
            return None
        response = db_format_response(
           f"{data['section_type']}_fail", "Error", "ignore", f"{str(e)}")
    return response

def _auth_init():
    _client = stytch.Client(
        project_id=auth_stytch_project_id,
        secret=auth_stytch_secret,
        environment=auth_stytch_env,
    )
    return _client 

def _auth_request_2fa(data):
    client = _auth_init()
    try:
        resp = client.otps.email.send(
            email=data['email']
        )
        return {'key': resp.email_id, 'status': 'Success'}
    except Exception as e:
        return {'status': 'Failed'}

def _auth_validate_2fa(data):
    client = _auth_init()
    try:
        resp = client.otps.authenticate(
            method_id=data['key'],
            code=data['code']
        )
        return {"status": "Success"}
    except:
        return {"status": "Failed"}
    
def _auth_request_2fa_sms(data):
    client = _auth_init()
    try:
        resp = client.users.search(
            limit = 1,
            query = stytch.consumer.models.users.SearchUsersQuery(
                operator = "AND",
                operands = [
                    {
                    "filter_name": "email_address",
                    "filter_value": [data['email']]
                    }
		        ]
            )
        )
        if len(resp.results) > 0:
            user = resp.results[0]
            phone_number = user.phone_numbers[0].phone_number
            resp = client.otps.sms.send(
                phone_number=phone_number
            )
        return {'key': resp.phone_id, 'status': 'Success'}
    except Exception as e:
        print(e)    
        return {'status': 'Failed'}
    
def _auth_login(data):
    client = _auth_init()
    try:
        resp = client.passwords.authenticate(
            email=data['email'],
            password=data['password'],
            session_duration_minutes = auth_stytch_session_duration_minutes
        )
        session_token = None
        try:
            session_token = resp.session_token
        except:
            pass
        return {'status': 'Success', 'session_token': session_token}
    except Exception as e:
        print(e)
        print(e.details.status_code)
        try:
            if e.details.status_code==400 and e.details.error_type=='unauthorized_credentials':
                return {'status': 'Failed', 'message': 'Invalid Email or Password'}
            elif e.details.status_code==400 and 'password' in e.details.error_type:
                return {'status': 'Failed', 'message': 'reset password'}
        except:
            pass
        return {'status': 'Failed'}
    
def _auth_reset_password(data):
    client = _auth_init()
    try:
        resp = client.passwords.email.reset_start(
            email=data['email'],
            reset_password_template_id = auth_reset_password_template,
            reset_password_redirect_url = reset_password_redirect_url
        )
        return {'key': resp.email_id, 'status': 'Success'}
    except Exception as e:
        print(e)    
        return {'status': 'Failed'}
    
def _auth_check_email(data):
    client = _auth_init()
    try:
        resp = client.users.search(
            limit = 1,
            query = stytch.consumer.models.users.SearchUsersQuery(
                operator = "AND",
                operands = [
                    {
                    "filter_name": "email_address",
                    "filter_value": [data['email']]
                    }
		        ]
            )
        )
        if len(resp.results) > 0:
            user = resp.results[0]
            trusted_metadata={'MFA': None, 'status':  'active'}
            name =  {'first_name': '', 'middle_name': '', 'last_name': '', 'role': ''}
            try:
                trusted_metadata=user.trusted_metadata
            except:
                pass
            try:
                name = user.name.dict()
            except:
                pass
            return {'status': 'Success', 'is_reset_password_need': user.password == None, 'mfa': trusted_metadata['MFA'], 'user_status': trusted_metadata['status'], 'first_name': name['first_name'], 'last_name': name['last_name'], 'middle_name': name['middle_name'], 'role': trusted_metadata.get('role','inventor')}
        else:
            return {'status': 'Failed'}
    except Exception as e:
        return {'status': 'Failed'}
    
def _auth_set_password(data):
    client = _auth_init()
    try:
        resp = resp = client.passwords.email.reset(
            token=data['token'],
            password=data['password'],
        )
        return {'status': 'Success'}
    except:
        return {'status': 'Failed'}
    
def _auth_logout(data):
    client = _auth_init()
    try:
        resp = resp = client.sessions.revoke(
            session_token=data['session_token']
        )
        return {'status': 'Success'}
    except:
        return {'status': 'Failed'}

    # storage_provider = data.get('storage_type') # s3, google, azure
    # file_source = data.get('file_source')  # source file/url/local
    # project_id = data.get('project_id')
    # url_file_path = data.get('url_file_path')
# {'files': [{'path': 'block_diagram prompt.docx'}], 'user_id': 1, 'sysuser_id': 1}
def _reference_files_upload(data):
    sysuser_id = request.environ.get('user_id')
    url_payload = []
    storage = Storage(
        store_type="s3",
        config={
            "s3": {
                "access_key": AWS_ACCESS_KEY,
                "secret_key": AWS_SECRET_KEY,
                "bucket_name": AWS_S3_BUCKET,
                "region": REGION
            }
        }
    )

    storage_object = storage.get_object()


    try:
        update_user_file_row = db.execute({
            "query": "update_user_file",
            "values": {
                "sysuser_id" : sysuser_id
            }
        })
        files = request.files.getlist('files')
        for file in files:
            file_data = file.read()
            #detector = magic.Magic()
            #file_type = detector.from_buffer(file_data)
            
            file_name = file.filename
            print("file_name", file_name)
            file_type = file_name.split('.')[-1].strip()
            file_obj = storage_object.upload_flask_uploaded_file(
            file_name=file.filename,
            uploaded_file=file_data,
            upload_file_path=f"user/{sysuser_id}",
            )
            relative_path = f'user/{sysuser_id}/{file_name}'
            relative = storage_object.make_file_public(file_obj.name)
            file_url = storage_object.get_pre_signed_url(relative_file_path=file_obj.name)

            # Calculate file size in kilobytes
            file_size = len(file_data) / 1024
            url_payload.append(file_url)
            file_detail_row = db.execute({
                "query": "update_file_detail",
                "values": {
                        "sysuser_id" : sysuser_id,
                        "file_size" : file_size,
                        "file_type" : file_type,
                        "file_path" : relative_path,
                        "file_url" : file_url,
                        "user_file_uuid" : update_user_file_row[0]['user_file_uuid'],
                        "file_name" : file_name
                    }
                })
        proxy_data = { 
                "port":"20025",
                "flag":"prob_sol",
                "urls": url_payload,
                "input": data.get('input', '')
            }
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': 'PHPSESSID=1enobik9804t4sq319i00s8134',
            
        }
        response = requests.request("POST", proxy_base_url, headers=headers, data=urllib.parse.urlencode(proxy_data))

        response_value = json.loads(response.text)
        final_value = {}
        for value in ['problem', 'solution', 'prior_art', 'embodiments', 'uses', 'procedure']:
            if value in response_value['data'] and len(response_value['data'][value].strip())>0:
                response_value['data'][value].strip()
                response_value['data'][value] += '\n\n'
                if value.capitalize() not in final_value:
                    if value == 'procedure':
                        final_value['Problem'] += response_value['data'][value]
                    elif value == 'uses':
                        final_value['Solution'] += response_value['data'][value]
                    else:
                        final_value[value.capitalize()] = response_value['data'][value]

        print("response_value", response_value)
        update_user_file_row = db.execute({
            "query": "update_user_file",
            "values": {
                "sysuser_id" : sysuser_id,
                "user_file_uuid" : update_user_file_row[0]['user_file_uuid'],
                "problem_statement" : json.dumps(response_value['data'])
            }
        })
        
        response = db_format_response(
           {"invention" : final_value, "upload_file_id": update_user_file_row}, "Success", "ignore", "File uploaded successfully")
    except Exception as e:
        print("Error in project_module file and _reference_files_upload function => ", e)
        response = db_format_response(
            "", "Error", "ignore", f"{str(e)}")
    return response


def _get_novelty(data):
    try:
        update_user_file_row = db.execute({
                "query": "get_user_file",
                "values": {
                    "user_file_uuid" : data.get('user_file_uuid')
                }
            })
        final_value = ""
        for value in ['problem', 'solution', 'prior_art', 'embodiments', 'uses', 'procedure']:
            if value in update_user_file_row[0]['problem_statement'] and len(update_user_file_row[0]['problem_statement'][value].strip())>0:
                    update_user_file_row[0]['problem_statement'][value].strip()
                    update_user_file_row[0]['problem_statement'][value] += '\n\n'
                    final_value += f"{value.capitalize()} : {update_user_file_row[0]['problem_statement'][value]}"
            
        
        
        novelty_data = { 
                "port":"20024",
                "flag":"prob_sol",
                "invention" : final_value.replace('“','').replace('”',''),
                "input_type" : 'Invention' #patent_number
            }
        headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': 'PHPSESSID=1enobik9804t4sq319i00s8134',
                
            }
        response_value = requests.request("POST", novelty_url, headers=headers, data=urllib.parse.urlencode(novelty_data))
    
        response = db_format_response(
            json.loads(response_value.text), "Success", "ignore", "File uploaded successfully")
    except Exception as e:
        print("Error in project_module file and _reference_files_upload function => ", e)
        response = db_format_response(
            "", "Error", "ignore", f"{str(e)}")
    return response

def _role_check_to_access(data):
    try:
        role = data.get('role','attorney')
        rows = db.execute({
            "query": "get_privileges_by_role",
            "values": {
                "sr.name": role
            }
        })
        flags = [x['name'] for x in rows]
        tools = list(set([x['tool'] for x in rows]))
        access_details = {"flags" : flags, "tools": tools, "status": "Success"}
        print("role", role, "access_details", access_details)
        return access_details
    except Exception as e:
        print("Error in project_module file and _role_check_to_access function => ", e)
        return {"status": "Failed"}