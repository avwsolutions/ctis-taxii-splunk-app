from splunktaucclib.rest_handler.admin_external import AdminExternalHandler
from splunktaucclib.rest_handler.error import RestError

from solnlib import log

import logging

from proxy_conf import ProxyConfiguration, get_proxy_configuration
from const import ADDON_NAME_LOWER
import requests
from taxii_util import api_root_from_config, collection_from_config, TaxiiConfig

logger = log.Logs().get_logger(f"{ADDON_NAME_LOWER}.{__name__}")
logger.setLevel(logging.INFO)

def get_public_ip_address() -> dict:
    resp = requests.get('https://api.ipify.org?format=json')
    resp.raise_for_status()
    return resp.json()

def validate_with_list_collections(taxii_config: TaxiiConfig, proxy_config: ProxyConfiguration = None):
    api_root = api_root_from_config(taxii_config=taxii_config, proxy_config=proxy_config)
    logger.info(f"Validating connection to {api_root.url}")
    try:
        collections = api_root.collections
        logger.info(f"Connection to TAXII server ({api_root.url}) successful. Collections: {collections}")
    except Exception as e:
        logger.exception(f"Connection to {api_root.url} failed: {e}")
        raise RestError(message=f"Connection to {api_root.url} failed: {e}", status=400)

def validate_can_write_to_collection(taxii_config: TaxiiConfig, proxy_config: ProxyConfiguration = None):
    collection = collection_from_config(taxii_config=taxii_config, collection_id=taxii_config.default_collection_id, proxy_config=proxy_config)
    try:
        if not collection.can_write:
            raise RestError(message=f"Credentials provided do not have write permission to add objects to collection {collection.id}", status=400)
    except requests.exceptions.RequestException as e:
        logger.exception(f"Request exception occurred while validating collection permissions")
        raise RestError(message=f"Request exception occurred: {e}", status=400)


def validate_configuration(configuration: dict, session_key:str):
    taxii_config = TaxiiConfig.from_dict(config=configuration)
    proxy_config = get_proxy_configuration(session_key=session_key)

    if taxii_config.default_collection_id:
        return validate_can_write_to_collection(taxii_config=taxii_config, proxy_config=proxy_config)
    else:
        return validate_with_list_collections(taxii_config=taxii_config, proxy_config=proxy_config)


class CustomConnectionValidator(AdminExternalHandler):
    def __init__(self, *args, **kwargs):
        AdminExternalHandler.__init__(self, *args, **kwargs)

    def handleList(self, confInfo):
        AdminExternalHandler.handleList(self, confInfo)

    def handleEdit(self, confInfo):
        validate_configuration(configuration=self.payload, session_key=self.getSessionKey())
        AdminExternalHandler.handleEdit(self, confInfo)

    def handleCreate(self, confInfo):
        validate_configuration(configuration=self.payload, session_key=self.getSessionKey())
        AdminExternalHandler.handleCreate(self, confInfo)

    def handleRemove(self, confInfo):
        AdminExternalHandler.handleRemove(self, confInfo)
