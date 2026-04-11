from __future__ import annotations

from datetime import datetime

from attrs import define, field
from cattrs import ClassValidationError
from stix2 import Sighting as StixSighting
from stix2patterns.validator import validate as stix_validate
from uuid import uuid4
from .base import BaseModelV1, make_base_converter
from .common import validate_confidence
from .tlp_v2 import TLPv2
from typing import List, Optional, Tuple
from functools import reduce

"""
# This Sighting Model represents fields required to generate a STIX 2.1 Sighting object
"""


def validate_stix_pattern(instance, attribute, value: str):
    _, errors = stix_validate(value, ret_errs=True)
    if errors:
        raise ValueError(f"Invalid STIX pattern: {errors}")


def validate_sighting_id(instance, attribute, value):
    try:
        StixSighting(id=value, pattern_type="stix", pattern="[url:value = 'abc']")
    except Exception as e:
        raise ValueError(f"Invalid sighting_id: {e}")


def validate_grouping_id(instance, attribute, value):
    if not value:
        raise ValueError("grouping_id must be provided")
    if not value.startswith("grouping--"):
        raise ValueError("grouping_id must start with 'grouping--'")

@define(slots=False, kw_only=True)
class SightingModelV1(BaseModelV1):
    sighting_id: str = field(validator=[validate_sighting_id])

    @sighting_id.default
    def _sighting_id_default(self):
        return f"sighting--{uuid4()}"

    grouping_id: str = field(validator=[validate_grouping_id])
    splunk_field_name: Optional[str] = field(default=None)
    sighting_value: str = field()

    # For now leave as str, but in future do we need to use the IoCCategory enum?
    sighting_category: str = field()

    count: str = field()
    description: str = field()
    first_seen: datetime = field()
    last_seen: datetime = field()
    tlp_v2_rating: TLPv2 = field()
    valid_from: datetime = field()
    confidence: int = field(validator=[validate_confidence])

    def to_stix(self, created_by_ref:str = None, sighting_of_ref:str = None, where_sighted_refs:str = None) -> StixSighting:
        return StixSighting(
            id=self.sighting_id,
            created_by_ref=created_by_ref,
            created=self.created,
            modified=self.modified,
            count=self.count,
            first_seen=self.first_seen,
            last_seen=self.last_seen,
            sighting_of_ref=sighting_of_ref,
            where_sighted_refs=where_sighted_refs,
            confidence=self.confidence,
            object_marking_refs=self.tlp_v2_rating.to_object_marking_ref(),
        )


sighting_converter = make_base_converter()

def form_payload_to_sightings(form_payload: dict) -> Tuple[list, List[SightingModelV1]]:
    sightings = form_payload["sightings"]
    common_fields = form_payload.copy()
    del common_fields["sightings"]
    sighting_models = []
    errors = []
    for index, sighting_dict in enumerate(sightings):
        try:
            sighting_dict = {**sighting_dict, **common_fields}
            sighting_model = sighting_converter.structure(sighting_dict, SightingModelV1)
            sighting_models.append(sighting_model)
        except ClassValidationError as e:
            errors.append({"index": index, "errors": [str(x) for x in e.exceptions]})
    return errors, sighting_models

def maximum_tlpv2_of_sightings(sightings: List[SightingModelV1]) -> TLPv2:
    if not sightings:
        raise ValueError("Must provide non-empty list of sightings")
    return reduce(TLPv2.maximum, [ind.tlp_v2_rating for ind in sightings])
