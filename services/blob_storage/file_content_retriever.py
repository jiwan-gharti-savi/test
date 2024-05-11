"""
This module is used to retrieve the file content from different path and file
"""

from __future__ import annotations
import os
import requests


class LocalFileRetriever(object):
    """
    Class to retrieve local file contents and filename
    """

    def __init__(self, file_source):
        self.file_source = file_source

    def get_content(self) -> bytes:
        with open(self.file_source, 'rb') as file_obj:
            return file_obj.read()

    def get_file_name(file_path: str) -> str:
        filename = os.path.basename(file_path)
        return filename


class URLFileRetriever(object):
    """
    Class to retrieve file contents and filename from valid URL
    """

    def __init__(self, file_source: str) -> None:
        self.file_source = file_source

    def get_content(self) -> bytes:
        response = requests.get(self.file_source)
        if response.status_code == 200:
            return response.content
        else:
            raise ValueError(f"Failed to fetch file from URL: {self.file_source}")

    def get_file_name(self) -> str:
        filename = self.file_source.rsplit('/', 1)[-1]
        return filename


class FlaskFileRetriever(object):
    """
    Class to retrieve content and filename from Flask File object
    """

    def __init__(self, uploaded_file):
        self.uploaded_file = uploaded_file

    def get_content(self) -> bytes | None:
        if self.uploaded_file:
            file_content = self.uploaded_file.read()
            return file_content

        return None

    def get_file_name(self) -> str:
        return self.uploaded_file.filename
