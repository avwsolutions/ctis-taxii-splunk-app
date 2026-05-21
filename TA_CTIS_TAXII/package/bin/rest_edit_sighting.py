from common_rest_handler_entrypoint import handle_edit_request
from models.sighting import SightingModelV1

EDITABLE_FIELDS = {
    'description',
    'count',
    'confidence',
    'revoked',
    'summary',
}

if __name__ == '__main__':
    handle_edit_request(
        SightingModelV1,
        editable_fields=EDITABLE_FIELDS,
    )