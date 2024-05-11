"""
S3 storage
"""

import os
from libcloud.storage.types import Provider
from libcloud.storage.providers import get_driver
from libcloud.storage.types import ContainerDoesNotExistError

from blob_storage.storage_provider_base import StorageProvider


class AWSS3Storage(StorageProvider):
    """
    S3 storage Class that upload file, get url, etc
    """
    def __init__(
            self,
            access_key: str,
            secret_key: str,
            bucket_name: str,
            region: str,
            url_encode_dict: dict = None
    ) -> None:
        """
        Args:
            access_key: AWS access key, str
            secret_key: AWS secret key, str
            bucket_name: AWS bucket name, str
            region: AWS bucket region, str
            url_encode_dict: dict e.g {"#":"%23", "&":"%26"}
        """

        self.access_key = access_key
        self.secret_key = secret_key
        self.bucket_name = bucket_name
        self.region = region
        self.driver = None

        cls = get_driver(Provider.S3)
        self.driver = cls(self.access_key, self.secret_key, region=self.region)

        super().__init__(driver=self.driver, url_encode_dict=url_encode_dict)

    def upload(
            self,
            file_content: bytes,
            file_name: str,
            upload_file_path: str = None
    ):
        """
        Upload File to s3

        params:
        file_content: bytes, required, binary of file content
        file: str, required, file name of uploaded file
        """

        try:
            bucket_obj = self.driver.get_container(container_name=self.bucket_name)
        except ContainerDoesNotExistError:
            bucket_obj = self.driver.create_container(container_name=self.bucket_name)

        file_full_path = self.get_file_full_path(
            file_name=file_name,
            upload_file_path=upload_file_path
        )

        try:
            file_iter = iter([file_content])
            obj = bucket_obj.upload_object_via_stream(iterator=file_iter, object_name=file_full_path)
            return obj
        except Exception as e:
            raise e

    def get_pre_signed_url(
            self,
            relative_file_path: str,
            expiration: float = 300
    ):
        """
        Args:
            relative_file_path: path of file
            expiration:  url expiration time in second

        Returns:
            url: str, url of that file
        """

        self.timeout = expiration

        container = self.driver.get_container(self.bucket_name)
        obj = container.get_object(relative_file_path)
        url = self.driver.get_object_cdn_url(obj, ex_expiry=(expiration/3600))

        return url

    def read_content(self, file_path: str):
        """
        Read content from file which is stored in s3 bucket
        Args:
            file_path:

        Returns:

        """
        obj = self.get(file_path)
        content = b''
        for chunk in obj.as_stream():
            content += chunk

        return content

    def get(self, key):
        container = self.driver.get_container(self.bucket_name)
        obj = container.get_object(f"{self.bucket_name}/{key}")
        return obj

    def folder_exists(self, folder_path: str):
        """
        check if folder exists or not
        Args:
            folder_path: path of folder or file

        Returns:
            Boolean True if exists else False
        """
        try:
            return self.driver.get_container(f"{self.bucket_name}/{folder_path}")
        except ContainerDoesNotExistError as e:
            return False

    def create_folder(self, folder_path):
        """
        create folder if not exists
        Args:
            folder_path:

        Returns:
            success folder object
        """
        if not folder_path.endswith('/'):
            folder_path += '/'

        try:
            response = self.driver.create_container(f"{self.bucket_name}/{folder_path}")
            return response
        except Exception as e:
            raise e

    def make_file_public(self, file_path: str):
        """
            file_path: file path to make public file
        """

        container = self.driver.get_container(self.bucket_name)

        obj = container.get_object(file_path)

        obj.acl = 'public-read'

        return True







