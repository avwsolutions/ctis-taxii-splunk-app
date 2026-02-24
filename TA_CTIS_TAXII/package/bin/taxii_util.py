from requests.auth import AuthBase
from taxii2client.v21 import ApiRoot


class TokenAuth(AuthBase):
    def __init__(self, http_header_name, http_header_value):
        self.header_name = http_header_name
        self.header_value = http_header_value

    def __call__(self, r):
        r.headers[self.header_name] = self.header_value
        return r

API_ROOT_URL = "api_root_url"

def api_root_from_dict(config: dict) -> ApiRoot:
    api_root_url = config.get(API_ROOT_URL)
    auth_type = config.get("auth_type")
    if auth_type == 'basic':
        username = config.get("username")
        password = config.get("password")
        return ApiRoot(url=api_root_url, user=username, password=password)
    elif auth_type == 'custom':
        http_header_name = config.get("http_header_name")
        http_header_value = config.get("http_header_value")
        return ApiRoot(url=api_root_url, auth=TokenAuth(http_header_name=http_header_name, http_header_value=http_header_value))
    else:
        raise NotImplementedError(f"Unsupported authentication type: {auth_type}")
