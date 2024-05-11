from flask import Flask, jsonify, Blueprint, request, send_file, make_response, Response, stream_with_context
from flask_cors import CORS
from docxtpl import DocxTemplate
from core.config import *
import logging
import requests
import os
import json
import io
import json
import logging
import os
import random
import re
from modules.project_module import _check_access, _signup, _insert_project_data, _insert_section_history, _update_invention_title, _select_login, _load_all_project, _is_inserted_project, _select_project_history, _select_one_project_history, _select_one_section, _select_one_section_type, _export_project, _export_prior_art, _check_each_section_type, _select_section_history, _is_finished, _is_detailed_discription_based_on_same_claim, _is_re_draft_claim, _download_btn_active, _is_prior_art, _select_flowchart_diagram, _jwt_verification, _select_block_diagram, _select_regenerate_claim, _is_selected_clm_id, _update_figure_data, _select_figure_data, _select_project_figure_data, _update_project_history, _claim_change, _invention_disclosure_invention, _is_claim_invention, _invention_disclosure_claim, _insert_claim_data, _select_other_detailed_description_clm, _select_total_detailed_description_clm, _delete_project_data, _archive_project_data, _search_project_data, _reference_files_upload, _auth_request_2fa, _auth_request_2fa_sms, _auth_validate_2fa,_auth_login, _auth_reset_password, _auth_check_email,  _auth_set_password, _auth_logout, _role_check_to_access, _get_novelty

project_api_blueprint = Blueprint('project', __name__, url_prefix='/')

logger = logging.getLogger("draft.log")


#  ========================== insert queries ========================== #


@project_api_blueprint.route('/check_access', methods=['POST'])
def check_access():
    data = request.get_json()
    response = _check_access(data)
    return response


@project_api_blueprint.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    response = _signup(data)
    return response


@project_api_blueprint.route('/verify_session', methods=['POST'])
def jwt_verification():
    data = request.headers
    response = _jwt_verification(data)
    return response

@project_api_blueprint.route('/insert_project_data', methods=['POST'])
def insert_project_data():
    data = request.get_json()
    response = _insert_project_data(data)
    return response


@project_api_blueprint.route('/update_project_history', methods=['POST'])
def update_project_history():
    data = request.get_json()
    response = _update_project_history(data)
    return response

@project_api_blueprint.route('/invention_disclosure_invention', methods=['POST'])
def invention_disclosure_invention():
    data = request.get_json()
    response = _invention_disclosure_invention(data)
    return  Response(stream_with_context(_invention_disclosure_invention(data)), content_type='text/event-stream')


@project_api_blueprint.route('/invention_disclosure_claim', methods=['POST'])
def invention_disclosure_claim():
    data = request.get_json()
    response = _invention_disclosure_claim(data)
    return  Response(stream_with_context(_invention_disclosure_claim(data)), content_type='text/event-stream')


@project_api_blueprint.route('/is_finished', methods=['POST'])
def is_finished():
    data = request.get_json()
    response = _is_finished(data)
    return response

@project_api_blueprint.route('/is_claim_invention', methods=['POST'])
def is_claim_invention():
    data = request.get_json()
    response = _is_claim_invention(data)
    return response


@project_api_blueprint.route('/_claim_change', methods=['POST'])
def claim_change():
    data = request.get_json()
    response = _claim_change(data)
    return response


@project_api_blueprint.route('/insert_section_history', methods=['POST'])
def insert_section_history():
    data = request.get_json()
    response = _insert_section_history(data)
    return response

@project_api_blueprint.route('/insert_claim_data', methods=['POST'])
def insert_claim_data():
    data = request.get_json()
    response = _insert_claim_data(data)
    return response

@project_api_blueprint.route('/update_invention_title', methods=['POST'])
def update_invention_title():
    data = request.get_json()
    response = _update_invention_title(data)
    return response

@project_api_blueprint.route('/update_figure_data', methods=['POST'])
def update_figure_data():
    data = request.get_json()
    response = _update_figure_data(data)
    return response

@project_api_blueprint.route('/delete_project_data', methods=['POST'])
def delete_project_data():
    data = request.get_json()
    response = _delete_project_data(data)
    return response

@project_api_blueprint.route('/archive_project_data', methods=['POST'])
def archive_project_data():
    data = request.get_json()
    response = _archive_project_data(data)
    return response



@project_api_blueprint.route('/login', methods=['POST'])
def select_login():
    data = request.get_json()
    response = _select_login(data)
    return response


@project_api_blueprint.route('/load_all_project', methods=['POST'])
def load_all_project():
    data = request.get_json()
    response = _load_all_project(data)
    return response


@project_api_blueprint.route('/search_project_data', methods=['POST'])
def search_project_data():
    data = request.get_json()
    response = _search_project_data(data)
    return response

@project_api_blueprint.route('/is_inserted_project', methods=['POST'])
def is_inserted_project():
    data = request.get_json()
    response = _is_inserted_project(data)
    return response


@project_api_blueprint.route('/select_project_history', methods=['POST'])
def select_project_history():
    data = request.get_json()
    if len(data)>0 and 'invention' in data:
        del data['invention']
    response = _select_project_history(data)
    return response


@project_api_blueprint.route('/select_one_project_history', methods=['POST'])
def select_one_project_history():
    data = request.get_json()
    response = _select_one_project_history(data)
    return response



@project_api_blueprint.route('/select_one_section', methods=['POST'])
def select_one_section():
    data = request.get_json()
    response = _select_one_section(data)
    return response


@project_api_blueprint.route('/select_one_section_type', methods=['POST'])
def select_one_section_type():
    data = request.get_json()
    response = _select_one_section_type(data)
    return response


@project_api_blueprint.route('/select_flowchart_diagram', methods=['POST'])
def select_flowchart_diagram():
    data = request.get_json()
    response = _select_flowchart_diagram(data)
    return response

@project_api_blueprint.route('/is_DD_based_on_same_claim', methods=['POST'])
# Detailed Discription figure is generated based on same claim or not
def is_DD_based_on_same_claim():
    data = request.get_json()
    response = _is_detailed_discription_based_on_same_claim(data)
    return response


@project_api_blueprint.route('/export_project', methods=['POST'])
def export_project():
    data = request.get_json()
    response = _export_project(data)
    return response


@project_api_blueprint.route('/export_prior_art', methods=['POST'])
def export_prior_art():
    data = request.get_json()
    response = _export_prior_art(data)
    return response


@project_api_blueprint.route('/check_data_of_each_section_type', methods=['POST'])
def check_each_section_type():
    data = request.get_json()
    response = _check_each_section_type(data)
    return response


@project_api_blueprint.route('/select_section_history', methods=['POST'])
def select_section_history():
    data = request.get_json()
    response = _select_section_history(data)
    return response


@project_api_blueprint.route('/is_re_draft_claim', methods=['POST'])
def is_re_draft_claim():
    data = request.get_json()
    response = _is_re_draft_claim(data)
    return response


@project_api_blueprint.route('/download_btn_active', methods=['POST'])
def download_btn_active():
    data = request.get_json()
    response = _download_btn_active(data)
    return response


@project_api_blueprint.route('/is_prior_art', methods=['POST'])
def is_prior_art():
    data = request.get_json()
    response = _is_prior_art(data)
    return response


@project_api_blueprint.route('/select_flowchart_diagram_clm', methods=['POST'])
def select_flowchart_diagram_clm():
    data = request.get_json()
    response = _select_flowchart_diagram(data)
    return response


@project_api_blueprint.route('/select_block_diagram_clm', methods=['POST'])
def select_block_diagram_clm():
    data = request.get_json()
    response = _select_block_diagram(data)
    return response


@project_api_blueprint.route('/select_regenerate_claim', methods=['POST'])
def select_regenerate_claim():
    data = request.get_json()
    response = _select_regenerate_claim(data)
    return response


@project_api_blueprint.route('/is_selected_clm_id', methods=['POST'])
def is_selected_clm_id():
    data = request.get_json()
    response = _is_selected_clm_id(data)
    return response


@project_api_blueprint.route('/select_figure_data', methods=['POST'])
def select_figure_data():
    data = request.get_json()
    response = _select_figure_data(data)
    return response

@project_api_blueprint.route('/select_project_figure_data', methods=['POST'])
def select_project_figure_data():
    data = request.get_json()
    response = _select_project_figure_data(data)
    return response

@project_api_blueprint.route('/select_other_detailed_description_clm', methods=['POST'])
def select_other_detailed_description_clm():
    data = request.get_json()
    response = _select_other_detailed_description_clm(data)
    return response

@project_api_blueprint.route('/select_total_detailed_description_clm', methods=['POST'])
def select_total_detailed_description_clm():
    data = request.get_json()
    response = _select_total_detailed_description_clm(data)
    return response
  
@project_api_blueprint.route('/reference_files_upload', methods=['POST'])
def reference_files_upload():
    data = request.form.to_dict()
    response = _reference_files_upload(data)
    return response

@project_api_blueprint.route('/get_novelty', methods=['POST'])
def get_novelty():
    data = request.get_json()
    response = _get_novelty(data)
    return response

@project_api_blueprint.route('/role_check_to_access', methods=['POST'])
def role_check_to_access():
    data = request.get_json()
    response = _role_check_to_access(data)
    return response
  
@project_api_blueprint.route('/auth_request_2fa', methods=['POST'])
def auth_request_2fa():
    data = request.get_json()
    response = _auth_request_2fa(data)
    return response

@project_api_blueprint.route('/auth_request_2fa_sms', methods=['POST'])
def auth_request_2fa_sms():
    data = request.get_json()
    response = _auth_request_2fa_sms(data)
    return response

@project_api_blueprint.route('/auth_validate_2fa', methods=['POST'])
def auth_validate_2fa():
    data = request.get_json()
    response = _auth_validate_2fa(data)
    return response

@project_api_blueprint.route('/auth_login', methods=['POST'])
def auth_login():
    data = request.get_json()
    response = _auth_login(data)
    return response

@project_api_blueprint.route('/auth_reset_password', methods=['POST'])
def auth_reset_password():
    data = request.get_json()
    response = _auth_reset_password(data)
    return response

@project_api_blueprint.route('/auth_check_email', methods=['POST'])
def auth_check_email():
    data = request.get_json()
    response = _auth_check_email(data)
    return response


@project_api_blueprint.route('/auth_set_password', methods=['POST'])
def auth_set_password():
    data = request.get_json()
    response = _auth_set_password(data)
    return response

@project_api_blueprint.route('/auth_logout', methods=['POST'])
def auth_logout():
    data = request.get_json()
    response = _auth_logout(data)
    return response

