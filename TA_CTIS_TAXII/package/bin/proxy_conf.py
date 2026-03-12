import logging
from dataclasses import dataclass
from typing import Optional
from urllib.parse import quote

from solnlib import log
from solnlib.conf_manager import ConfManager
from solnlib.soln_exceptions import ConfManagerException

from const import ADDON_NAME, ADDON_NAME_LOWER

logger = log.Logs().get_logger(f"{ADDON_NAME_LOWER}.{__name__}")
logger.setLevel(logging.INFO)

@dataclass
class ProxyConfiguration:
    proxy_enabled: bool
    proxy_type: str
    proxy_host: str
    proxy_port: int
    proxy_username: str = ""
    proxy_password: str = ""

    @staticmethod
    def from_dict(config: dict):
        proxy_enabled = config.get("proxy_enabled", "0") == "1"
        return ProxyConfiguration(
            proxy_enabled=proxy_enabled,
            proxy_type=config.get("proxy_type"),
            proxy_host=config.get("proxy_host"),
            proxy_port=config.get("proxy_port"),
            proxy_username=config.get("proxy_username"),
            proxy_password=config.get("proxy_password"),
        )

    def get_proxy_url(self):
        if self.proxy_username:
            quoted_username = quote(self.proxy_username)
            quoted_password = quote(self.proxy_password)
            return f"{self.proxy_type}://{quoted_username}:{quoted_password}@{self.proxy_host}:{self.proxy_port}"
        else:
            return f"{self.proxy_type}://{self.proxy_host}:{self.proxy_port}"

    def get_proxies_dict(self) -> Optional[dict]:
        if self.proxy_enabled:
            return {
                "http": self.get_proxy_url(),
                "https": self.get_proxy_url(),
            }
        else:
            return None

def get_proxy_configuration(session_key: str) -> Optional[ProxyConfiguration]:
    cfm = ConfManager(
        session_key,
        ADDON_NAME,
        realm=f"__REST_CREDENTIAL__#{ADDON_NAME}#configs/conf-ta_ctis_taxii_settings",
    )
    try:
        conf_file = cfm.get_conf('ta_ctis_taxii_settings')
    except ConfManagerException:
        logger.exception("Error reading proxy configuration")
        return None

    if conf_file.stanza_exist('custom_proxy'):
        raw_config = conf_file.get('custom_proxy')
        return ProxyConfiguration.from_dict(config=raw_config)
    else:
        return None