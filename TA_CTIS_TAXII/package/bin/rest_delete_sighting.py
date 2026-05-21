from common_rest_handler_entrypoint import handle_delete_request
from models.sighting import SightingModelV1

if __name__ == '__main__':
    handle_delete_request(SightingModelV1)