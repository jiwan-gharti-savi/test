import logging
from datetime import datetime
from logging.handlers import TimedRotatingFileHandler

from core.config import env, log_path
from flask import jsonify

# Create a logger
logger = logging.getLogger('my_logger')
logger.setLevel(logging.DEBUG)

# Create a formatter
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')

# Create a file handler to write log messages to a file
day_of_week = datetime.now().strftime('%a')
file_handler = TimedRotatingFileHandler(f'{log_path}/ipauthor_{day_of_week}.log', when='midnight', interval=1, backupCount=7)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)

# TODO: move notification messages to db
notification_messages = {
    "openai_overloaded": {
        "message": "ChatGPT is currently experiencing high demand",
        "message_long": "We apologize, but ChatGPT is currently handling a high volume of requests. Please try again in a few minutes.",
        "message_time": 5000
    },
    "openai_timeout": {
        "message": "ChatGPT request timed out",
        "message_long": "We apologize, but ChatGPT is temporarily unable to process your request due to high demand. Please try again in a few minutes.",
        "message_time": 5000
    },
    "openai_unavailable": {
        "message": "ChatGPT is currently unavailable",
        "message_long": "We apologize for the inconvenience, but ChatGPT is currently under heavy load. Please try again soon.",
        "message_time": 5000
    },
    "openai_draft_successful": {
        "message": "Draft saved successfully",
        "message_long": "Your draft has been saved successfully and is ready for review.",
        "message_time": 1000
    },
    "openai_error": {
        "message": "An error has occurred",
        "message_long": "We apologize, but an error has occurred due to high demand. Please try again soon.",
        "message_time": 5000
    },
    "openai_ratelimit": {
        "message": "Rate limit exceeded",
        "message_long": "We apologize, but you have exceeded the rate limit due to high demand. Please try again soon.",
        "message_time": 5000
    },
    "application_issue": {
        "message": "Application issue detected",
        "message_long": "We apologize for the inconvenience, but an issue has been detected with the application. Please try again soon.",
        "message_time": 2000
    },
    "max_tokens_exceeded": {
        "message": "Maximum character limit exceeded",
        "message_long": "The text you've entered exceeds the maximum character limit. Please shorten your text and try again.",
        "message_time": 5000
    },
    "login_failure": {
        "message": "Incorrect email or password",
        "message_long": "The email or password you entered is incorrect. Please check your credentials and try again.",
        "message_time": 5000
    },
    "login_successful": {
        "message": "Login successful",
        "message_long": "You have successfully logged in and can now access the platform.",
        "message_time": 1000
    },
     "project_access_denied": {
        "message": "Access to project denied",
        "message_long": "You do not have the required permissions to access this project. Please contact the administrator if you believe this is an error.",
        "message_time": 5000,
    },
    "signup_successful": {
        "message": "Signup successful",
        "message_long": "Your account has been successfully created. Please log in to continue.",
        "message_time": 1000,
    },
    "signup_failure": {
        "message": "Signup failed",
        "message_long": "We're sorry, but there was an issue creating your account. Please contact support for assistance.",
        "message_time": 5000,
    },
    "project_creation_successful": {
        "message": "Project created successfully",
        "message_long": "Your project has been successfully created and is ready for work.",
        "message_time": 5000,
    },
    "project_creation_failure": {
        "message": "Project creation failed",
        "message_long": "We're sorry, but there was an issue creating your project. Please try again shortly.",
        "message_time": 5000,
    },
    "section_save_successful": {
        "message": "Changes saved successfully",
        "message_long": "All changes to the section have been successfully saved.",
        "message_time": 1000,
    },
    "section_save_fail": {
        "message": "Failed to save changes",
        "message_long": "We're sorry, but we couldn't save the changes. Please try again shortly.",
        "message_time": 3000,
    },
    "claims_fail": {
        "message": "Failed to create claims",
        "message_long": "We're sorry, but we couldn't create the claims at this time. Please try again shortly.",
        "message_time": 3000,
    },
    "title_fail": {
        "message": "Failed to create title",
        "message_long": "We're sorry, but we couldn't create the title at this time. Please try again shortly.",
        "message_time": 3000,
    },
    "technical_field_fail": {
        "message": "Failed to create technical field",
        "message_long": "We're sorry, but we couldn't create the technical field at this time. Please try again shortly.",
        "message_time": 3000,
    },
    "abstract_fail": {
        "message": "Failed to create abstract",
        "message_long": "We're sorry, but we couldn't create the abstract at this time. Please try again shortly.",
        "message_time": 3000,
    },
    "background_description_fail": {
        "message": "Failed to create background description",
        "message_long": "We're sorry, but we couldn't create the background description at this time. Please try again shortly.",
        "message_time": 3000,
    },
    "summary_fail": {
        "message": "Failed to create summary",
        "message_long": "We're sorry, but we couldn't create the summary at this time. Please try again shortly.",
        "message_time": 3000,
    },
    "flowchart_diagram_fail": {
        "message": "Failed to create Flowchart Diagram",
        "message_long": "We're sorry, but we couldn't create the figure 1 at this time. Please try again shortly.",
        "message_time": 3000,
    },
    "block_diagram_fail": {
        "message": "Failed to create Block Diagram",
        "message_long": "We're sorry, but we couldn't create the figure 2 at this time. Please try again shortly.",
        "message_time": 3000,
    },
    "figures_fail": {
        "message": "Failed to create figures",
        "message_long": "We're sorry, but we couldn't create the figures at this time. Please try again shortly.",
        "message_time": 3000,
    },
    "detailed_description_fail": {
        "message": "Failed to create description",
        "message_long": "We're sorry, but we couldn't create the description at this time. Please try again shortly.",
        "message_time": 3000,
    },
    "prior-art_fail": {
        "message": "Failed to create prior-art",
        "message_long": "We're sorry, but we couldn't create the prior-art at this time. Please try again shortly.",
        "message_time": 3000,
    },
    "block_diagram_description_fail": {
        "message": "Block diagram description creation failed",
        "message_long": "We apologize, but we were unable to create the block diagram description. Please try again shortly.",
        "message_time": 3000
    },
    "flowchart_diagram_description_fail": {
        "message": "Flowchart description creation failed",
        "message_long": "We apologize, but we were unable to create the flowchart description. Please try again shortly.",
        "message_time": 3000
    },
    "extra_diagram_description_fail": {
        "message": "Additional description creation failed",
        "message_long": "We apologize, but we were unable to create the additional description. Please try again shortly.",
        "message_time": 3000
    },
    "extra_diagram_fail": {
        "message": "Additional diagram creation failed",
        "message_long": "We apologize, but we were unable to create the additional diagram. Please try again shortly.",
        "message_time": 3000
    },
    "total_detailed_description_fail": {
        "message": "Complete detailed description creation failed",
        "message_long": "We apologize, but we were unable to create the complete detailed description. Please try again shortly.",
        "message_time": 3000
    },
    "ignore": {
        "message": "Summary creation failed",
        "message_long": "We apologize, but we were getting error. Please try again shortly.",
        "message_time": 0
    }
}

# _select_total_detailed_description_clm
def get_notification_message(code, error, type):
    """
    Get the notification message based on the code and error.

    Args:
    - code: The code of the notification message.
    - error: The error message.
    - type: The type of the notification message.

    Returns:
    - The formatted notification message.
    """

    if code in notification_messages:
        message = notification_messages[code][f"message"]
        if f"message{type}" in notification_messages[code]:
            message = notification_messages[code][f"message{type}"]
        if type != "_time":
            message = message.replace("{message}", error)
        return message
    else:
        return ""
    
def get_error_code_from_type(type):
    SECTION_TYPE_FAIL_MAPPINGS = {
            'claims': 'claims_fail',
            'title': 'title_fail',
            'technical_field': 'technical_field_fail',
            'abstract': 'abstract_fail',
            'background_description': 'background_description_fail',
            'summary': 'summary_fail',
            'flowchart_diagram': 'flowchart_diagram_fail',
            'block_diagram': 'block_diagram_fail',
            'embodiments_flowchart': 'embodiments_flowchart_fail',
            'embodiments_block_diagram': 'embodiments_block_diagram_fail',
            'regenerate_claim': 'figures_fail',
            'prior-art': 'prior-art_fail',
        }
    api_status_code = SECTION_TYPE_FAIL_MAPPINGS.get(type.lower().strip(), None)
    if api_status_code is None:
        api_status_code = "default_error"
    return api_status_code


def draft_format_response(type, generated_text, project_id, sections_id, section_history_id, api_status, api_status_code, api_message, db_status, db_status_code, db_message):
    """
    Format the response for the draft.

    Args:
    - type: The type of the draft.
    - generated_text: The generated text for the draft.
    - messages: The list of messages.
    - project_id: The ID of the project.
    - sections_id: The ID of the sections.
    - section_history_id: The ID of the section history.
    - api_status: The status of the API.
    - api_status_code: The status code of the API.
    - api_message: The message from the API.
    - db_status: The status of the database.
    - db_status_code: The status code of the database.
    - db_message: The message from the database.

    Returns:
    - The formatted response.
    """
    response = {}
    response['response'] = {}
    response['project_id'] = str(project_id)
    if (sections_id and 'section_history_id' in sections_id and 'section_id' in sections_id):
        response['section_id'] = str(sections_id['section_id'])
        response['section_history_id'] = str(sections_id['section_history_id'])
    elif (sections_id and 'section_history_id' in sections_id):
        response['section_history_id'] = str(sections_id['section_history_id'])

    if (api_status == "Success" and db_status == "Success"):
        response['status'] = api_status
        response['message'] = get_notification_message(
            api_status_code, api_message, '')
        response['message_long'] = get_notification_message(
            api_status_code, api_message, '_long')
        response['message_time'] = get_notification_message(
            api_status_code, api_message, '_time')
        response['response'] = generated_text
    elif (api_status == "Error"):
        
        error_code = get_notification_message(
            api_status_code, api_message, '')
        message_long = get_notification_message(
            api_status_code, api_message, '_long')

        response['status'] = api_status
        response['message'] = error_code
        response['message_long'] = message_long
        response['message_time'] = get_notification_message(
            api_status_code, api_message, '_time')
        log_message = f'project_id = {project_id}, section_type =  {type}, section_history_id = {section_history_id}, api_status = {error_code},  {api_status_code}: {message_long}'
        logger.info(log_message)
    elif (db_status == "Error"):
        error_code = get_notification_message(
            api_status_code, api_message, '')
        message_long = get_notification_message(
            api_status_code, api_message, '_long')
        response['status'] = db_status
        response['message'] = error_code
        response['message_long'] = message_long
        response['message_time'] = get_notification_message(
            db_status_code, db_message, '_time')
        log_message = f'project_id = {project_id}, section_type =  {type}, section_history_id = {section_history_id}, api_status = {error_code},  {api_status_code}: {message_long}'
        logger.info(log_message)
    
    response['message_code'] = api_status_code
    return jsonify(response)


def db_format_response(messages, db_status, db_status_code, db_message, flag = True):
    """
    Format the response for the database.

    Args:
    - messages: The list of messages.
    - db_status: The status of the database.
    - db_status_code: The status code of the database.
    - db_message: The message from the database.

    Returns:
    - The formatted response.
    """
    response = {}
    response['status'] = db_status
    response['message'] = get_notification_message(
        db_status_code, db_message, '')
    response['message_long'] = get_notification_message(
        db_status_code, db_message, '_long')
    response['message_time'] = get_notification_message(
        db_status_code, db_message, '_time')
    response['response'] = ""
    if (db_status == "Success"):
        response['response'] = messages
    if (env == "dev"):
        response['messages'] = messages
    response['message_code'] = db_status_code
    if flag == False:
        return response
    return jsonify(response)

