
import re
import subprocess

from core.config import gpt_temperature, mmdc_path, nvm_path, node_version
from core.prompts import request_openai_chat
from langchain.prompts import PromptTemplate

mermaid_validation_prompt_text = """
Mermaid:
{mermaid_text}

Error message:
{mermaid_error}
"""

mermaid_validation_prompt_template = PromptTemplate.from_template(
    mermaid_validation_prompt_text
)

def validate_mermaid_syntax(mermaid_text):
    try:
        if nvm_path is not None:
            command_str = f"source {nvm_path} && nvm use {node_version} && {mmdc_path} -i -"
        else:
            command_str = f"{mmdc_path} -i -"
        result = subprocess.run(
            ['bash', '-c', command_str],
            check=True,
            text=True,
            input=mermaid_text,
            capture_output=True
        )
        if result.stderr:
            return 'Not Valid', result.stderr.strip()
        else:
            return 'Valid', "Valid Mermaid syntax!"
    except subprocess.CalledProcessError as e:
        return 'Valid', e.stderr.strip()
    
def check_and_fix_mermaid_syntax(project_id, section_type, mermaid_text):
    for i in range(0, 1):
        if mermaid_text is not None:
            mermaid_text.strip('```').strip('**').strip('*').strip().strip()
            mermaid_text = re.sub(r'^mermaid', '', mermaid_text)
            mermaid_text = re.sub(r'mermaid$', '', mermaid_text)
            mermaid_status, mermaid_error = validate_mermaid_syntax(mermaid_text)
            if 'Expecting' in mermaid_error:
                mermaid_error = mermaid_error.split('Expecting')[0]
            if mermaid_status == 'Valid':
                return mermaid_text, 'Valid'
            content = mermaid_validation_prompt_template.format(mermaid_text=mermaid_text, mermaid_error=mermaid_error)
            messages = [{
                    'role': 'system',
                    'content': """Fix only the following mermaid for the error and do not change the style of the mermaid and follow below rules:
                                1. Make sure all node's string is enclosed in double quotation marks.
                                2. Do not remove [ or }}. Only fix the system if there are any issues with [,],{{,}}
                                """
                },
                {
                    'role': 'user',
                    'content': content
                },
                {
                    'role': 'assistant',
                    'content': 'Modified Mermaid:'
                }
            ]
            model = "gpt-3.5-turbo"
            section_type = "mermaid verification"
            generated_mermaid_text, api_status, api_status_code, api_status_message,usage = request_openai_chat(project_id,section_type, model, messages, gpt_temperature, is_retry=True, request_max_tokens=1024, step=1)
            if api_status == 'Success' and mermaid_status == 'Valid':
                return generated_mermaid_text, "Valid"
            if generated_mermaid_text is not None:
                mermaid_text = generated_mermaid_text
    return mermaid_text, "Not Valid"