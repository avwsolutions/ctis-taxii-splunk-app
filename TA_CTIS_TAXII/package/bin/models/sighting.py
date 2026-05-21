from attrs import define, field
from uuid import uuid4

from stix2 import Sighting

from .base import BaseModelV1


@define(slots=False, kw_only=True)
class SightingModelV1(BaseModelV1):

    sighting_id = field()

    @sighting_id.default
    def _default_sighting_id(self):
        return 'sighting--{}'.format(uuid4())

    sighting_of_ref = field(default=None)

    description = field(default=None)

    where_sighted_refs = field(factory=list)

    first_seen = field(default=None)

    last_seen = field(default=None)

    count = field(default=1)

    summary = field(default=False)

    created_by_ref = field(default=None)

    confidence = field(default=50)

    revoked = field(default=False)

    labels = field(factory=list)

    object_marking_refs = field(factory=list)

    def validate(self):

        if self.count < 1 or self.count > 100:
            raise ValueError(
                'count must be between 1 and 100'
            )

        if self.confidence < 1 or self.confidence > 100:
            raise ValueError(
                'confidence must be between 1 and 100'
            )

        if (
            self.first_seen and
            self.last_seen and
            self.first_seen > self.last_seen
        ):
            raise ValueError(
                'first_seen must be before last_seen'
            )

    def to_stix(self):

        self.validate()

        return Sighting(
            id=self.sighting_id,
            created=self.created,
            modified=self.modified,
            sighting_of_ref=self.sighting_of_ref,
            description=self.description,
            where_sighted_refs=self.where_sighted_refs,
            first_seen=self.first_seen,
            last_seen=self.last_seen,
            count=self.count,
            summary=self.summary,
            created_by_ref=self.created_by_ref,
            confidence=self.confidence,
            revoked=self.revoked,
            labels=self.labels,
            object_marking_refs=self.object_marking_refs,
            allow_custom=True,
        )