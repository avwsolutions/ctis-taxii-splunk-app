import requests

from common import AbstractRestHandler
from server_exception import RestResponseException
import logging
from taxii_util import api_root_from_config

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


class ListTaxiiCollectionsHandler(AbstractRestHandler):
    def handle(self, input_json: dict, query_params: dict, session_key: str) -> dict:
        if "config_name" not in query_params:
            raise ValueError("config_name is a required query parameter")
        config_name = query_params.get("config_name")[0]
        logger.info(f"config_name: {config_name}")
        taxii_config = self.get_taxii_config(session_key=session_key, stanza_name=config_name)
        api_root = api_root_from_config(taxii_config=taxii_config)
        try:
            collections = api_root.collections
            return {"collections": [x._raw for x in collections]}
        except requests.exceptions.HTTPError as e:
            logger.exception("Error listing TAXII collections")
            raise RestResponseException(status_code=e.response.status_code, response={
                "taxii_status_code": e.response.status_code,
                "taxii_response": e.response.text
            })
