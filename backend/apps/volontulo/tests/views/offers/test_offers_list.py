# -*- coding: utf-8 -*-

"""
.. module:: test_offers_list
"""

from django.test import Client
from django.test import TestCase

from apps.volontulo.tests.views.offers.commons import TestOffersCommons


class TestOffersList(TestOffersCommons, TestCase):
    """Class responsible for testing offers' list."""

    def setUp(self):
        """Set up each test."""
        self.client = Client()

    def _test_offers_list_for_standard_user(self):
        """Test offers' list for standard user.

        List of offers is available for standard users and shows only ACTIVE
        offers.
        Test are common for anonymous user, volunteer and organization.
        """
        response = self.client.get('/o/offers')
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'offers/offers_list.html')
        self.assertIn('offers', response.context)
        self.assertEqual(len(response.context['offers']), 1)

    def test_offer_list_for_anonymous_user(self):
        """Test offers' list for anonymus user."""
        return self._test_offers_list_for_standard_user()

    def test_offers_list_for_volunteer(self):
        """Test offers' list for account of volunteer."""
        self.client.login(
            username='volunteer@example.com',
            password='123volunteer',
        )
        return self._test_offers_list_for_standard_user()

    def test_offers_list_for_organization(self):
        """Test offers' list for account of organization."""
        self.client.login(
            username='organization@example.com',
            password='123org',
        )
        return self._test_offers_list_for_standard_user()

    def test_offers_list_for_admin(self):
        """Test offers' list for account of admin."""
        self.client.login(
            username='admin@example.com',
            password='123admin',
        )
        response = self.client.get('/o/offers')
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'offers/offers_list.html')
        self.assertIn('offers', response.context)
        self.assertEqual(len(response.context['offers']), 2)
