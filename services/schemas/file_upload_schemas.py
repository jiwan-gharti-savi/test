from marshmallow import Schema, validates_schema, ValidationError, fields, pre_load, EXCLUDE, validates
from flask import request

class FileUploadSchema(Schema):
    file_source = fields.Str(required=True)
    project_id = fields.Str(required=True)
    storage_type = fields.Str(required=True)
    file = fields.Field()
    url_file_path = fields.Str()
    local_file_path = fields.Str()

    class Meta:
        # Include unknown fields in the deserialized output
        unknown = EXCLUDE

    @validates_schema
    def validate(self, data, **kwargs):
        if data.get('file_source') == 'file' and not request.files.get('file'):
            raise ValidationError("file must be provided if file source is 'file'")

        elif data.get('file_source') == 'url' and not data.get('url_file_path'):
            raise ValidationError("url_file_path must be provided if file source is 'url'")

        elif data.get('file_source') == 'local' and not data.get('local_file_path'):
            raise ValidationError("url_file_path must be provided if file source is 'local'")


