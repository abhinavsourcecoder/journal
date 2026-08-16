from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EntryViewSet,
    RegisterView,
    LoginView,
    LogoutView,
    CurrentUserView
)

router = DefaultRouter()
router.register(r'entries', EntryViewSet, basename='entry')

urlpatterns = [
    # Auth endpoints
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/login/', LoginView.as_view(), name='auth_login'),
    path('auth/logout/', LogoutView.as_view(), name='auth_logout'),
    path('auth/user/', CurrentUserView.as_view(), name='auth_user'),

    # Entry ViewSet endpoints (/entries/, /entries/<id>/, /entries/by-date/, /entries/calendar-summary/)
    path('', include(router.urls)),
]
