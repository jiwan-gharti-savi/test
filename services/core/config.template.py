import logging

import psycopg2
from core.common.postgresql import PostgresDB

logger = logging.getLogger("draft.log")

db_config = {
    "host": "",
    "port": "",
    "database": "",
    "user": "",
    "password": ""
}

db = PostgresDB(config=db_config, logger=logger)

env = "dev"

api_key = ""
llm_keys = {
    "OPENAI_API_KEY": ""
}
gpt_model = ""
maximum_invention_tokens = ''
maximum_tokens = ''

log_path = "./logs/"
pcs_base_url = ""
access_token_url = pcs_base_url + 'auth/dolcera_auth'
pcs_query_url = pcs_base_url + 'search/query'
prior_art_url = pcs_base_url + 'search/pa'
prior_art2_url = pcs_base_url + 'search/pa_get_query'
prior_art_similarity_thresold = 70
prior_art_total_patents_to_check = 10
jwt_SECRET_KEY = ''
jwt_expiry_time = 0
pcs_base_client_id = ""
pcs_base_client_secret = ""

gpt_temperature=0

db._connect()

auth_stytch_project_id = ""
auth_stytch_secret = ""
auth_stytch_env = ""