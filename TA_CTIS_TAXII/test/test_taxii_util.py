from TA_CTIS_TAXII.package.bin.taxii_util import api_root_from_config, TaxiiConfig, collection_from_config
from TA_CTIS_TAXII.package.bin.proxy_conf import ProxyConfiguration
from requests.auth import HTTPBasicAuth
from requests import Request

SAMPLE_TAXII_API_ROOT_URL = 'https://example.org/apiroot1/'


BASIC_AUTH_USERNAME = 'user1'
BASIC_AUTH_PASSWORD = 'pass1'
TAXII_CONFIG_BASIC_AUTH = TaxiiConfig.from_dict({
    "auth_type": "basic",
    "api_root_url": SAMPLE_TAXII_API_ROOT_URL,
    "username": BASIC_AUTH_USERNAME,
    "password": BASIC_AUTH_PASSWORD
})

PROXY_CONFIG = ProxyConfiguration.from_dict({
    "proxy_enabled": "1",
    "proxy_type": "http",
    "proxy_host" : "proxy.example.com",
    "proxy_port" : "8080",
})

class TestApiRootFromConfig:
    def test_with_basic_auth(self):
        api_root = api_root_from_config(TAXII_CONFIG_BASIC_AUTH)
        assert api_root.url == SAMPLE_TAXII_API_ROOT_URL

        session_auth = api_root._conn.session.auth
        assert isinstance(session_auth, HTTPBasicAuth)
        assert session_auth.username == BASIC_AUTH_USERNAME
        assert session_auth.password == BASIC_AUTH_PASSWORD

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

    def test_basic_auth_with_proxy(self):
        api_root = api_root_from_config(taxii_config=TAXII_CONFIG_BASIC_AUTH, proxy_config=PROXY_CONFIG)
        session_auth = api_root._conn.session.auth
        assert isinstance(session_auth, HTTPBasicAuth)
        assert session_auth.username == BASIC_AUTH_USERNAME
        assert session_auth.password == BASIC_AUTH_PASSWORD

        proxies = api_root._conn.session.proxies
        assert isinstance(proxies, dict)
        assert proxies.get("http") == "http://proxy.example.com:8080"
        assert proxies.get("https") == "http://proxy.example.com:8080"

class TestCollectionFromConfig:
    def test_with_basic_auth(self):
        taxii_config = TAXII_CONFIG_BASIC_AUTH
        collection1 = collection_from_config(taxii_config=taxii_config, collection_id="collection1")
        assert collection1.url == "https://example.org/apiroot1/collections/collection1/"

    def test_with_basic_auth_and_proxy(self):
        collection1 = collection_from_config(taxii_config=TAXII_CONFIG_BASIC_AUTH, collection_id="collection1", proxy_config=PROXY_CONFIG)
        assert collection1.url == "https://example.org/apiroot1/collections/collection1/"
        proxies = collection1._conn.session.proxies
        assert isinstance(proxies, dict)
        assert proxies.get("http") == "http://proxy.example.com:8080"
        assert proxies.get("https") == "http://proxy.example.com:8080"