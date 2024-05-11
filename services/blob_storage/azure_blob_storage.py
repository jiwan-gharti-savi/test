"""
Azure Blob Storage
"""

import os
from libcloud.storage.types import Provider
from libcloud.storage.providers import get_driver
from libcloud.storage.types import ContainerDoesNotExistError

from blob_storage.storage_provider_base import StorageProvider


class AzureBlobStorage(StorageProvider):
    """
    Azure Blob Storage Class that upload file, get url, etc
    """
    def __init__(
        self,
        account_name: str,
        account_key: str,
        bucket_name: str,
        url_encode_dict: dict = None

    ) -> None:
        """
        Args:
            account_name: Azure Storage account name, str
            account_key: Azure Storage account key, str
            bucket_name: Azure Blob container name, str
            url_encode_dict: dict e.g {"#":"%23", "&":"%26"}
        """
        self.account_name = account_name
        self.account_key = account_key
        self.bucket_name = bucket_name
        self.driver = None

        Driver = get_driver(Provider.AZURE_BLOBS)
        self.driver = Driver(key=self.account_key, account=self.account_name)

        super().__init__(driver=self.driver, url_encode_dict=url_encode_dict)

    def upload(
        self,
        file_content: bytes,
        file_name: str,
        upload_file_path: str = None
    ):
        """
        Upload File to Azure Blob Storage

        params:
        file_content: bytes, required, binary of file content
        filename: str, required, file name of uploaded file
        """
        try:
            container_obj = self.driver.get_container(self.bucket_name)
        except ContainerDoesNotExistError:
            container_obj = self.driver.create_container(self.bucket_name)

        file_full_path = self.get_file_full_path(
            file_name=file_name,
            upload_file_path=upload_file_path
        )


        try:
            # Ensure that file_content is iterable
            file_iter = iter([file_content])
            obj = container_obj.upload_object_via_stream(iterator=file_iter, object_name=file_full_path)
            return obj
        except Exception as e:
            raise e

    def get_pre_signed_url(
        self,
        relative_file_path: str,
        expiration: float = 300
    ):
        """
        Generates a pre-signed URL for accessing the file

        Args:
            relative_file_path: Relative path of the file
            expiration: URL expiration time in seconds

        Returns:
            url: Pre-signed URL of the file
        """

        container = self.driver.get_container(self.bucket_name)
        obj = container.get_object(f"{relative_file_path}")
        url = self.driver.get_object_cdn_url(obj, ex_expiry=(expiration/3600))

        return url

    def read_content(self, file_path: str):
        """
        Reads content from a file stored in Azure Blob Storage

        Args:
            file_path: Path of the file

        Returns:
            Content of the file as bytes
        """
        obj = self.get(file_path)
        content = b''
        for chunk in obj.as_stream():
            content += chunk

        return content

    def get(self, key):
        """
        Gets the object from Azure Blob Storage

        Args:
            key: Key of the object

        Returns:
            Object from Azure Blob Storage
        """
        container = self.driver.get_container(self.bucket_name)
        obj = container.get_object(key)
        return obj

    def folder_exists(self, folder_path: str):
        """
        Checks if a folder exists in Azure Blob Storage

        Args:
            folder_path: Path of the folder

        Returns:
            Boolean: True if the folder exists, False otherwise
        """
        if not folder_path.startswith('/'):
            folder_path = f'/{folder_path}'

        try:
            return self.driver.get_container(f"{self.bucket_name}/{folder_path}")
        except ContainerDoesNotExistError as e:
            return False

    def create_folder(self, folder_path):
        """
        Creates a folder in Azure Blob Storage

        Args:
            folder_path: Path of the folder to be created

        Returns:
            Success response from Azure Blob Storage
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