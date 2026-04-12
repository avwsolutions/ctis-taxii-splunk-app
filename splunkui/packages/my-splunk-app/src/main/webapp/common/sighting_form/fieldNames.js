import {FORM_FIELD_TLP_V2_RATING} from "../tlp";
import {FIELD_CONFIDENCE, FIELD_CONFIDENCE_OPTION} from "../confidence";

export const FIELD_TLP_RATING = FORM_FIELD_TLP_V2_RATING;

export const FIELD_SPLUNK_FIELD_NAME = "splunk_field_name";
export const FIELD_SIGHTING_VALUE = "sighting_value";
export const FIELD_SIGHTING_CATEGORY = "sighting_category";
export const FIELD_STIX_PATTERN = "stix_pattern";
export const FIELD_SIGHTING_NAME = "name";
export const FIELD_SIGHTING_DESCRIPTION = "description";
export const FIELD_GROUPING_ID = "grouping_id";
export {FIELD_CONFIDENCE};
export const FIELD_VALID_FROM = "valid_from";
export const FIELD_SIGHTINGS = "sightings";

// For Edit Sighting Form
export const FIELD_SIGHTING_ID = "sighting_id";

export const REGISTER_FIELD_OPTIONS = {
    [FIELD_SIGHTING_ID] : {
        required: "Sighting ID is required."
    },
    [FIELD_GROUPING_ID]: {
        required: "Grouping ID is required."
    },
    [FIELD_TLP_RATING]: {
        required: "TLP v2.0 Marking is required."
    },
    [FIELD_CONFIDENCE]: FIELD_CONFIDENCE_OPTION,
    [FIELD_VALID_FROM]: {
        required: "Valid from is required."
    },
    [FIELD_SIGHTINGS]: {
        // TODO: validate at least one array length >= 1
        // rules: {
        //     required: "At least one sighting is required."
        // }
    },
    [FIELD_SPLUNK_FIELD_NAME]: {},
    [FIELD_SIGHTING_VALUE]: {
        required: "Sighting Value is required."
    },
    [FIELD_SIGHTING_CATEGORY]: {
        required: "Sighting Category is required."
    },
    [FIELD_STIX_PATTERN]: {
        required: "STIX Pattern is required."
    },
    [FIELD_SIGHTING_NAME]: {
        required: "Sighting Name is required."
    },
    [FIELD_SIGHTING_DESCRIPTION]: {
        required: "Sighting Description is required."
    }
}
