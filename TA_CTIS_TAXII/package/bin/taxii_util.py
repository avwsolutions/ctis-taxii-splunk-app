from typing import Optional
from urllib.parse import urljoin

from requests.auth import AuthBase
from taxii2client.v21 import ApiRoot, Collection
from dataclasses import dataclass


@dataclass
class TaxiiConfig:
    auth_type: str
    api_root_url: str
    username: Optional[str] = None
    password: Optional[str] = None
    http_header_name: Optional[str] = None
    http_header_value: Optional[str] = None
    default_collection_id: Optional[str] = None

    @classmethod
    def from_dict(cls, config: dict) -> 'TaxiiConfig':
        return cls(
            auth_type=config.get("auth_type", "basic"),
            api_root_url=config["api_root_url"],
            username=config.get("username"),
            password=config.get("password"),
            http_header_name=config.get("http_header_name"),
            http_header_value=config.get("http_header_value"),
            default_collection_id=config.get("default_collection_id")
        )

    def taxii_endpoint_auth_params(self) -> dict:
        # Generate authentication related params for subclasses of _TAXIIEndpoint including ApiRoot and Collection
        if self.auth_type == 'basic':
            assert self.username is not None and self.password is not None, "username and password must be provided for basic authentication"
            return {
                "user": self.username,
                "password": self.password,
            }
        elif self.auth_type == 'custom':
            return {
                "auth": TokenAuth(http_header_name=self.http_header_name, http_header_value=self.http_header_value),
            }
        else:
            raise NotImplementedError(f"Unsupported authentication type: {self.auth_type}")


class TokenAuth(AuthBase):
    def __init__(self, http_header_name, http_header_value):
        self.header_name = http_header_name
        self.header_value = http_header_value

    def __call__(self, r):
        r.headers[self.header_name] = self.header_value
        return r


def api_root_from_dict(config: dict) -> ApiRoot:
    taxii_config = TaxiiConfig.from_dict(config)
    return ApiRoot(url=taxii_config.api_root_url, **taxii_config.taxii_endpoint_auth_params())


def collection_from_config_dict(config: dict, collection_id: Optional[str] = None) -> Collection:
    taxii_config = TaxiiConfig.from_dict(config)
    collection_id_to_use = collection_id or taxii_config.default_collection_id
    assert collection_id_to_use is not None, "Collection id must be provided for collection creation"

    base_url = taxii_config.api_root_url
    if not base_url.endswith("/"):
        base_url += "/"
    endpoint_url = urljoin(base_url, f"collections/{collection_id_to_use}")
    return Collection(endpoint_url, **taxii_config.taxii_endpoint_auth_params())
