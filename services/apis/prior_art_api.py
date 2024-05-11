from core.config import *
from core.config import gpt_model, gpt_temperature, access_token_url, pcs_query_url, prior_art_url, pcs_base_client_id, pcs_base_client_secret, prior_art_similarity_thresold
from core.notification import draft_format_response
from core.prompts import build_patent_terms_extract, request_openai_chat, instructions_for_prior_art_terms, instructions_for_similarity_invention_to_claims, num_tokens_from_string
from joblib import Parallel, delayed
from flask import Flask, Blueprint, jsonify, request
from bs4 import BeautifulSoup
import time
import json
import re
import requests

from modules.prior_art_module import _build_prior_art, _priorart_auto_complete
patent_blueprint = Blueprint('patent', __name__, url_prefix='')

@patent_blueprint.route('/similarity', methods=['POST'])
def build_prior_art():
    data = request.get_json()
    response = _build_prior_art(data)
    return response

@patent_blueprint.route('/priorart_auto_complete', methods=['POST'])
def priorart_auto_complete():
    data = request.get_json()
    response = _priorart_auto_complete(data)
    return response
