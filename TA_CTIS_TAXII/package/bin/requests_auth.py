from requests.auth import AuthBase

class TokenAuth(AuthBase):
    def __init__(self, http_header_name, http_header_value):
        self.header_name = http_header_name
        self.header_value = http_header_value

    def __call__(self, r):
        r.headers[self.header_name] = self.header_value
        return r