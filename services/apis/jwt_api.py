import io
import json

import jwt
from core.config import *
from flask import jsonify, request
from modules.project_module import _check_access

# Secret key used to sign the JWT token (should be the same as the one used for encoding)
SECRET_KEY = jwt_SECRET_KEY
BYPASS_JWT_ENDPOINTS = [
    '/signup', '/auth_request_2fa','/auth_request_2fa_sms', '/auth_validate_2fa', '/auth_login', '/auth_reset_password', '/auth_check_email', '/auth_set_password', '/auth_logout'
]

class JWTMiddleware:
    def __init__(self, app):
        self.app = app

    def __call__(self, environ, start_response):

        if env == 'dev':
            if environ['REQUEST_METHOD'] == 'OPTIONS':
                response_headers = [
                    ('Access-Control-Allow-Origin', f"{OPTIONS_METHOD_CORS_ORIGIN}"),
                    ('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'),
                    ('Access-Control-Allow-Headers', 'Content-Type, Authorization'),
                    ('Content-Length', '0')
                ]
                start_response('200 OK', response_headers)
                return []
            
        path = environ.get('PATH_INFO', '')
        bypass_jwt_verification = any(path.startswith(
            endpoint) for endpoint in BYPASS_JWT_ENDPOINTS)
        
        #print("BYPASS_JWT_ENDPOINTS",BYPASS_JWT_ENDPOINTS)
        #print("path",path)

        if env == 'dev':
            if environ['REQUEST_METHOD'] == 'OPTIONS':
                response_headers = [
                    ('Access-Control-Allow-Origin', f"{OPTIONS_METHOD_CORS_ORIGIN}"),
                    ('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'),
                    ('Access-Control-Allow-Headers', 'Content-Type, Authorization'),
                    ('Content-Length', '0')
                ]
                start_response('200 OK', response_headers)
                return []

        if not bypass_jwt_verification:
            # Get the Authorization header from the environ dictionary
            authorization_header = environ.get('HTTP_AUTHORIZATION')

            if authorization_header and authorization_header.startswith('Bearer '):
                token = authorization_header.split()[1]
            else:
                token = None

            if not token:
                response_body = b'{"message": "Token is missing", "status":"token_error"}'
                start_response('401 Unauthorized', [
                               ('Content-Type', 'application/json'), ('Content-Length', str(len(response_body)))])
                return [response_body]

            try:
                # Verify the token and get the payload data
                payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            except Exception as e:
                response_body = b'{"message": "Token has expired or invalid", "status":"token_error"}'
                start_response('401 Unauthorized', [
                    ('Content-Type', 'application/json'), ('Content-Length', str(len(response_body)))])
                return [response_body]

                # Check if the request content type is form-data
            content_type = environ.get('CONTENT_TYPE', '')
            if 'multipart/form-data' in content_type:
                try:
                    environ['user_id'] = payload.get('sysuser_id', None)
                    return self.app(environ, start_response)
                except Exception as e:
                    response_body = "An error occurred while processing the request."
                    start_response('500 Internal Server Error', [('Content-Type', 'text/plain')])
                    return [response_body.encode()]

            try:
                # Optionally, you can access the payload data in the views using 'request.current_user'
                environ['request.current_user'] = payload
                environ['request.user_id'] = payload.get('sysuser_id', None)

                content_length = int(environ.get('CONTENT_LENGTH', '0'))
                request_body = environ['wsgi.input'].read(content_length)

                if request_body:
                    # Parse the existing POST data (assuming it's in JSON format)
                    request_data = json.loads(request_body.decode('utf-8'))

                    # Replace an existing parameter (e.g., 'existing_param') with a new value
                    request_data['user_id'] = payload.get('sysuser_id', None)
                    request_data['sysuser_id'] = payload.get('sysuser_id', None)

                    # Serialize the modified request data back to JSON
                    modified_request_body = json.dumps(request_data).encode('utf-8')

                    # Update the 'wsgi.input' and 'CONTENT_LENGTH' in the environ dictionary
                    environ['wsgi.input'] = io.BytesIO(modified_request_body)
                    environ['CONTENT_LENGTH'] = str(len(modified_request_body))
                    if payload.get('sysuser_id', None) is not None and request_data.get('project_id', None) is not None and path not in ['/check_access']:
                        data = {
                            'id': payload.get('sysuser_id', None),
                            'project_id': request_data.get('project_id', None)
                        }
                        response = _check_access(data, is_results=True)
                        if response.get("project","no") == "no":
                            raise jwt.InvalidTokenError
                    if payload.get('sysuser_id', None) is not None and request_data.get('user_id', None) is not None:
                        if payload.get('sysuser_id', None) != request_data.get('user_id', None):
                            raise jwt.InvalidTokenError
                    
            except jwt.ExpiredSignatureError:
                response_body = b'{"message": "Token has expired", "status":"token_error"}'
                start_response('401 Unauthorized', [
                               ('Content-Type', 'application/json'), ('Content-Length', str(len(response_body)))])
                return [response_body]
            except jwt.InvalidTokenError:
                response_body = b'{"message": "Invalid token", "status":"token_error"}'
                start_response('401 Unauthorized', [
                               ('Content-Type', 'application/json'), ('Content-Length', str(len(response_body)))])
                return [response_body]

        # Call the next middleware or the actual WSGI application
        return self.app(environ, start_response)
