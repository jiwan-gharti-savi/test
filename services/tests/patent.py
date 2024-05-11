import json
import hashlib
import unittest
from unittest.mock import patch
from app import app
from dotted_dict import DottedDict
from tests.base import TestBaseApi
from tests.project import TestProjectApi

class TestDraftApi(TestBaseApi):
    
    def setUp(self):
        super().setUp()
        self.project = TestProjectApi()
        self.project.setUp()
        self.project._create_project()
        self.data = self.project._get_data()
        self.headers = {'Authorization': f"Bearer {self.data['token']}", 'Content-Type': 'application/json'};

    def _compute_messages_hash(self, messages):
        encoded_text = ""
        for message in messages:
            if 'role' in message and 'content' in message:
                encoded_text += f"{message['role']}-{message['content']}\n"
        encoded_text = encoded_text.encode('utf-8')
        return hashlib.sha256(encoded_text).hexdigest()

    def _check_openai(self, section_type, section_path):
        data = {'project_id': self.data['project_id'], 'data': self.cases.project.invention_title}
        response = self.client.post(section_path, json=data, headers=self.headers)
        results = json.loads(response.text)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(results['status'], 'Success')
            
    def _create_section(self, section_type, section_path, handle='Success', option="",usages={}):
        with patch("modules.patent_module.request_openai_chat") as mock_request:
            section_value = self.cases.project[section_type]
            section_hash = self.cases.prompt_hash[section_type]
            usages['completion_tokens'] = 123
            usages['prompt_tokens'] = 65
            usages['total_tokens'] = 326
            if handle == 'Success':
                mock_request.return_value = section_value, "Success", "openai_success", "", usages
            else:
                mock_request.return_value = None, "Error", "openai_overloaded", "" , usages
            invention_title = self.cases.project.invention_title
            if option == "_max":
                invention_title = invention_title*20
            if section_type == "detailed_description_figures":
                invention_title = self.cases.project.list_of_figures
            data = {'project_id': self.data['project_id'], 'data': invention_title, 'project_history_id':320, 'redraft': True}
            response = self.client.post(section_path, json=data, headers=self.headers)
            results = json.loads(response.text)
            self.assertEqual(response.status_code, 200)
            self.assertEqual(results['status'], handle)
            self.data[section_type] = results['response']
            self.data[f"{section_type}_history_id"] = results['section_history_id']
            if "messages" in results:
                if self._compute_messages_hash(results["messages"]) !=  section_hash:
                    print(f"Promot Missmatch {section_type} ... New Hash: ", self._compute_messages_hash(results["messages"]))
                    print("New Prompt", results["messages"])
                self.assertEqual(self._compute_messages_hash(results["messages"]), section_hash, msg=f"Promot Missmatch {section_type}")

    def _update_section(self, section_type, section_path, option="prompt", usages ={}):
        with patch("modules.patent_module.request_openai_chat") as mock_request:
            prompt_response = self.cases.project[f"{section_type}_{option}"]
            section_hash = self.cases.prompt_hash[f"{section_type}_{option}"]
            usages['completion_tokens'] = 123
            usages['prompt_tokens'] = 65
            usages['total_tokens'] = 326
            mock_request.return_value = prompt_response, "Success", "openai_success", "", usages
            data = {'project_id': self.data['project_id'], 'data': f"Make the {section_type} generialise it"}
            data['section_history_id'] = self.data[f"{section_type}_history_id"]
            
            response = self.client.post(section_path, json=data, headers=self.headers)
            results = json.loads(response.text)
            self.assertEqual(response.status_code, 200)
            self.assertEqual(results['status'], 'Success')
            self.data[f"{section_type}_prompt"] = results['response']
            if 'case' in option:
                self.assertEqual(results['response'], self.cases.project['title'])
            if "messages" in results:
                if self._compute_messages_hash(results["messages"]) !=  section_hash:
                    print(f"Promot Missmatch while Editing ... {section_type}_{option} New Hash: ", self._compute_messages_hash(results["messages"]))
                    print("New Prompt", results["messages"])
                self.assertEqual(self._compute_messages_hash(results["messages"]), section_hash, msg=f"Promot Edit Missmatch {section_type}_{option}")

    # def test_openai(self):
    #     self._check_openai('title', '/Title')

    def test_create_claims_section(self):
        self._create_section('claims', '/Claims')

    def test_create_title_section(self):
        self._create_section('title', '/Title', handle="Error")
        self._create_section('title', '/Title')
        
    def test_create_abstract_section(self):
        self._create_section('abstract', '/Abstract')
        
    def test_create_details_section(self):
        self._create_section('detail_description', '/detail_Description')
        
    def test_create_technical_field_section(self):
        self._create_section('technical_field', '/technical_Field')
        
    def test_create_summary_field_section(self):
        self._create_section('summary', '/summary')
    
    def test_create_background_section(self):
        self._create_section('background_description', '/background_Description')
    
   
    def test_prompt_title_section(self):
        self._create_section('title', '/Title')
        self._update_section('title', f'/patentDetails/{self.data["project_id"]}/edit/Title')

    def test_prompt_title_section_case1(self):
        self._create_section('title', '/Title')
        self._update_section('title', f'/patentDetails/{self.data["project_id"]}/edit/Title', option="case1")
        self._update_section('title', f'/patentDetails/{self.data["project_id"]}/edit/Title', option="case2")
        self._update_section('title', f'/patentDetails/{self.data["project_id"]}/edit/Title', option="case3")
        self._update_section('title', f'/patentDetails/{self.data["project_id"]}/edit/Title', option="case4")
        self._update_section('title', f'/patentDetails/{self.data["project_id"]}/edit/Title', option="case5")
        self._update_section('title', f'/patentDetails/{self.data["project_id"]}/edit/Title', option="case6")
        self._update_section('title', f'/patentDetails/{self.data["project_id"]}/edit/Title', option="case7")
        self._update_section('title', f'/patentDetails/{self.data["project_id"]}/edit/Title', option="case8")
        self._update_section('title', f'/patentDetails/{self.data["project_id"]}/edit/Title', option="case9")
        self._update_section('title', f'/patentDetails/{self.data["project_id"]}/edit/Title', option="case10")
        self._update_section('title', f'/patentDetails/{self.data["project_id"]}/edit/Title', option="case11")

    def test_prompt_abstract_section(self):
        self._create_section('abstract', '/Abstract')
        self._update_section('abstract', f'/patentDetails/{self.data["project_id"]}/edit/Abstract')
    
    def test_prompt_details_section(self):
        self._create_section('detail_description', '/detail_Description')
        self._update_section('detail_description', f'/patentDetails/{self.data["project_id"]}/edit/detail_Description')

    def test_prompt_technical_field_section(self):

        self._create_section('technical_field', '/technical_Field')
        self._update_section('technical_field', f'/patentDetails/{self.data["project_id"]}/edit/technical_Field')

    def test_prompt_summary_field_section(self):

        self._create_section('summary', '/summary')
        self._update_section('summary', f'/patentDetails/{self.data["project_id"]}/edit/summary')

    def test_prompt_claims_section(self):
        self._create_section('claims', '/Claims')
        self._update_section('claims', f'/patentDetails/{self.data["project_id"]}/edit/Claims')

    def test_prompt_background_section(self):
        self._create_section('background_description', '/background_Description')
        self._update_section('background_description', f'/patentDetails/{self.data["project_id"]}/edit/background_Description')

    # def test_prompt_flowchart_diagram_section(self):
    #     self._create_section('flowchart_diagram', '/flowchart_diagram')
        #self._update_section('flowchart_diagram', f'/patentDetails/{self.data["project_id"]}/edit/flowchart_diagram')

    # def test_prompt_list_of_figures_section(self):
    #     # self._create_section('flowchart_diagram', '/flowchart_diagram')
    #     self._create_section('list_of_figures', '/list_of_figures')
    #     self._update_section('list_of_figures', f'/patentDetails/{self.data["project_id"]}/edit/list_of_figures')

    # def test_prompt_detailed_description_figures_section(self):
    #     # self._create_section('flowchart_diagram', '/flowchart_diagram')
    #     self._create_section('list_of_figures', '/list_of_figures')
    #     self._create_section('detailed_description_figures', '/detailed_description_figures')
    #     self._update_section('detailed_description_figures', f'/patentDetails/{self.data["project_id"]}/edit/detailed_description_figures')
        
    def test_select_section_history(self):
        self._create_section('title', '/Title')
        data = {'project_id': self.data["project_id"], 'section_type':'Title'}
        response = self.client.post('/select_section_history', json=data, headers=self.headers)
        results = json.loads(response.text)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(results['status'], 'Success')
        self.data['section_history_id'] = results['response'][0]['section_history_id']
        self.data['section_history_title_content'] = results['response'][0]['text']
        return len(results['response'])
    
    def test_insert_section_history(self):
        self.test_select_section_history()
        data = {'project_id': self.data["project_id"], 'section_type': 'Title', 'version':'1',
                "section_history_id": self.data['section_history_id'], "content": self.cases.project.title}
        response = self.client.post('/insert_section_history', json=data, headers=self.headers)
        results = json.loads(response.text)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(results['status'], 'Success')
        self.assertEqual(self.data['section_history_id'], results['response']['section_history_id'])
        # TODO: need to add sections title verify same text it have
        data = {'project_id': self.data["project_id"], 'section_type': 'Title', 'version':'1',
                "section_history_id": self.data['section_history_id'], "content": self.cases.project.title_save}
        response = self.client.post('/insert_section_history', json=data, headers=self.headers)
        results = json.loads(response.text)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(results['status'], 'Success')
        self.assertEqual(self.data['section_history_id'] < results['response']['section_history_id'], True)
        self.data['title_save'] = results['response']
        # TODO: need to add sections title verify same text it have

    def _check_fail_db_case(self, path):
        data = {'project_id': self.data["project_id"], 'project_history_id':325}
        response = self.client.post(path, json=data, headers=self.headers)
        results = json.loads(response.text)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(results['status'], 'Error')

    # def test_db_error_case(self):
    #     with patch("modules.patent_module.db.execute") as mock_request:
    #         mock_request.side_effect = Exception("Database error")
    #         self._check_fail_db_case("/Title")
    #         self._check_fail_db_case(f"/patentDetails/{self.data['project_id']}/edit/Abstract")

    def test_create_title_section_max(self):
        del self.project.data['project_id']
        self.project._create_project(option="_max")
        self.data = self.project._get_data()
        self._create_section('title', '/Title', handle="Error", option="_max")
