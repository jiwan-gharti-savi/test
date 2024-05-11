import os
from libcloud.storage.types import Provider
from libcloud.storage.providers import get_driver
from libcloud.storage.types import ContainerDoesNotExistError

from blob_storage.storage_provider_base import StorageProvider


class GoogleCloudStorage(StorageProvider):
    """
    Google Cloud Storage Class that uploads files, gets URLs, etc.
    """

    def __init__(
            self,
            key_file_path: str,
            project_id: str,
            bucket_name: str,
            url_encode_dict: dict = None
    ) -> None:
        """
        Args:
            key_file_path: Path to the service account key file
            project_id: Google Cloud Project ID
            bucket_name: Google Cloud Storage bucket name
            url_encode_dict: dict e.g {"#":"%23", "&":"%26"}
        """
        self.key_file_path = key_file_path
        self.project_id = project_id
        self.bucket_name = bucket_name
        self.driver = None

        cls = get_driver(Provider.GOOGLE_STORAGE)
        self.driver = cls(key_file=key_file_path, project=project_id)

        super().__init__(driver=self.driver, url_encode_dict=url_encode_dict)

    def upload(
            self,
            file_content: bytes,
            file_name: str,
            upload_file_path: str = None
    ):
        """
        Upload File to Google Cloud Storage

        params:
        file_content: bytes, required, binary content of the file
        file_name: str, required, name of the uploaded file
        """
        file_full_path = self.get_file_full_path(
            file_name=file_name,
            upload_file_path=upload_file_path
        )
        try:
            self.driver = self._get_driver()
            container = self.driver.get_container(container_name=self.bucket_name)
            obj = container.upload_object_via_stream(iterator=[file_content], object_name=file_full_path)
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
            relative_file_path: path of the file
            expiration:  URL expiration time in seconds

        Returns:
            url: str, URL of the file
        """
        container = self.driver.get_container(container_name=self.bucket_name)
        obj = container.get_object(relative_file_path)
        url = self.driver.get_object_cdn_url(obj, ex_expiry=(expiration/3600))
        return url

    def read_content(self, file_path: str):
        """
        Read content from file which is stored in Google Cloud Storage
        Args:
            file_path: path of the file

        Returns:
            content: content of the file
        """
        obj = self.get(file_path)
        content = b''
        for chunk in obj.as_stream():
            content += chunk
        return content

    def get(self, key):
        container = self.driver.get_container(container_name=self.bucket_name)
        obj = container.get_object(key)
        return obj

    def folder_exists(self, folder_path: str):
        """
        Check if folder exists in Google Cloud Storage
        Args:
            folder_path: path of folder or file

        Returns:
            Boolean: True if exists else False
        """
        if not folder_path.startswith('/'):
            folder_path = f'/{folder_path}'

        try:
            return self.driver.get_container(container_name=self.bucket_name)
        except ContainerDoesNotExistError as e:
            return False

    def create_folder(self, folder_path):
        """
        Create folder if not exists in Google Cloud Storage
        Args:
            folder_path: path of folder

        Returns:
            success: True if folder created successfully
        """
        try:
            response = self.driver.create_container(container_name=folder_path)
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
