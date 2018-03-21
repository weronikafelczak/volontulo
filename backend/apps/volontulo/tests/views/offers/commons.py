"""
.. module:: commons
"""

from apps.volontulo.factories import OfferFactory
from apps.volontulo.factories import OrganizationFactory
from apps.volontulo.factories import UserProfileFactory


class TestOffersCommons(object):
    """Commons setups for offers' testcases."""

    @classmethod
    def setUpTestData(cls):
        """Set up data for all tests."""
        cls.organization = OrganizationFactory()

        cls.inactive_offer = OfferFactory(
            organization=cls.organization,
            status_old='NEW',
            offer_status='unpublished',
            recruitment_status='open',
        )
        cls.active_offer = OfferFactory(
            organization=cls.organization,
            status_old='ACTIVE',
            action_status='ongoing',
            offer_status='published',
            recruitment_status='open',
        )

        cls.volunteer = UserProfileFactory.create(
            user__username='volunteer@example.com',
            user__email='volunteer@example.com',
            user__password='123volunteer',
        )
        cls.organization_profile = UserProfileFactory.create(
            user__username='cls.organization@example.com',
            user__email='cls.organization@example.com',
            user__password='123org',
            organizations=(cls.organization,),
        )
        cls.admin = UserProfileFactory.create(
            user__username='admin@example.com',
            user__email='admin@example.com',
            user__password='123admin',
            is_administrator=True,
        )
