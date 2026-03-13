import requests

from common import AbstractRestHandler
from server_exception import RestResponseException
import logging
from taxii_util import collection_from_config
from proxy_conf import get_proxy_configuration

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


class GetTaxiiCollectionHandler(AbstractRestHandler):
    def handle(self, input_json: dict, query_params: dict, session_key: str) -> dict:
        if "config_name" not in query_params:
            raise ValueError("config_name is a required query parameter")
        if "collection_id" not in query_params:
            raise ValueError("collection_id is a required query parameter")

        config_name = query_params.get("config_name")[0]
        collection_id = query_params.get("collection_id")[0]
        logger.info(f"config_name: {config_name}, collection_id: {collection_id}")
        taxii_config = self.get_taxii_config(session_key=session_key, stanza_name=config_name)
        proxy_config = get_proxy_configuration(session_key=session_key)

        try:
            collection = collection_from_config(taxii_config=taxii_config, collection_id=collection_id, proxy_config=proxy_config)
            return {
                "collection_id": collection_id,
                "can_write": collection.can_write,
                "title": collection.title,
                "description": collection.description,
            }
        except requests.exceptions.HTTPError as e:
            logger.exception(f"Error getting TAXII collection {collection_id}")
            raise RestResponseException(status_code=e.response.status_code, response={
                "taxii_status_code": e.response.status_code,
                "taxii_response": e.response.text
            })
