from flask import request, jsonify
from blob_storage.storage import Storage
from core.config import db, AWS_ACCESS_KEY, AWS_SECRET_KEY, AWS_S3_BUCKET, REGION
import os

def get_filename_from_url(url: str) -> str:
    """
    Extract filename from a URL.

    Args:
        url: The URL from which to extract the filename.

    Returns:
        The filename extracted from the URL.
    """
    return os.path.basename(url)


def upload_file_to_cloud(
    data: dict,
    file_value: str,
):
    print("data", data)
    print("file_value", file_value)
    local_file_path = data.get("local_file_path")
    
    storage_provider = data.get('storage_type') # s3, google, azure
    file_source = data.get('file_source')  # source file/url/local
    url_file_path = data.get('url_file_path')
    user_id = data.get('user_id')
    storage = Storage(
        store_type=storage_provider,
        config={
            "s3": {
                "access_key": AWS_ACCESS_KEY,
                "secret_key": AWS_SECRET_KEY,
                "bucket_name": AWS_S3_BUCKET,
                "region": REGION
            }
        }
    )

    storage_object = storage.get_object()

    file_name = None
    file_path = None

    if file_source == "file":
        uploaded_file = file_value
        print("uploaded_file", uploaded_file)
        file_name = uploaded_file
        print("file_name", file_name)
        uploading_file_path = f"{user_id}/{storage_provider}"
        print("uploading_file_path", uploading_file_path)
        file_obj = storage_object.upload_flask_uploaded_file(
            uploaded_file=uploaded_file,
            upload_file_path=uploading_file_path,
        )
        print("file_obj => ", file_obj)
        file_path = file_obj.name
        print("file_path", file_path)
        return f"{user_id}/{project_id}/{storage_provider}/{file_name}"
        
        

    elif file_source == 'url':
        file_name = get_filename_from_url(url=url_file_path)
        uploading_file_path = f"{user_id}/{storage_provider}"

        file_obj = storage_object.upload_url_file(
            url_path=url_file_path,
            upload_file_path=uploading_file_path,
        )
        file_path = file_obj.name

    elif file_source == 'local':
        file_name = get_filename_from_url(url=local_file_path)

        file_path = f"{user_id}/{storage_provider}"
        file_obj = storage_object.upload_local_file(
            local_file_path=local_file_path,
            upload_file_path=file_path,
        )

        file_path = file_obj.name

        print(storage_object.get_pre_signed_url(
            relative_file_path=f"{user_id}/{project_id}/{storage_provider}/{file_name}"
        ))

    else:
        raise ValueError("There is not value error.")

