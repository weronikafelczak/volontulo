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

class CreateOffer(serializers.Serializer):
    """Serializer for creating a new offer"""
    organization =CharField(required=True, min_length=2, max_length=150,
                     trim_whitespace=True)
    description = CharField(required=True, min_length=2, max_length=150,
                     trim_whitespace=True)
    requirements = CharField(required=True, min_length=2, max_length=150,
                     trim_whitespace=True)
    time_commitment = CharField(required=True, min_length=2, max_length=150,
                     trim_whitespace=True)
    benefits = CharField(required=True, min_length=2, max_length=150,
                     trim_whitespace=True)
    location = CharField(required=True, min_length=2, max_length=150,
                     trim_whitespace=True)
    title = CharField(required=True, min_length=2, max_length=150,
                     trim_whitespace=True)
    # started_at = DateField()
    # finished_at = CharField(required=True, min_length=2, max_length=150,
    #                  trim_whitespace=True)
    # recruitment_start_date = CharField(required=True, min_length=2, max_length=150,
    #                  trim_whitespace=True)
    # recruitment_end_date =CharField(required=True, min_length=2, max_length=150,
    #                  trim_whitespace=True)
    # volunteers_limit = CharField(required=True, min_length=1, max_length=150,
    #                  trim_whitespace=True)
