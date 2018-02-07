# -*- coding: utf-8 -*-

"""
.. module:: permissions
"""

from rest_framework import permissions


class OfferPermission(permissions.BasePermission):

    """REST API offers permissions."""

    def has_permission(self, request, view):
        """We are accepting only safe methods for now."""
        if view.action in ('create', 'update'):
            return request.user.is_authenticated()
        return request.method in permissions.SAFE_METHODS


    def has_object_permission(self, request, view, obj):
        if view.action == 'update':
            return obj.organization in request.user.userprofile.organizations.all()
        return request.method in permissions.SAFE_METHODS


class OrganizationPermission(permissions.BasePermission):

    """REST API organizations permissions."""

    def has_permission(self, request, view):
        """We are accepting only safe methods for now."""
        return request.method in permissions.SAFE_METHODS
