from blob_storage.azure_blob_storage import AzureBlobStorage
from blob_storage.google_storage import GoogleCloudStorage
from blob_storage.local_storage import LocalStorage
from blob_storage.s3_storage import AWSS3Storage
from core.config import MEDIA_FOLDER


class Storage(object):
    def __init__(
        self,
        store_type: str,
        config: dict,
    ):
        self.store_type = store_type
        self.driver = None
        self.config = config

        if store_type == 'local':
            self.driver = LocalStorage(
                bucket_name=MEDIA_FOLDER
            )

        elif store_type.lower() == 's3':
            config_dict = self.config.get("s3")
            self.driver = AWSS3Storage(
                access_key=config_dict.get("access_key"),
                secret_key=config_dict.get("secret_key"),
                bucket_name=config_dict.get("bucket_name"),
                region=config_dict.get("region")
            )
        elif store_type.lower() == 'google':
            config_dict = self.config.get("google")
            self.driver = GoogleCloudStorage(
                key_file_path=config_dict.get("key_file_path"),
                project_id=config_dict.get("project_id"),
                bucket_name=config_dict.get("bucket_name")
            )
        elif store_type.lower() == 'azure':
            config_dict = self.config.get("azure")
            self.driver = AzureBlobStorage(
                account_name=config_dict.get("account_name"),
                account_key=config_dict.get("account_key"),
                container_name=config_dict.get("container_name")
            )

    def get_object(self):
        return self.driver

    # def is_valid_url(self, url):
    #     try:
    #         result = urlparse(url)
    #         return all([result.scheme, result.netloc])
    #     except ValueError:
    #         return False
    #
    # def is_valid_local_path(self, path):
    #     return os.path.exists(path)

    # def upload_url_file(
    #     self,
    #     url_path: str
    # ):
    #     if self.is_valid_url(url_path):
    #         url_retriever_object = URLFileRetriever(file_source=url_path)
    #         file_content = url_retriever_object.get_content()
    #         file_name = url_retriever_object.get_file_name()
    #         self.driver.upload(file_content=file_content, file_name=file_name)
    #     else:
    #         raise Exception("Invalid URL format")
    #
    # def upload_local_file(
    #     self,
    #     local_file_path: str
    # ):
    #     if self.is_valid_url(local_file_path):
    #         url_retriever_object = LocalFileRetriever(file_source=local_file_path)
    #         file_content = url_retriever_object.get_content()
    #         file_name = url_retriever_object.get_file_name()
    #         self.driver.upload(file_content=file_content, file_name=file_name)
    #     else:
    #         raise Exception("Invalid local path")
    #
    # def upload_flask_uploaded_file(
    #     self,
    #     uploaded_file: FileStorage
    # ):
    #     flask_retriever_object = FlaskFileRetriever(uploaded_file=uploaded_file)
    #     file_content = flask_retriever_object.get_content()
    #     file_name = flask_retriever_object.get_file_name()
    #     self.driver.upload(file_content=file_content, file_name=file_name)
    # def upload_flask_uploaded_file(self):
    #     pass






