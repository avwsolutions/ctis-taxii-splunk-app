from models.sighting import SightingModelV1
from common_rest_handler_entrypoint import (
    handle_create_request,
)

if __name__ == '__main__':
    handle_create_request(SightingModelV1)