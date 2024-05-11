import json
import pytest
import unittest
from unittest.mock import patch
from app import app
from dotted_dict import DottedDict

from tests.base import TestBaseApi

class TestAuthApi(TestBaseApi):
    
    def setUp(self):
        super().setUp()

    def _get_data(self):
        return self.data
    
    def _signup(self,password, status='Success'):
        data = {
            'role_id': self.cases.auth.role_id,
            'email': self.cases.auth.email,
            'privilege_id': self.cases.auth.privilege_id,
            'password': password
            }
        response = self.client.post('/signup', json=data)
        results = json.loads(response.text)
        if results['status'] == 'Success':
            self.data['token'] = results['response']['token']
        self.assertEqual(response.status_code, 200)
        self.assertEqual(results['status'], status)

    def test_db_error_case(self):
        with patch("modules.project_module.db.execute") as mock_request:
            mock_request.side_effect = Exception("Database error")
            self._signup(password=self.cases.auth.password, status='Error')
                
    def test_signup_flow(self):
        self._signup(password=self.cases.auth.password)
        
    def test_reset_password(self):
        self._signup(password=self.cases.auth.new_password)