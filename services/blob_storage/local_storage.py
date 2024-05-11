# storage_provider_base.py
import os
from blob_storage.storage_provider_base import StorageProvider


class LocalStorage(StorageProvider):
    """
    Class for local providers.
    """

    def __init__(
        self,
        bucket_name: str,
        url_encode_dict: dict = None

    ):
        """
        Initialize the storage provider with a driver.
        :params
            bucket_name: base folder
        """
        
        self.driver = None
        self.bucket_name = bucket_name
        super().__init__(driver=self.driver, url_encode_dict=url_encode_dict)

    def upload(
            self,
            file_content: bytes,
            file_name: str,
            upload_file_path: str = None
    ):

        file_full_path = self.get_file_full_path(
            file_name=file_name,
            upload_file_path=upload_file_path
        )

        directory = os.path.dirname(file_full_path)
        if not os.path.exists(directory):
            os.makedirs(directory)

        with open(file_full_path, 'wb') as file_obj:
            file_obj.write(file_content)

        return file_obj

    def get_pre_signed_url(self, relative_file_path: str, expiration: int = 10):
        raise NotImplementedError("Method get_pre_signed_url is not implemented in the subclass.")

    def read_content(self, file_path: str):
        """
        Read and return the content of a file from the local file system.

        Args:
            file_path (str): The path to the file to be read.

        Returns:
            str: The content of the file as a string.
        """
        try:
            with open(f"{self.bucket_name}/{file_path}", 'r') as file_obj:
                content = file_obj.read()
            return content
        except FileNotFoundError:
            print(f"File '{file_path}' not found.")
            return None
        except Exception as e:
            print(f"Error occurred while reading file '{file_path}': {e}")
            return None

    def get(self, file_path):
        """
        Open and return a file object from the local file system.

        Args:
            file_path (str): The path to the file to be opened.

        Returns:
            file object: The file object opened from the local file system.
        """
        try:
            file_obj = open(f"{self.bucket_name}/{file_path}", 'rb')  # Open the file in binary mode
            return file_obj
        except FileNotFoundError:
            return None

    def folder_exists(self, folder_path: str):
        """
           Check if a folder exists.

           Args:
               folder_path (str): The path to the folder.

           Returns:
               bool: True if the folder exists, False otherwise.
       """
        return os.path.exists(f"{self.bucket_name}/{folder_path}")

    def create_folder(self, folder_path: str):
        """
        Create a folder.

        Args:
            folder_path (str): The path to the folder to be created.

        Returns:
            None
        """
        os.makedirs(f"{self.bucket_name}/{folder_path}", exist_ok=True)