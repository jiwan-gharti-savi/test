import hashlib
import io
import json
import unittest
from unittest.mock import patch

import pytest
from app import app
from docx import Document
from dotted_dict import DottedDict
from modules import prior_art_module
from tests.base import TestBaseApi
from tests.project import TestProjectApi


class TestPriorArtApi(TestBaseApi):
    
    def setUp(self):
        super().setUp()
        self.project = TestProjectApi()
        self.project.setUp()
        self.project._create_project()
        self.data = self.project._get_data()
        self.headers = {'Authorization': f"Bearer {self.data['token']}", 'Content-Type': 'application/json'};
    
    def test_similarity_without_chatgpt(self):
        prior_art_module.prior_art_total_patents_to_check = 1
        usages={}
        usages['completion_tokens'] = 123
        usages['prompt_tokens'] = 65
        usages['total_tokens'] = 326
        with patch('modules.prior_art_module._generate_search_query_terms') as mock_generate_search_query_terms, \
            patch('modules.prior_art_module._get_invention_patent_similarity') as mock_get_invention_patent_similarity:
            mock_generate_search_query_terms.return_value = eval(self.cases.prior_art['gpt_search_terms']), "Success", "", "", usages
            mock_get_invention_patent_similarity.return_value = eval(self.cases.prior_art['similarity'])
            invention = self.cases.prior_art['invention']
            data = {'project_id': self.data['project_id'], 'invention_title': invention}
            response = self.client.post("/similarity", json=data, headers=self.headers)
            results = json.loads(response.text)
            self.assertEqual(response.status_code, 200)
            self.assertEqual(results['status'], "Success")

    def test_similarity(self):
        prior_art_module.prior_art_total_patents_to_check = 1
        usages={}
        usages['completion_tokens'] = 123
        usages['prompt_tokens'] = 65
        usages['total_tokens'] = 326
        with patch('modules.prior_art_module._generate_search_query_terms') as mock_generate_search_query_terms:
            mock_generate_search_query_terms.return_value = eval(self.cases.prior_art['gpt_search_terms']), "Success", "", "",usages
            invention = self.cases.prior_art['invention']
            data = {'project_id': self.data['project_id'], 'invention_title': invention}
            response = self.client.post("/similarity", json=data, headers=self.headers)
            results = json.loads(response.text)
            self.assertEqual(response.status_code, 200)
            self.assertEqual(results['status'], "Success")
            
    # def test_similarity_export_prior_art(self):
    #     data = {'project_id': self.data['project_id']}
    #     print("Request Project", data)
    #     response = self.client.post("/export_prior_art", json=data, headers=self.headers)
    #     #self.assertEqual(response.status_code, 200)
    #     # document = Document(io.BytesIO(response.content))
    #     # document.save("./templates/priorart_export_test.docx")
    #     # paragraphs = document.paragraphs
    #     # content = "\n".join([p.text for p in paragraphs])
    #     # print(content)
    #     print(response.content)