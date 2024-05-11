import json
import logging
import re
import time

import openai
import pandas as pd
import requests
from random import randint
from core.common.postgresql import PostgresDB
from core.config import *
from core.config import (api_key, db, db_config, env, gpt_model,
                         gpt_temperature, maximum_tokens, pcs_base_client_id,
                         pcs_base_client_secret, pcs_base_url)
from core.notification import (db_format_response, draft_format_response,
                               get_notification_message)
# from core.prompt_v2 import _claim, _title, _background_description, _technical_field, _abstract, _summary
from core.prompt_v2 import _section_prompt_stream, _section_stream
# from core.prompts import build_claim_message, build_section_message, num_tokens_from_string, request_openai_chat
# from core.prompts import *
from core.prompts import *
from flask import (Blueprint, Flask, Response, json, jsonify, request,
                   stream_with_context)
from flask_cors import CORS
from joblib import Parallel, delayed
from modules.patent_module import _generate_sections_type, _get_invention_title
from rich.console import Console

# from core.prompt_v2 import  _claim, _title, _background_description, _technical_field, _abstract, _summary, _regenerate_claim, _flowchart_diagram, _flowchart_description, _block_diagram, _block_diagram_description


draft_api_blueprint = Blueprint('draft', __name__, url_prefix='/')
logger = logging.getLogger("draft.log")
console = Console()


openai.api_key = api_key


prior_art_val = []
prior_art_analysis = []




@draft_api_blueprint.route('/get_invention_title', methods=['POST'])
def get_invention_title():
    data = request.get_json()
    response = _get_invention_title(data, id=None)
    return response


@draft_api_blueprint.route('/<section_type>', methods=['POST'])
def section_stream(section_type, prompt_section = '',pid = None):
    data = request.get_json()
    prompt_section = section_type.lower()
    if section_type in ['flowchart_description','block_diagram_description','other_detailed_description']:
        time.sleep(randint(2,5))
    if(section_type in ['flowchart_description','flowchart_common']):
        section_type = 'flowchart_diagram'
    if(section_type in ['block_diagram_description','block_diagram_common']):
        section_type = 'block_diagram'
    if(section_type in ['extra_diagram_common','extra_description']):
        section_type = 'extra_diagram'
    if(section_type in ['total_detailed_description']):
        section_type = 'total_detailed_description'
    
    return  Response(stream_with_context(_section_stream(data,pid,section_type,prompt_section)), content_type='text/event-stream')

@draft_api_blueprint.route('/patentDetails/<int:pid>/edit/<section_type>', methods=['POST'])
def section_prompt_stream(section_type,prompt_section = '',pid = None):
    prompt_section =  section_type.lower()
    data = request.get_json()
    prompt_section = section_type.lower() 
    return  Response(stream_with_context(_section_prompt_stream(data,pid,section_type,prompt_section)), content_type='text/event-stream')


# # @draft_api_blueprint.route('/<section_type>', methods=['POST'])
# @draft_api_blueprint.route('/patentDetails/<int:pid>/edit/<section_type>', methods=['POST'])
# def generate_sections_type(section_type, pid=None):
#     data = request.get_json()
#     response = _generate_sections_type(section_type,data,pid)
#     return response

