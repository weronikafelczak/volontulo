# -*- coding: utf-8 -*-

"""
.. module:: test_organizations
"""
from django.test import Client
from django.test import TestCase

from apps.volontulo.tests import common


class TestOrganizations(TestCase):
    """Class responsible for testing organization specific views."""

    @classmethod
    def setUpTestData(cls):
        """Data fixtures for all tests."""
        # volunteer user - totally useless
        cls.volunteer = common.initialize_empty_volunteer()
        # organization user - no offers
        cls.organization = common.initialize_empty_organization()
        # volunteer user - offers, organizations
        cls.volunteer2, cls.organization2 = \
            common.initialize_filled_volunteer_and_organization()

    def setUp(self):
        """Set up each test."""
        self.client = Client()

    def test__ensure_status_is_displayed_in_profile_view(self):
        """Test if offer status is displayed in a profile view."""
        self.client.login(
            username='volunteer2@example.com',
            password='volunteer2'
        )
        response = self.client.get('/o/me', follow=True)
        self.assertTemplateUsed(response, 'users/my_offers.html')
        self.assertIn('offers', response.context)
        self.assertEqual(
            'published', response.context['offers'][0].offer_status)

    def test__ensure_status_is_displayed_in_organisations_view(self):
        """Test if offer status is displayed in an organisation view."""
        self.client.login(
            username='volunteer2@example.com',
            password='volunteer2'
        )
        response = self.client.get('/o/me', follow=True)
        self.assertIn('offers', response.context)
        self.assertEqual(
            'published', response.context['offers'][0].offer_status)
