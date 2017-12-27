# -*- coding: utf-8 -*-

"""
.. module:: offers
"""

from django.conf import settings
from django.contrib import messages
from django.contrib.admin.models import ADDITION, CHANGE
from django.contrib.auth.models import User
from django.core.urlresolvers import reverse
from django.http import Http404, HttpResponseForbidden
from django.shortcuts import get_object_or_404, redirect, render
from django.utils.safestring import mark_safe
from django.utils.text import slugify
from django.views.generic import View

from apps.volontulo.forms import (
    CreateOfferForm, OfferApplyForm, OfferImageForm
)
from apps.volontulo.lib.email import send_mail
from apps.volontulo.models import Offer, OfferImage, UserProfile
from apps.volontulo.utils import correct_slug, save_history
from apps.volontulo.views import logged_as_admin


class OffersList(View):
    """View that handle list of offers."""

    @staticmethod
    def get(request):
        """It's used for volunteers to show active ones and for admins to show
        all of them.

        :param request: WSGIRequest instance
        """
        if logged_as_admin(request):
            offers = Offer.objects.all()
        else:
            offers = Offer.objects.get_active()

        return render(request, "offers/offers_list.html", context={
            'offers': offers,
        })

    @staticmethod
    def post(request):
        """Method responsible for rendering form for new offer.

        :param request: WSGIRequest instance
        """
        if (
                request.POST.get('edit_type') == 'status_change' and
                request.POST.get('offer_id')
        ):
            offer = get_object_or_404(Offer, id=request.POST.get('offer_id'))
            offer.publish()
            messages.success(request,
                             "Aktywowałeś ofertę '%s'" % offer.title)
        return redirect('offers_list')


class OffersCreate(View):
    """Class view supporting creation of new offer."""

    @staticmethod
    def get(request):
        """Method responsible for rendering form for new offer.

        :param request: WSGIRequest instance
        """
        if request.user.is_anonymous():
            messages.info(
                request,
                "Aby założyć ofertę, musisz się zalogować lub zarejestrować."
            )

            return redirect(
                '{login}?next={path}'.format(
                    login=reverse('login'), path=request.path
                )
            )

        if request.user.userprofile.is_administrator:
            messages.info(
                request,
                "Administrator nie może tworzyć nowych ofert."
            )
            return redirect('offers_list')

        organizations = request.user.userprofile.organizations.all()

        if not organizations.exists():
            messages.info(request, mark_safe(
                "Nie masz jeszcze żadnej założonej organizacji"
                " na {0}. Aby założyć organizację,"
                " <a href='{1}'>kliknij tu.</a>".format(
                    settings.SYSTEM_DOMAIN,
                    reverse('organizations_create')
                )
            ))
            return redirect('offers_list')

        return render(
            request,
            'offers/offer_form.html',
            {
                'offer': Offer(),
                'form': CreateOfferForm(),
                'organizations': organizations,
            }
        )

    @staticmethod
    def post(request):
        """Method responsible for saving new offer.

        :param request: WSGIRequest instance
        """
        form = CreateOfferForm(request.POST)
        if form.is_valid():
            offer = form.save()
            offer.create_new()
            offer.save()
            save_history(request, offer, action=ADDITION)
            send_mail(
                request,
                'offer_creation',
                ['administrators@volontuloapp.org'],
                {'offer': offer}
            )
            messages.success(request, "Dziękujemy za dodanie oferty.")
            return redirect(
                'offers_view',
                slug=slugify(offer.title),
                id_=offer.id,
            )
        messages.error(
            request,
            "Formularz zawiera niepoprawnie wypełnione pola <br />{0}".format(
                '<br />'.join(form.errors)),
        )
        return render(
            request,
            'offers/offer_form.html',
            {
                'form': form,
                'offer': Offer(),
                'organizations': request.user.userprofile.organizations.all(),
            }
        )


class OffersReorder(View):
    """Class view supporting change of a offer."""

    def dispatch(self, request, *args, **kwargs):
        user = self.request.user
        if (
                not user.is_authenticated() or
                not user.userprofile.is_administrator
        ):
            return redirect('offers_list')
        return super(OffersReorder, self).dispatch(request, *args, **kwargs)

    @staticmethod
    def get(request, id_):
        """Display offer list with weights GET request.

        :param request: WSGIRequest instance
        :param id_:
        :return:
        """
        offers = Offer.objects.get_weightened()
        return render(request, 'offers/reorder.html', {
            'offers': offers, 'id': id_})

    @staticmethod
    def post(request, _):
        """Display offer list with weights GET request.

        :param request:
        :param id_: Integer newly created offer id
        :return:
        """
        if request.POST.get('submit') == 'reorder':
            items = [item
                     for item
                     in request.POST.items()
                     if item[0].startswith('weight_')]
            weights = {id_.split('_')[1]: weight
                       for id_, weight in items}
            for id_, weight in weights.items():
                Offer.objects.filter(id=id_).update(weight=weight)

            messages.success(
                request,
                "Uporządkowano oferty."
            )
        return redirect('offers_list')


class OffersEdit(View):
    """Class view supporting change of a offer."""

    def dispatch(self, request, *args, **kwargs):
        """Dispatch method overriden to check offer edit permission"""
        try:
            is_edit_allowed = request.user.userprofile.can_edit_offer(
                offer_id=kwargs['id_'])
        except Offer.DoesNotExist:
            is_edit_allowed = False
        if not is_edit_allowed:
            raise Http404()
        return super().dispatch(request, *args, **kwargs)

    @staticmethod
    @correct_slug(Offer, 'offers_edit', 'title')
    def get(request, slug, id_):  # pylint: disable=unused-argument
        """Method responsible for rendering form for offer to be changed.

        :param request: WSGIRequest instance
        :param slug: string Offer title slugified
        :param id_: int Offer database unique identifier (primary key)
        """
        offer = Offer.objects.get(id=id_)
        if offer.id or request.user.userprofile.is_administrator:
            organizations = [offer.organization]
        else:
            organizations = request.user.userprofile.organizations.all()

        return render(
            request,
            'offers/offer_form.html',
            {
                'offer': offer,
                'offer_form': CreateOfferForm(),
                'organization': offer.organization,
                'organizations': organizations,
                'offer_image_form': OfferImageForm(),
                'images': OfferImage.objects.filter(offer=offer).all(),
                'MEDIA_URL': settings.MEDIA_URL,
            }
        )

    @staticmethod
    def post(request, slug, id_):  # pylint: disable=unused-argument
        """Method resposible for saving changed offer.

        :param request: WSGIRequest instance
        :param slug: string Offer title slugified
        :param id_: int Offer database unique identifier (primary key)
        """
        offer = Offer.objects.get(id=id_)
        if request.POST.get('submit') == 'save_image' and request.FILES:
            form = OfferImageForm(request.POST, request.FILES)
            if form.is_valid():
                offer.save_offer_image(
                    form.save(commit=False),
                    form.cleaned_data['is_main']
                )
                messages.success(request, "Dodano zdjęcie do galerii.")
            else:
                messages.error(
                    request,
                    "Problem w trakcie dodawania grafiki: {}".format(
                        "<br />".join(form.errors)
                    )
                )

            return redirect(
                reverse(
                    'offers_edit',
                    args=[slugify(offer.title), offer.id]
                )
            )
        elif request.POST.get('close_offer') == 'close':
            offer.close_offer()
            return redirect(
                reverse(
                    'offers_view',
                    args=[slugify(offer.title), offer.id]
                )
            )
        elif request.POST.get('status_flag') == 'change_status':
            if request.POST.get('status') == 'published':
                offer.publish()
                if request.user.userprofile.is_administrator:
                    return redirect('offers_reorder', offer.id)
            elif request.POST.get('status') == 'rejected':
                offer.reject()
            return redirect('offers_list')

        form = CreateOfferForm(
            request.POST, instance=offer
        )

        if form.is_valid():
            offer = form.save()
            offer.unpublish()
            offer.save()
            save_history(request, offer, action=CHANGE)
            messages.success(request, "Oferta została zmieniona.")
        else:
            messages.error(
                request,
                "Formularz zawiera niepoprawnie wypełnione pola: {}".format(
                    "<br />".join(form.errors)
                )
            )

        if offer.id or request.user.userprofile.is_administrator:
            organizations = [offer.organization]
        else:
            organizations = request.user.userprofile.organizations.all()

        return render(
            request,
            'offers/offer_form.html',
            {
                'offer': offer,
                'form': form,
                'organizations': organizations,
                'offer_image_form': OfferImageForm(),
            }
        )


class OffersDelete(View):
    """ Class view responsible for deletion of offers """

    @staticmethod
    def get(request, pk):  # pylint: disable=invalid-name
        """Method which allows to delete selected offer

        :param request: WSGIRequest instance
        :param pk: Offer id
        """
        offer = get_object_or_404(Offer, pk=pk)
        if (
                request.user.is_authenticated() and
                request.user.userprofile.is_administrator
        ):
            offer.reject()
            messages.info(request, "Oferta została odrzucona.")
            return redirect('homepage')

        return HttpResponseForbidden()


class OffersAccept(View):
    """ Class view responsible for acceptance of offers """

    @staticmethod
    def get(request, pk):  # pylint: disable=invalid-name
        """Method which allows to delete selected offer

        :param request: WSGIRequest instance
        :param pk: Offer id
        """
        offer = get_object_or_404(Offer, pk=pk)
        if (
                request.user.is_authenticated() and
                request.user.userprofile.is_administrator
        ):
            offer.publish()
            messages.info(request, "Oferta została zaakceptowana.")
            return redirect('homepage')

        return HttpResponseForbidden()


class OffersJoin(View):
    """Class view supporting joining offer."""

    @staticmethod
    @correct_slug(Offer, 'offers_join', 'title')
    def get(request, slug, id_):  # pylint: disable=unused-argument
        """View responsible for showing join form for particular offer."""
        if request.user.is_authenticated():
            has_applied = Offer.objects.filter(
                volunteers=request.user,
                volunteers__offer=id_,
            ).count()
            if has_applied:
                messages.error(
                    request,
                    "Już wyraziłeś chęć uczestnictwa w tej ofercie."
                )
                return redirect('offers_list')

        offer = Offer.objects.get(id=id_)
        try:
            main_image = OfferImage.objects.get(offer=offer, is_main=True)
        except OfferImage.DoesNotExist:
            main_image = ''

        context = {
            'form': OfferApplyForm(),
            'offer': offer,
            'MEDIA_URL': settings.MEDIA_URL,
            'main_image': main_image,
        }

        context['volunteer_user'] = UserProfile()
        if request.user.is_authenticated():
            context['volunteer_user'] = request.user.userprofile

        return render(
            request,
            'offers/offer_apply.html',
            context
        )

    @staticmethod
    @correct_slug(Offer, 'offers_join', 'title')
    def post(request, slug, id_):  # pylint: disable=unused-argument
        """View responsible for saving join for particular offer."""
        form = OfferApplyForm(request.POST)
        offer = Offer.objects.get(id=id_)
        if form.is_valid():
            if request.user.is_authenticated():
                user = request.user
            else:
                user = User.objects.filter(
                    email=request.POST.get('email')
                ).exists()

                if user:
                    messages.info(
                        request,
                        "Zaloguj się, aby zapisać się do oferty."
                    )
                    return redirect(
                        '{login}?next={path}'.format(
                            login=reverse('login'), path=request.path
                        )
                    )

                messages.info(
                    request,
                    "Zarejestruj się, aby zapisać się do oferty."
                )
                return redirect('register')

            has_applied = Offer.objects.filter(
                volunteers=user,
                volunteers__offer=id_,
            ).count()
            if has_applied:
                messages.error(
                    request,
                    "Już wyraziłeś chęć uczestnictwa w tej ofercie."
                )
                return redirect('offers_list')

            offer.volunteers.add(user)
            offer.save()
            send_mail(
                request,
                'offer_application',
                [
                    userprofile.user.email
                    for userprofile in offer.organization.userprofiles.all()
                ],
                dict(
                    email=request.POST.get('email'),
                    phone_no=request.POST.get('phone_no'),
                    fullname=request.POST.get('fullname'),
                    comments=request.POST.get('comments'),
                    offer=offer,
                )
            )
            messages.success(
                request,
                "Zgłoszenie chęci uczestnictwa zostało wysłane."
            )
            return redirect(
                'offers_view',
                slug=slugify(offer.title),
                id_=offer.id,
            )
        else:
            errors = "<br />".join(form.errors)
            messages.error(
                request,
                "Formularz zawiera nieprawidłowe dane" + errors
            )
            volunteer_user = UserProfile()
            if request.user.is_authenticated():
                volunteer_user = request.user.userprofile
            return render(
                request,
                'offers/offer_apply.html',
                {
                    'offer': offer,
                    'form': form,
                    'volunteer_user': volunteer_user,
                }
            )


class OffersArchived(View):
    """Class based view to list archived offers."""

    @staticmethod
    def get(request):
        """GET request for offer archive page.

        :param request: WSGIRequest instance
        """
        return render(request, 'offers/archived.html', {
            'offers': Offer.objects.get_archived()
        })
