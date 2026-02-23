from splunktaucclib.rest_handler.admin_external import AdminExternalHandler
from splunktaucclib.rest_handler.error import RestError

from solnlib import log
import logging
from const import ADDON_NAME_LOWER
import requests
from taxii2client.v21 import ApiRoot
from requests_auth import TokenAuth

logger = log.Logs().get_logger(f"{ADDON_NAME_LOWER}.{__name__}")
logger.setLevel(logging.INFO)

def get_public_ip_address() -> dict:
    resp = requests.get('https://api.ipify.org?format=json')
    resp.raise_for_status()
    return resp.json()

# https://github.com/oasis-open/cti-taxii-client/tree/master
def _validate_connection(api_root):
    try:
        logger.info(f"Public IP address for this Splunk instance: {get_public_ip_address()}")
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to retrieve public IP address: {e}")

    logger.info(f"Validating connection to {api_root.url}")
    try:
        # TODO: Use different method to validate connection. E.g. POST empty list of objects to collection
        #  Credentials might not have permissions to list collections.
        collections = api_root.collections
        logger.info(f"Connection to TAXII server ({api_root.url}) successful. Collections: {collections}")
    except Exception as e:
        logger.exception(f"Connection to {api_root.url} failed: {e}")
        raise RestError(message=f"Connection to {api_root.url} failed: {e}", status=400)



API_ROOT_URL = "api_root_url"

def api_root_from_payload(payload: dict) -> ApiRoot:
    api_root_url = payload.get(API_ROOT_URL)
    auth_type = payload.get("auth_type")
    if auth_type == 'basic':
        username = payload.get("username")
        password = payload.get("password")
        return ApiRoot(url=api_root_url, user=username, password=password)
    elif auth_type == 'custom':
        http_header_name = payload.get("http_header_name")
        http_header_value = payload.get("http_header_value")
        return ApiRoot(url=api_root_url, auth=TokenAuth(http_header_name=http_header_name, http_header_value=http_header_value))
    else:
        raise NotImplementedError(f"Unsupported authentication type: {auth_type}")


class CustomConnectionValidator(AdminExternalHandler):
    def __init__(self, *args, **kwargs):
        AdminExternalHandler.__init__(self, *args, **kwargs)

    def handleList(self, confInfo):
        AdminExternalHandler.handleList(self, confInfo)

    def handleEdit(self, confInfo):
        _validate_connection(api_root=api_root_from_payload(self.payload))
        AdminExternalHandler.handleEdit(self, confInfo)

    def handleCreate(self, confInfo):
        _validate_connection(api_root=api_root_from_payload(self.payload))
        AdminExternalHandler.handleCreate(self, confInfo)

    def handleRemove(self, confInfo):
        AdminExternalHandler.handleRemove(self, confInfo)
