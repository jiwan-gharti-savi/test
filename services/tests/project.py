import json
import unittest
from unittest.mock import patch
from app import app
from dotted_dict import DottedDict
from tests.base import TestBaseApi
from tests.auth import TestAuthApi

class TestProjectApi(TestBaseApi):
    
    def setUp(self):
        super().setUp()
        self.auth = TestAuthApi()
        self.auth.setUp()
        self.auth.test_signup_flow()
        self.data = self.auth._get_data()
        self.headers = {'Authorization': f"Bearer {self.data['token']}", 'Content-Type': 'application/json'};

    def _get_data(self):
        return self.data

    def _get_all_projects(self):
        data = {}
        response = self.client.post('/load_all_project', json=data, headers=self.headers)
        results = json.loads(response.text)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(results['status'], 'Success')
        return len(results['response'])

    def _create_project(self, option="", invention_title=None):
        if 'project_id' not in self.data or invention_title is not None:
            curr_total_projects = self._get_all_projects()
            if invention_title is None:
                invention_title = self.cases.project.invention_title
                if option == "_max":
                    invention_title = invention_title*20
            data = { 'invention_title': invention_title,'project_type':'prior_art'}
            response = self.client.post('/insert_project_data', json=data, headers=self.headers)
            results = json.loads(response.text)
            self.assertEqual(response.status_code, 200)
            self.assertEqual(results['status'], 'Success')
            new_total_projects = self._get_all_projects()
            self.assertEqual(results['status'], 'Success')
            self.assertEqual(curr_total_projects <  new_total_projects, True)
            self.data['project_id'] = results['response']['project_id']

    def test_create_project(self):
        self._create_project()

    # def test_check_access(self):
    #     self._create_project()
    #     data = {'project_id': self.data["project_id"]}
    #     response = self.client.post('/check_access', json=data, headers=self.headers)
    #     results = json.loads(response.text)
    #     print("result from test_check_access => ", results)
    #     self.assertEqual(response.status_code, 200)
    #     self.assertEqual(results['status'], 'Success')

    def test_get_invention_title(self):
        self._create_project()
        data = {'project_id': self.data["project_id"]}
        response = self.client.post('/get_invention_title', json=data, headers=self.headers)
        results = json.loads(response.text)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(results['status'], 'Success')
        return len(results['response'])
    
    def test_is_inserted_project(self):
        self._create_project()
        data = {'project_id': self.data["project_id"]}
        response = self.client.post('/is_inserted_project', json=data, headers=self.headers)
        results = json.loads(response.text)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(results['status'], 'Success')
        return len(results['response'])
    
    def test_select_project_history(self):
        self._create_project()
        data = {'project_id': self.data["project_id"]}
        response = self.client.post('/select_project_history', json=data, headers=self.headers)
        results = json.loads(response.text)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(results['status'], 'Success')
        return len(results['response'])
    
    def test_select_one_section(self):
        self._create_project()
        data = {'project_id': self.data["project_id"]}
        response = self.client.post('/select_one_section', json=data, headers=self.headers)
        results = json.loads(response.text)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(results['status'], 'Success')
        return len(results['response'])
    
    def _check_fail_db_case(self, path):
        data = {}
        response = self.client.post(path, json=data, headers=self.headers)
        results = json.loads(response.text)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(results['status'], 'Error')

    def test_db_error_case(self):
        with patch("modules.project_module.db.execute") as mock_request:
            mock_request.side_effect = Exception("Database error")
            # self._check_fail_db_case("/check_access")
            self._check_fail_db_case("/insert_project_data")
            self._check_fail_db_case("/load_all_project")
            self._check_fail_db_case("/is_inserted_project")
            self._check_fail_db_case("/select_project_history")
