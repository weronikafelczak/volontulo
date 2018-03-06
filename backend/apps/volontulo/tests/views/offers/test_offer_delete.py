# -*- coding: utf-8 -*-

"""
.. module:: test_offer_delete
"""

from django.test import Client
from django.test import TestCase

from apps.volontulo.tests.views.offers.commons import TestOffersCommons


class TestOfferDelete(TestOffersCommons, TestCase):
    """Class responsible for testing offers deletion."""

    def setUp(self):
        """Set up each test."""
        self.client = Client()

    def test_offer_deletion_for_anonymous_user(self):
        """Test deletion for anonymous users."""
        response = self.client.get('/o/offers/delete/{}'
                                   .format(self.inactive_offer.id))
        self.assertEqual(response.status_code, 403)

    def test_offer_deletion_for_volunteer(self):
        """Test deletion for account of volunteer."""
        self.client.login(
            username='volunteer@example.com',
            password='123volunteer',
        )
        response = self.client.get('/o/offers/delete/{}'
                                   .format(self.inactive_offer.id))
        self.assertEqual(response.status_code, 403)

    def test_offer_deletion_for_organization(self):
        """Test deletion for account of organization."""
        self.client.login(
            username='organization@example.com',
            password='123org',
        )
        response = self.client.get('/o/offers/delete/{}'
                                   .format(self.inactive_offer.id))
        self.assertEqual(response.status_code, 403)

    def test_offer_deletion_for_admin(self):
        """Test deletion for account of admin."""
        self.client.login(
            username='admin@example.com',
            password='123admin',
        )
        response = self.client.get('/o/offers/delete/{}'
                                   .format(self.inactive_offer.id))
        self.assertEqual(response.status_code, 302)
