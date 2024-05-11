# storage_provider_base.py
import os
from abc import ABC, abstractmethod
from urllib.parse import urlparse

from werkzeug.datastructures import FileStorage

from blob_storage.file_content_retriever import LocalFileRetriever, FlaskFileRetriever, URLFileRetriever


class StorageProvider(ABC):
    """
    Abstract base class for storage providers.
    """

    def __init__(self, driver, url_encode_dict: dict = None):
        """
        Initialize the storage provider with a driver.
        """
        self.driver = driver
        self.url_encode_dict = url_encode_dict or {"#":"%23", "&":"%26"}


    def _get_driver(self):
        """Abstract method to get a driver"""
        return self.driver

    @abstractmethod
    def upload(self, file_content: bytes, file_name: str, upload_file_path=None):
        """Abstract method to upload a file to S3."""
        raise NotImplementedError("Method _get_driver is not implemented in the subclass.")

    @abstractmethod
    def get_pre_signed_url(self, relative_file_path: str, expiration: int = 10):
        """Abstract method to get a pre-signed URL for a file."""
        raise NotImplementedError("Method get_pre_signed_url is not implemented in the subclass.")

    @abstractmethod
    def read_content(self, file_path: str):
        """Abstract method to read content from a file stored in storage."""
        raise NotImplementedError("Method read_content is not implemented in the subclass.")

    @abstractmethod
    def get(self, key):
        """Abstract method to get an object from storage."""
        raise NotImplementedError("Method get is not implemented in the subclass.")

    def upload_url_file(
        self,
        url_path: str,
        upload_file_path: str = None,
        file_name: str = None
    ):
        """
        Upload a file to the cloud storage bucket from given url and upload_file_path
        Args:
            url_path:  valid url path e.g. https://storage.googleapis.com/test.pdf
            upload_file_path: valid file path, it will be appended with bucket name

        Returns:

        """
        if self.is_valid_url(url_path):
            url_retriever_object = URLFileRetriever(file_source=url_path)
            file_content = url_retriever_object.get_content()
            if file_name:
                file_name = file_name
            else:
                file_name = url_retriever_object.get_file_name()
            return self.upload(file_content=file_content, file_name=file_name, upload_file_path=upload_file_path)
        else:
            raise Exception("Invalid URL format")

    def upload_local_file(
        self,
        local_file_path: str,
        upload_file_path: str = None,
        file_name: str = None
    ):
        """
        Upload a local file to the uploaded file path if upload_file_path is provided
        else it will be uploaded to the default bucket name
        Args:
            local_file_path: where file exists
            upload_file_path:  file path where file will be uploaded

        Returns:
            uploaded file objects respective to cloud
        """

        if self.is_valid_local_path(local_file_path):
            local_retriever_object = LocalFileRetriever(file_source=local_file_path)
            file_content = local_retriever_object.get_content()
            if file_name:
                file_name = file_name
            else:
                file_name = local_retriever_object.get_file_name()

            return self.upload(file_content=file_content, file_name=file_name, upload_file_path=upload_file_path)
        else:
            raise Exception("Invalid local path")

    def upload_flask_uploaded_file(
        self,
        uploaded_file: bytes,
        file_name: str,
        upload_file_path: str = None,
    ):
        """
        Upload a flask uploaded FileStorage file.
        Args:
            uploaded_file: FileStorage file
            upload_file_path: valid path
            file_name: file name

        Returns:
            valid file object of respective cloud

        """
        return self.upload(file_content=uploaded_file, file_name=file_name, upload_file_path=upload_file_path)


    def is_valid_url(self, url):
        """URL Validator """
        try:
            result = urlparse(url)
            return all([result.scheme, result.netloc])
        except ValueError:
            return False

    def is_valid_local_path(self, path):
        """Local path Validator """
        return os.path.exists(path)

    def url_encode(self, url):
        for key,replace in self.url_endoce_dict.items():
            if url is None:
                return url
            url = url.replace(key, replace)
        return url

    def url_decode(self,url):
        for key,replace in self.url_endoce_dict.items():
            url = url.replace(replace, key)
        return url

    def get_file_full_path_using_object(self, obj, expiration: float = 300):
        url = self.driver.get_object_cdn_url(obj, ex_expiry=(expiration/3600))
        return url

    def get_file_full_path(
        self,
        file_name: str,
        upload_file_path: str = None
    ):
        if upload_file_path:
            if not upload_file_path.endswith('/'):
                upload_file_path = f"{upload_file_path}/"

            file_full_path = f"{upload_file_path}{file_name}"
        else:
            file_full_path = f"{file_name}"

        return file_full_path

    @abstractmethod
    def make_file_public(self, file_path: str):
        pass