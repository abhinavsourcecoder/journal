from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import datetime, timedelta

from .models import Entry
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    LoginSerializer,
    EntrySerializer
)


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user': UserSerializer(user).data,
                'message': 'Registration successful.'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = serializer.validated_data['user']
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user': UserSerializer(user).data,
                'message': 'Login successful.'
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            # Delete the user's auth token
            token = Token.objects.get(user=request.user)
            token.delete()
        except Token.DoesNotExist:
            pass
        return Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)


class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        entries = Entry.objects.filter(owner=user)
        total_entries = entries.count()

        # Calculate gratitude streak (consecutive days leading up to today or yesterday)
        today = timezone.localdate()
        entry_dates = set(entries.values_list('date', flat=True))

        streak = 0
        check_date = today
        if check_date not in entry_dates:
            check_date = today - timedelta(days=1)

        while check_date in entry_dates:
            streak += 1
            check_date -= timedelta(days=1)

        return Response({
            'user': UserSerializer(user).data,
            'stats': {
                'total_entries': total_entries,
                'streak_days': streak,
                'has_today_entry': today in entry_dates
            }
        })


class EntryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing Journal Entries.
    Strictly isolated to the authenticated user.
    """
    serializer_class = EntrySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Strict user isolation: never allow access to other users' entries
        queryset = Entry.objects.filter(owner=self.request.user)

        # Optional date filtering: ?date=YYYY-MM-DD
        date_param = self.request.query_params.get('date', None)
        if date_param:
            queryset = queryset.filter(date=date_param)

        # Optional month filtering: ?month=YYYY-MM or ?year=YYYY&month=MM
        month_param = self.request.query_params.get('month', None)
        year_param = self.request.query_params.get('year', None)
        if month_param and '-' in month_param:
            try:
                y, m = month_param.split('-')
                queryset = queryset.filter(date__year=int(y), date__month=int(m))
            except ValueError:
                pass
        elif year_param:
            try:
                queryset = queryset.filter(date__year=int(year_param))
                if month_param:
                    queryset = queryset.filter(date__month=int(month_param))
            except ValueError:
                pass

        return queryset

    def perform_create(self, serializer):
        # Enforce authenticated owner automatically
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=['get'], url_path='by-date')
    def get_by_date(self, request):
        """
        Endpoint to retrieve a journal entry by date:
        GET /api/entries/by-date/?date=YYYY-MM-DD
        """
        date_str = request.query_params.get('date')
        if not date_str:
            return Response({'error': 'Date query parameter is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            entry = Entry.objects.get(owner=request.user, date=date_str)
            serializer = self.get_serializer(entry)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Entry.DoesNotExist:
            return Response({'detail': 'No entry found for the specified date.'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'], url_path='calendar-summary')
    def calendar_summary(self, request):
        """
        Endpoint returning a lightweight list of all dates that have an entry,
        ideal for efficient calendar markers.
        """
        entries = Entry.objects.filter(owner=request.user).values('id', 'date', 'updated_at')
        return Response(list(entries), status=status.HTTP_200_OK)
