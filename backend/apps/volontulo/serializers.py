# -*- coding: utf-8 -*-

"""
.. module:: serializers
"""

from django.contrib.auth.models import User
from django.db.models.fields import DateField, IntegerField
from django.utils.text import slugify
from rest_framework import serializers
from rest_framework.fields import CharField, EmailField

from apps.volontulo import models


class OrganizationSerializer(serializers.HyperlinkedModelSerializer):

    """REST API organizations serializer."""

    slug = serializers.SerializerMethodField()

    class Meta:
        model = models.Organization
        fields = (
            'address',
            'description',
            'id',
            'name',
            'slug',
            'url',
        )

    @staticmethod
    def get_slug(obj):
        """Returns slugified name."""
        return slugify(obj.name)


class OfferSerializer(serializers.HyperlinkedModelSerializer):

    """REST API offers serializer."""

    start_finish_error = """Data rozpoczęcia akcji nie może być
        późniejsza, niż data zakończenia"""
    recruitment_error = """Data rozpoczęcia rekrutacji
        nie może być późniejsza, niż data zakończenia"""
    reserve_recruitment_error = """Data rozpoczęcia rekrutacji
        rezerwowej nie może być późniejsza, niż data zakończenia"""

    slug = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    organization = OrganizationSerializer(many=False, read_only=True)

    class Meta:
        model = models.Offer
        fields = (
            'finished_at',
            'id',
            'image',
            'location',
            'organization',
            'slug',
            'started_at',
            'title',
            'url',
            'description',
            'benefits',
            'requirements',
            'time_commitment',
            'time_period',
            'recruitment_end_date',
            'recruitment_start_date',
            'reserve_recruitment',
            'reserve_recruitment_start_date',
            'reserve_recruitment_end_date',
            'action_ongoing',
            'constant_coop',
            'volunteers_limit',
            'reserve_volunteers_limit',
        )

    def get_image(self, obj):
        """Returns main image's url for an offer."""
        image = (
            obj.images.filter(is_main=True).first() or
            obj.images.first()
        )
        return self.context['request'].build_absolute_uri(
            location=image.path.url
        ) if image else None

    @staticmethod
    def get_slug(obj):
        """Returns slugified title."""
        return slugify(obj.title)

    def validate(self, data):
        self._validate_start_finish(data['started_at'],
                                 data['finished_at'],
                                 self.start_finish_error)
        self._validate_start_finish(data['recruitment_start_date'],
                                 data['recruitment_end_date'],
                                 self.recruitment_error)
        self._validate_start_finish(data['reserve_recruitment_start_date'],
                                 data['reserve_recruitment_end_date'],
                                 self.reserve_recruitment_error)
        return data

    def _validate_start_finish(self, start_slug, end_slug, error_desc):
        """Validation for date fields."""
        start_field_value = start_slug
        end_field_value = end_slug
        if start_field_value and end_field_value:
            if start_field_value > end_field_value:
                raise serializers.ValidationError(error_desc)

class UserSerializer(serializers.ModelSerializer):

    """REST API organizations serializer."""

    is_administrator = serializers.SerializerMethodField()
    organizations = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'is_administrator',
            'organizations',
            'username',
        )

    @staticmethod
    def get_is_administrator(obj):
        """Returns information if user is an administrator."""
        return obj.userprofile.is_administrator

    def get_organizations(self, obj):
        """Returns organizations that user belongs to."""
        qs = obj.userprofile.organizations.all()
        return OrganizationSerializer(qs, many=True, context=self.context).data


# pylint: disable=abstract-method
class OrganizationContact(serializers.Serializer):
    """Serializer for contact message"""
    name = CharField(required=True, min_length=2, max_length=150,
                     trim_whitespace=True)
    email = EmailField(required=True)
    phone_no = CharField(required=True, min_length=9, max_length=15,
                         trim_whitespace=True)
    message = CharField(required=True, min_length=2, max_length=500,
                        trim_whitespace=True)
