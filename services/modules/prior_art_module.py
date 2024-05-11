
import json
import os
import re
import time

import requests
from bs4 import BeautifulSoup
from core.config import *
from core.config import (access_token_url, gpt_model, gpt_temperature,
                         maximum_invention_tokens, maximum_tokens,
                         pcs_base_client_id, pcs_base_client_secret,
                         pcs_query_url, prior_art_similarity_thresold,
                         prior_art_url)
from core.notification import draft_format_response
from core.prompts import (build_patent_terms_extract,
                          instructions_for_prior_art_terms,
                          instructions_for_similarity_invention_to_claims,
                          num_tokens_from_string, request_openai_chat)
from modules.project_module import get_sysuser_id
from flask import Blueprint, Flask, jsonify, request
from joblib import Parallel, delayed
from requests.packages.urllib3.exceptions import InsecureRequestWarning
from rich.console import Console

prior_art_val = []
prior_art_analysis = []
console = Console()

requests.packages.urllib3.disable_warnings(InsecureRequestWarning)


def _get_access_token():
    """
    Get the access token required for making requests to the Patent Claim Service API.

    Returns:
        str: The access token.
    """
    access_token_data = {
        "client_id": pcs_base_client_id,
        "client_secret": pcs_base_client_secret
    }
    try:
        access_token = requests.post(
            access_token_url, access_token_data, verify=False)
        access_token = json.loads(access_token.text)
    except:
        return None
    return access_token['access_token']


def _get_terms(invention, access_token):
    """
    Get the terms and synonyms for a given invention.

    Args:
        invention (str): The invention title.
        access_token (str): The access token for the Patent Claim Service API.

    Returns:
        tuple: A tuple containing the terms and synonyms.
    """
    pcs_query_data = {
        "invention": invention,
        "access_token": access_token
    }
    try:
        pcs_query_terms_response = requests.post(
            pcs_query_url, pcs_query_data, verify=False)
        pcs_query_terms = json.loads(pcs_query_terms_response.text)
    except:
        return None
    return pcs_query_terms['data']['gpt_terms'], pcs_query_terms['data']['synonyms'], pcs_query_terms['data']['semantics']


def _get_patents(access_token, query, limit):
    """
    Get the patents for a given query.

    Args:
        access_token (str): The access token for the Patent Claim Service API.
        query (str): The query to search for patents.
        limit (int): The maximum number of patents to retrieve.

    Returns:
        tuple: A tuple containing the patent families and patents.
    """
    pcs_pa_data = {
        "query": query,
        "limit": limit,
        "access_token": access_token
    }
    try:
        pa_patents_response = requests.post(
            prior_art_url, pcs_pa_data, verify=False)
        pa_patents = json.loads(pa_patents_response.text)
    except:
        return None, None
    return pa_patents['families'], pa_patents['patents']


def _conceptstoquery_tags_mm(concepts, source, syns, mm=2):
    """
    Convert concepts to a query string with minimum match (mm) value.

    Args:
        concepts (list): The list of concepts.
        source (str): The source to search for the concepts.
        syns (dict): The dictionary of synonyms.
        mm (int): The minimum match value.

    Returns:
        str: The query string.
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


def _build_similarity_response(type, patents, messages, project_id, api_status, api_status_code, api_message, db_status, db_status_code, db_message):
    """
    Build the response for the similarity analysis.

    Args:
        type (str): The type of analysis.
        patents (list): The list of patents.
        messages (dict): The messages for the analysis.
        project_id (str): The project ID.
        api_status (str): The status of the API.
        api_status_code (str): The status code of the API.
        api_message (str): The message from the API.
        db_status (str): The status of the database.
        db_status_code (str): The status code of the database.
        db_message (str): The message from the database.

    Returns:
        dict: The response.
    """
    return draft_format_response(type=type, generated_text=patents, project_id=project_id, sections_id=None, section_history_id=None, api_status=api_status, api_status_code=api_status_code, api_message=api_message, db_status=db_status, db_status_code=db_status_code, db_message=db_message)


def _get_project_history_data(project_history_id):
    """
    Get the project data for a given project ID.

    Args:
        project_id (str): The project ID.

    Returns:
        str: The project data.
    """
    try:
        rows = db.execute({
            "query": "select_one_project_history",
            "values": {
                "project_history_id": project_history_id
            }
        })
        if (rows == []):
            response = "Not found"
        else:
            response = rows[0]
    except Exception as e:
        response = "Error"
    return response


def _get_invention_patent_similarity(project_id, invention, patents):
    """
    Get the similarity between the invention and the patents.

    Args:
        invention (str): The invention title.
        patents (list): The list of patents.

    Returns:
        dict: The dictionary of patent similarity details.
    """

    def process_request(i):
        """
        Get the similarity between invention and the claim

        Returns:
            dict: list of the publications with similarity score, invention novality summary, referent patent novality summary and similarity summary
        """
        patent = patents[i]
        claims = "Not Available"
        if 'clm' in patent:
            claims = BeautifulSoup(patent['clm'], 'html.parser').get_text()
        _messages = build_patent_terms_extract(
            system_instructions=instructions_for_similarity_invention_to_claims, invention=invention, extra=claims)
        count = sum([num_tokens_from_string(x['content']) for x in _messages])
        ncount = count
        """ Truncate the claims, if it is more than 1536 tokens"""
        max_count = 1536
        remove_index = 100
        prev_messages = _messages
        prev_ncounts = ncount
        if ncount > max_count:
            _messages = build_patent_terms_extract(system_instructions=instructions_for_similarity_invention_to_claims,
                                                   invention=invention, extra=" ".join(claims.split(" ")[0:remove_index]))
            ncount = sum([num_tokens_from_string(x['content'])
                         for x in _messages])
            for remove_index in range(100, max_count+100, 50):
                if ncount < max_count:
                    _messages = build_patent_terms_extract(
                        system_instructions=instructions_for_similarity_invention_to_claims, invention=invention, extra=" ".join(claims.split(" ")[0:remove_index]))
                    ncount = sum([num_tokens_from_string(x['content'])
                                 for x in _messages])
                else:
                    break
                prev_messages = _messages
                prev_ncounts = ncount
        _messages = prev_messages
        _generated_text, _api_status, _api_status_code, _api_status_message,usages = request_openai_chat(
            project_id, section_type = 'prior_art_similarity', model="gpt-4", messages=_messages, temperature=gpt_temperature, request_max_tokens=2048)
        if _api_status == "Success":
            return _generated_text, _messages, _api_status, _api_status_code, _api_status_message, usages
        else:
            return None, _api_status, _messages, _api_status_code, _api_status_message, usages
    """ Request openai parallel requests - 
        TODO: make it generate so it useful for other requriements """
    results = Parallel(n_jobs=3)(
        delayed(process_request)(i) for i in range(0, len(patents))
    )
    retry_results_index = []
    retry_patents = []
    for index, (result, patent) in enumerate(zip(results, patents)):
        if result == None:
            retry_results_index.append(index)
            retry_patents.append(patent)
    if len(retry_results_index) > 0:
        retry_results = Parallel(n_jobs=3)(
            delayed(process_request)(i) for i in range(0, len(retry_patents)))
        for retry_index, retry_result in zip(retry_results_index, retry_results):
            if retry_result == None:
                results[retry_index] = retry_result
    print(" Total Failed ", len([x for x in results if x == None]), "Requested", len(
        patents), "Respond", len([x for x in results if x != None]))
    """ Parse the output for each patent similarity with invention"""
    invention_patent_similarity_dict = {}
    _messages, _api_status, _api_status_code, _api_status_message,usages = {}, None, None, None,{}
    for i, (result, messages, api_status, api_status_code, api_status_message, usages) in enumerate(results):
        patent = patents[i]
        pubnum = patent['pn']
        _messages, _api_status, _api_status_code, _api_status_message = messages, api_status, api_status_code, api_status_message
        if _api_status == "Success":
            try:
                invention_patent_similarity_dict[pubnum] = eval(result)
            except:
                pass
        else:
            result, messages, api_status, api_status_code, api_status_message = process_request(
                i)
            _messages, _api_status, _api_status_code, _api_status_message = messages, api_status, api_status_code, api_status_message
            if _api_status == "Success":
                try:
                    invention_patent_similarity_dict[pubnum] = eval(result)
                except:
                    pass
            else:
                break
    return invention_patent_similarity_dict


def _generate_search_query_terms(project_id, section_type,messages):
    """
        Generate the search query build stategy using invention

        Returns:
            generated_text (str): search query build stategy
            api_status (str): The status of the API.
            api_status_code (str): The status code of the API.
            api_status_message (str): The message from the API.
    """
    generated_text, api_status, api_status_code, api_status_message,usage = request_openai_chat(
        project_id, section_type, model='gpt-4', messages=messages, temperature=gpt_temperature,  request_max_tokens=4*1024)
    try:
        generated_text = eval(generated_text)
    except:
        pass
    return generated_text, api_status, api_status_code, api_status_message,usage

def _get_prior_art_2_0(access_token, fdata: dict):
    invention, countries, pridate, appdate, pubdate = fdata.get('invention',''), fdata.get('countries',[]), fdata.get('pridate',''), fdata.get('appdate',''), fdata.get('pubdate','')
    data = {'invention': invention, 'country': ','.join([x.strip() for x in countries]), 'pridate':pridate,'pubdate':pubdate,'appdate':appdate,'flag':'gpt_rank'}
    for key in fdata.keys():
        if key not in ['invention', 'countries', 'pridate', 'appdate', 'pubdate']:
            data[key] = fdata[key]
    response = {}
    try:
        response = requests.post(
            prior_art2_url, data, verify=False, timeout=600)
        response = json.loads(response.text)
    except Exception as e:
        print("Prior-art failed exception", e)
        response = {}
    return response.get('status', 'Error'),  response.get('data', {})

def _get_prior_art_autocomplete(access_token:str, field:str, query:str):
    data = {'prefix': query}
    if field in ['companies']:
        data['field'] = 'co'
    elif field in ['refrence_patent_number']:
        data['field'] = 'pn'
    elif field in ['necessary_key_words']:
        data['field'] = 'text'
    elif field in ['primary_class']:
        data['field'] = 'cpcpri'
    
    response = {}
    try:
        response = requests.post(
            prior_art_autocomplete, data, verify=False, timeout=600)
        response = json.loads(response.text)
        target_field = 'label_orig'
        if field in ['refrence_patent_number']:
            target_field = 'pn'
        for i in range(len(response.get('suggestions', []))):
            response['suggestions'][i]['slabel'] = response['suggestions'][i][target_field]   
        response = response.get('suggestions', [])
    except Exception as e:
        print("Prior-art failed exception", e)
        response = {}
    return response

def _build_prior_art(data):
    fdata = {}
    fdata['invention'] = data.get('invention_title')
    fdata['countries'] = [x['country'].lower() for x in data.get('filters',{}).get('selected_countries',[])]
    filters = data.get('filters',{})
    fields = {'pridate':'priority_date','appdate':'application_date','pubdate':'publication_date'}
    for fk,k in fields.items():
        if k in filters:
            fdata[fk] = filters.get(k,'T')
        else:
            fdata[fk] = 'T'
        if fdata[fk] is None:
            fdata[fk] = 'T'
        fdata[fk] =  fdata[fk].split('T')[0]
    for key in filters.keys():
        if key not in fields:
            fdata[key] = filters[key]
    access_token = _get_access_token()
    status, results = _get_prior_art_2_0(access_token, fdata)
    fresults = []
    
    fields = {'co':'co','pn':'ucid', 'dolcera_score':'dolcera_score', 'prid': 'prid', 'similarity_summary': 'similarity', 'similarity_score': 'similarity_score', 'difference': 'difference', 'invention_summary': 'invention_summary', 'title':'title', 'link':'link', 'cpcpri':'cpcpri','pd' : 'pd','ad':'ad', 'explanation' : 'similarity_sentences'}
    if results.get('output') is not None:
        for result in results['output']:
            result['invention_summary'] = results['novelty']
            fresults.append({fk:str(result[k]) for fk,k in fields.items() if k in result})
    sorted_patents_analysis = fresults
    api_status = "Success" if status == True else "Error"
    api_status_code = "" if status == True else "prior_art_fail"
    rows = db.execute({
        "query": "select_project_history",
        "values": {
            "project_id": data.get('project_id'),
        }
    })
    project_history_id = -1
    if (rows is not None):
        project_history_id = rows[0]['project_history_id']
    rows = db.execute({
                "query": "update_project_history",
                "values": {
                    "project_history_id": project_history_id,
                    "invention_title": data.get('invention_title'),
                    "project_id": data.get('project_id'),
                    "prior_art_query_inputs": json.dumps({}),
                    "prior_art": json.dumps({}),
                    "prior_art_analysis": json.dumps(sorted_patents_analysis),
                    "is_error": api_status,
                    "filters": json.dumps(filters)
                }
            })
    project_id = data['project_id']
    api_status_code = ""
    api_status_message = ""
    activity_data = {}
    user_data = get_sysuser_id('', project_id, None)
    if 'sysuser_id' in user_data:
        activity_data["sysuser_id"] = user_data['sysuser_id']
    if project_id is not None:
        activity_data['project_id'] = project_id
    if 'domain_name' in user_data:
        activity_data['domain'] = user_data['domain_name']
    activity_data['activity'] = "Prior-art Generated"
    activity_data['api_error_message'] = "Prior-art Generated successfully"
    activity_data['api_status'] = "Success"

    try:
        if len(activity_data) > 0:
            db.execute({
                "query": "update_reports_activity",
                "values": activity_data
            })
    except Exception as e:
        print(f"failed to update activity table in prior-art generate ", e)
        pass

    return _build_similarity_response(type=type, patents=sorted_patents_analysis, messages={}, project_id=project_id, api_status=api_status, api_status_code=api_status_code, api_message=api_status_message, db_status="Success", db_status_code="", db_message="")


# data = {
#     "invention": """To prepare a filled pastry, a raw, unbaked pastry dough comprising biscuit flour (49-60%), fat (20-40%), and water (10-25%) is kneaded and laminated. A filling with a high water content (80-85%), such as a béchamel sauce, is deposited between layers of the pastry dough. To prevent the béchamel sauce from moistening the pastry dough during microwave cooking and allow it to become crisp, a ‘barrier’ layer comprising fat (80-98%), calcium caseinate (7-13%), and carrageenan (0.7-1.3%) is sprayed onto the pastry dough before the béchamel sauce is deposited. The fat in the ‘barrier’ layer, such as lard, melts during microwave cooking, coating the béchamel sauce and pastry dough and preventing moisture transfer between them.""",
#     "project_id": "1",
#     "countries": ["us"],
#     "pridate": "2019-01-01",
#     "appdate": "",
#     "pubdate": ""
# }
# _build_prior_art(data)

def _build_prior_art_1_0(data):
    """
        Build the prior_art for the given invention

        Returns:
            pubnums (list): prior art's publication numbers 
            is_load_more (bool): #TODO to support pagination in prior_art
    """
    global prior_art_val, prior_art_analysis
    type = 'prior_art'
    patents = []
    query_details = {}
    sorted_patents_analysis = None
    api_status, api_status_code, api_status_message = "Error", "prior_art_fail", ""
    data = request.get_json()
    invention = data['invention_title']
    project_id = data['project_id']
    user_data = get_sysuser_id('', project_id, None)
    activity_data = {
        "project_id": project_id,
        "sysuser_id": user_data['sysuser_id'],
        "domain": user_data['domain_name'],
        "activity": 'prior_art generated successfully',
        "api_status": "Success",
        "api_error_message": "get prior_art data successfully",
    }
    rows = db.execute({
        "query": "select_project_history",
        "values": {
            "project_id": data['project_id'],
        }
    })
    project_history_id = -1
    if (rows is not None):
        project_history_id = rows[0]['project_history_id']
    project_data = _get_project_history_data(project_history_id)
    if (project_data != "Not found"
        and 'prior_art_analysis' in project_data and project_data['prior_art_analysis'] and len(project_data['prior_art_analysis']) > 0):
        prev_prior_art = project_data['prior_art']
        patnet_analysis = project_data['prior_art_analysis']
        api_status = "Success"
        api_status_code = ""
    else:
        try:
            access_token = _get_access_token()
            if access_token is None:
                return _build_similarity_response(type=type, patents=patents, messages={}, project_id=project_id, api_status='error', api_status_code='no_prior_art', api_message="", db_status="", db_status_code="Success", db_message="")
            terms, syns, semantics = _get_terms(
                invention=invention, access_token=access_token)
            if terms is None:
                return _build_similarity_response(type=type, patents=patents, messages={}, project_id=project_id, api_status='error', api_status_code='no_prior_art', api_message="", db_status="", db_status_code="Success", db_message="")
            main_terms = terms.keys()
            api_status, api_status_code, api_status_message = "Success", "openai_success", ""

            messages = build_patent_terms_extract(
                system_instructions=instructions_for_prior_art_terms, invention=invention, extra=", ".join(main_terms))
            count = sum([num_tokens_from_string(x['content'])
                        for x in messages])
            
            """ To handle when invention is more than 1536 tokens """
            max_count = 1536
            if count > max_count:
                messages = build_patent_terms_extract(system_instructions=instructions_for_prior_art_terms, invention=" ".join(
                    invention.split(" ")[0: (len(invention.split(" "))-(count-max_count))]), extra=", ".join(main_terms))
            generated_text, api_status, api_status_code, api_status_message, usages = _generate_search_query_terms(
                project_id, section_type = 'prior_art_search_query_terms', messages=messages)
            query_details = generated_text
            for key, value in query_details.items():
                query_details[key.replace("_", " ")] = value
            if api_status == "Error":
                return _build_similarity_response(type=type, patents=patents, messages={}, project_id=project_id, api_status=api_status, api_status_code=api_status_code, api_message=api_status_message, db_status="Success", db_status_code="", db_message="")
            
            """ Search query build stategy """
            gpt_data = {}
            gpt_data['term_classification'] = query_details['Step 6']
            gpt_data['cpc_codes'] = [query_details['Step 8']['primary']]
            wfs = query_details['Step 7']
            for xx in wfs:
                if xx in syns:
                    syns[xx] = set(syns[xx])
                    syns[xx].update(wfs[xx])
                else:
                    syns[xx] = wfs[xx]
            #TODO test with semantics results comparision, disabled at present
            # for xx in semantics:
            #     if xx in syns:
            #         syns[xx] = set(syns[xx])
            #         syns[xx].update(semantics[xx])
            miss = set(query_details['Step 4'].keys()) - \
                {x['entity'] for x in query_details['Step 6']}
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
                    query1 = '(_query_:"'+ _conceptstoquery_tags_mm(level1,
                                                                  'tac', syns, mm=l1)[0].replace('"', '\\"')+'")'
                    query2 = '(_query_:"'+ _conceptstoquery_tags_mm(level2,
                                                                  'tac', syns, mm=l2)[0].replace('"', '\\"')+'")'
                    query = '('+query1 + ' AND ' + query2+') ' + ' AND allclass:("'+'" OR "'.join(
                        {x.split('/')[0].replace(" ", "") for x in gpt_data['cpc_codes']})+'")'
                    fam, pats = _get_patents(access_token, query, 25)
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
                    '" OR "'.join({x.split('/')[0]
                                  for x in gpt_data['cpc_codes']})+'")'
                fam, pats = _get_patents(access_token, query, 25)

            best_max_results = []
            total = len(patents)
            patents_filtered = patents[0:prior_art_total_patents_to_check]
            patent_analysis_details = _get_invention_patent_similarity(
                project_id, invention=invention, patents=patents_filtered)
            patents_analysis = []
            for patent in patents:
                pubnum = patent['pn']
                if pubnum in patent_analysis_details:
                    try:
                        patent['similarity_score'] = int(
                            patent_analysis_details[pubnum]['similarity_score'])
                        patent['invention_summary'] = patent_analysis_details[pubnum]['invention_summary']
                        patent['claims_summary'] = patent_analysis_details[pubnum]['claims_summary']
                        patent['similarity_summary'] = patent_analysis_details[pubnum]['similarity_summary']
                        explanations = []
                        mapping_fields = {"invention": "invention_summary",
                                          "patent_reference": "claims_summary", "summary": "similarity_summary"}
                        for tag, field in mapping_fields.items():
                            if field in patent:
                                explanations.append(
                                    f"<{tag}>{patent[field]}</{tag}>")
                        patent['explanation'] = "</br></br>".join(explanations)
                    except:
                        print("Skipping Pubnum Bug",  patent_analysis_details[pubnum])
                        continue
                    patents_analysis.append(patent)
                if len(patents_analysis) >= prior_art_total_patents_to_check:
                    break
            
            """ Filtering top patents based on top's score bucket ie. score to score/2 range"""
            sorted_patents_analysis = sorted(
                patents_analysis, key=lambda k: k['similarity_score'], reverse=True)
            print("sorted_patents_analysis", {
                  x['ucid']: x['similarity_score'] for x in sorted_patents_analysis})
            if sorted_patents_analysis is not None and len(sorted_patents_analysis) > 0:
                max_score = sorted_patents_analysis[0]['similarity_score']
                sorted_patents_analysis = [
                    x for x in sorted_patents_analysis if x['similarity_score'] > 0]
                patents_analysis = sorted_patents_analysis[0:
                                                           prior_art_total_patents_to_check]
                for i in range(0, 10):
                    if max_score > prior_art_similarity_thresold/(2**i):
                        sorted_patents_analysis = [
                            x for x in sorted_patents_analysis if x['similarity_score'] > prior_art_similarity_thresold/(2**(i+1))]
                    if len(sorted_patents_analysis) > 0:
                        break
                sorted_patents_analysis = sorted_patents_analysis
#review these messages
            if (len(patents)==0):
                activity_data['activity'] = 'Prior-art Failed'
                activity_data['api_status'] = 'Error'
                activity_data['api_error_message'] = 'prior_art filed to update in project table'

            db.execute({
                "query": "update_reports_activity",
                "values": activity_data
            })
            rows = db.execute({
                "query": "update_project_history",
                "values": {
                    "project_history_id": project_history_id,
                    "invention_title": invention,
                    "project_id": project_id,
                    "prior_art_query_inputs": json.dumps(query_details),
                    "prior_art": json.dumps(patents),
                    "prior_art_analysis": json.dumps(sorted_patents_analysis),
                    "is_error": api_status
                }
            })
            if(len(rows)>0):
                activity_data['activity'] = 'Prior-art Created'
                activity_data['api_status'] = 'Success'
                activity_data['api_error_message'] = 'prior_art successfully updated in project table'
            else:
                activity_data['activity'] = 'Prior-art Failed'
                activity_data['api_status'] = 'Error'
                activity_data['api_error_message'] = 'prior_art filed to update in project table'
            db.execute({
                "query": "update_reports_activity",
                "values": activity_data
            })
        except Exception as e:
            api_status = "Error"
            api_status_code = "prior_art_fail"
            print("prior_art_fail")
    response = {}
    response['pubnums'] = sorted_patents_analysis
    response['is_load_more'] = True
    return _build_similarity_response(type=type, patents=response, messages={}, project_id=project_id, api_status=api_status, api_status_code=api_status_code, api_message=api_status_message, db_status="Success", db_status_code="", db_message="")

def _priorart_auto_complete(data):
    access_token = None #_get_access_token()
    field=data.get('input_section')
    query=data.get('input_search_keywords')
    project_id = data.get('project_id')
    results = _get_prior_art_autocomplete(access_token=access_token, field=field, query=query)
    print("results==>",results)
    auto_suggestions = {}
    auto_suggestions[field] = [{'display': result['label'], 'value': result['slabel']} for result in results]
    api_status = 'Success'
    api_status_code =''
    api_status_message = ''
    return  _build_similarity_response(type = type, patents=auto_suggestions,  messages={},project_id = project_id, api_status=api_status, api_status_code=api_status_code, api_message=api_status_message, db_status="Success", db_status_code="", db_message="" )
        
        
    