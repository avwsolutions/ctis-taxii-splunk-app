# TODO: This should be renamed, as it's used for form errors
class ServerException(Exception):
    def __init__(self, message:str, errors: list):
        self.errors = errors
        super().__init__(message)

class RestResponseException(Exception):
    def __init__(self, status_code: int, response: dict):
        self.status_code = status_code
        self.response = response
        super().__init__()
