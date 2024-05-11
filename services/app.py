from flask import Flask, jsonify
from flask_cors import CORS
from core.common.postgresql import PostgresDB
import logging
import json
from apis.prior_art_api import patent_blueprint
from apis.project_api import project_api_blueprint
from apis.patent_api import draft_api_blueprint
from apis.file_storage_api import file_storage_api_blueprint

from apis.jwt_api import JWTMiddleware


app = Flask(__name__)
CORS(app)

app.wsgi_app = JWTMiddleware(app.wsgi_app)


app.register_blueprint(patent_blueprint)
app.register_blueprint(project_api_blueprint)
app.register_blueprint(draft_api_blueprint)
app.register_blueprint(file_storage_api_blueprint)

if __name__ == '__main__':
    app.debug = True
    app.run()
