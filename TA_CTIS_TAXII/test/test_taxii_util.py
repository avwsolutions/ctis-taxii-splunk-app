from TA_CTIS_TAXII.package.bin.taxii_util import api_root_from_config, TaxiiConfig, collection_from_config
from requests.auth import HTTPBasicAuth
from requests import Request

SAMPLE_TAXII_API_ROOT_URL = 'https://example.org/apiroot1/'


class TestApiRootFromConfig:
    def test_with_basic_auth(self):
        username = 'user1'
        password = 'pass1'
        api_root = api_root_from_config(TaxiiConfig.from_dict({
            "auth_type": "basic",
            "api_root_url": SAMPLE_TAXII_API_ROOT_URL,
            "username": username,
            "password": password
        }))
        assert api_root.url == SAMPLE_TAXII_API_ROOT_URL

        session_auth = api_root._conn.session.auth
        assert isinstance(session_auth, HTTPBasicAuth)
        assert session_auth.username == username
        assert session_auth.password == password

    def test_with_bearer_token(self):
        api_root = api_root_from_config(TaxiiConfig.from_dict({
            "auth_type": "custom",
            "api_root_url": SAMPLE_TAXII_API_ROOT_URL,
            "http_header_name": "Authorization",
            "http_header_value": "Bearer token123"
        }))
        assert api_root.url == SAMPLE_TAXII_API_ROOT_URL

        sample_request = Request('GET', SAMPLE_TAXII_API_ROOT_URL)
        session_auth = api_root._conn.session.auth
        session_auth(sample_request)
        assert sample_request.headers["Authorization"] == "Bearer token123"

class TestCollectionFromConfig:
    def test_with_basic_auth(self):
        username = 'user1'
        password = 'pass1'
        taxii_config = TaxiiConfig.from_dict({
            "auth_type": "basic",
            "api_root_url": SAMPLE_TAXII_API_ROOT_URL,
            "username": username,
            "password": password,
            "default_collection_id": "collection1"
        })
        collection1 = collection_from_config(taxii_config=taxii_config, collection_id="collection1")
        assert collection1.url == "https://example.org/apiroot1/collections/collection1/"
