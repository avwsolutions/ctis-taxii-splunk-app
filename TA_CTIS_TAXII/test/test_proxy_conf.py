from TA_CTIS_TAXII.package.bin.proxy_conf import ProxyConfiguration

PROXY_USERNAME = 'user1'
PROXY_PASSWORD = 'pass1'

PROXY_CONFIG = ProxyConfiguration.from_dict({
    "proxy_enabled": "1",
    "proxy_type": "http",
    "proxy_host": "proxy.example.com",
    "proxy_port": "8080",
})


class TestProxyConfiguration:
    def test_without_auth(self):
        configuration = ProxyConfiguration.from_dict({
            "proxy_enabled": "1",
            "proxy_type": "http",
            "proxy_host": "proxy.example.com",
            "proxy_port": "8080",
        })
        assert configuration.proxy_enabled is True
        assert configuration.proxy_type == "http"
        assert configuration.proxy_host == "proxy.example.com"
        assert configuration.proxy_port == "8080"
        assert configuration.get_proxy_url() == "http://proxy.example.com:8080"

        assert configuration.get_proxies_dict() == {
            "http": "http://proxy.example.com:8080",
            "https": "http://proxy.example.com:8080",
        }

    def test_with_auth(self):
        configuration = ProxyConfiguration.from_dict({
            "proxy_enabled": "1",
            "proxy_type": "http",
            "proxy_host": "proxy.example.com",
            "proxy_port": "8080",
            "proxy_username": PROXY_USERNAME,
            "proxy_password": PROXY_PASSWORD,
        })
        assert configuration.proxy_enabled is True
        assert configuration.proxy_type == "http"
        assert configuration.proxy_host == "proxy.example.com"
        assert configuration.proxy_port == "8080"
        assert configuration.proxy_username == PROXY_USERNAME
        assert configuration.proxy_password == PROXY_PASSWORD

        assert configuration.get_proxy_url() == f"http://{PROXY_USERNAME}:{PROXY_PASSWORD}@proxy.example.com:8080"
        assert configuration.get_proxies_dict() == {
            "http": f"http://{PROXY_USERNAME}:{PROXY_PASSWORD}@proxy.example.com:8080",
            "https": f"http://{PROXY_USERNAME}:{PROXY_PASSWORD}@proxy.example.com:8080",
        }

    def test_get_proxies_dict_for_proxy_enabled_is_false(self):
        configuration = ProxyConfiguration.from_dict({
            "proxy_type": "http",
            "proxy_host": "proxy.example.com",
            "proxy_port": "8080",
        })
        # if proxy_enabled is not given in configuration, then it is false by default
        assert configuration.proxy_enabled is False
        assert configuration.get_proxies_dict() is None
