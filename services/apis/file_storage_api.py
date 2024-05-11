from core.prompts import *
from flask import Blueprint, request, jsonify
from rich.console import Console
from modules.file_storage_module import upload_file_to_cloud
from schemas.file_upload_schemas import FileUploadSchema
from marshmallow import ValidationError

file_storage_api_blueprint = Blueprint('file_storage', __name__, url_prefix='/')
logger = logging.getLogger("file_storage.log")
console = Console()


@file_storage_api_blueprint.route('/upload', methods=['POST'])
def upload_file():
    """
    Upload a file to different cloud provider
    Returns:
        Success Or Failure with status code
    """


    try:
        _ = FileUploadSchema().load(data=request.form.to_dict())
    except ValidationError as err:
        errors = err.messages
        return jsonify({"message": "Validation error", "errors": errors}), 400

    try:
        user_id = request.environ['user_id']
    except Exception as e:
        return jsonify({"error": "Invalid user", "message": str(e)}), 400

    # Define the local file path
    data = request.form.to_dict()

    return upload_file_to_cloud(user_id=user_id, data=data)

