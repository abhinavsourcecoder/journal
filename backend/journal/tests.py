from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework.authtoken.models import Token
from datetime import date, timedelta
from .models import Entry


class JournalAPITests(APITestCase):
    def setUp(self):
        # Create User 1
        self.user1 = User.objects.create_user(
            username='alice',
            email='alice@example.com',
            password='password123'
        )
        self.token1 = Token.objects.create(user=self.user1)

        # Create User 2
        self.user2 = User.objects.create_user(
            username='bob',
            email='bob@example.com',
            password='password123'
        )
        self.token2 = Token.objects.create(user=self.user2)

        self.today = date.today()
        self.yesterday = self.today - timedelta(days=1)

    def test_user_registration(self):
        url = reverse('auth_register')
        data = {
            'username': 'charlie',
            'email': 'charlie@example.com',
            'password': 'strongpassword123'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['username'], 'charlie')

    def test_user_login(self):
        url = reverse('auth_login')
        data = {
            'username': 'alice',
            'password': 'password123'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['token'], self.token1.key)

    def test_unauthenticated_request_denied(self):
        url = reverse('entry-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_and_get_entry(self):
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token1.key)
        url = reverse('entry-list')
        data = {
            'date': self.today.strftime('%Y-%m-%d'),
            'content': 'I am grateful for fresh morning coffee and sunshine.'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['content'], data['content'])
        self.assertEqual(response.data['owner_username'], 'alice')

        # Retrieve entry by date endpoint
        by_date_url = reverse('entry-get-by-date') + f"?date={self.today.strftime('%Y-%m-%d')}"
        by_date_response = self.client.get(by_date_url)
        self.assertEqual(by_date_response.status_code, status.HTTP_200_OK)
        self.assertEqual(by_date_response.data['content'], data['content'])

    def test_duplicate_entry_same_date_prevented(self):
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token1.key)
        url = reverse('entry-list')
        data = {
            'date': self.today.strftime('%Y-%m-%d'),
            'content': 'First gratitude note of the day.'
        }
        res1 = self.client.post(url, data, format='json')
        self.assertEqual(res1.status_code, status.HTTP_201_CREATED)

        # Attempt to create duplicate for the same user and date
        data2 = {
            'date': self.today.strftime('%Y-%m-%d'),
            'content': 'Second attempt note.'
        }
        res2 = self.client.post(url, data2, format='json')
        self.assertEqual(res2.status_code, status.HTTP_400_BAD_REQUEST)

    def test_empty_content_rejected(self):
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token1.key)
        url = reverse('entry-list')
        data = {
            'date': self.today.strftime('%Y-%m-%d'),
            'content': '    '
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_and_delete_entry(self):
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token1.key)
        entry = Entry.objects.create(
            owner=self.user1,
            date=self.today,
            content='Original content'
        )

        detail_url = reverse('entry-detail', kwargs={'pk': entry.pk})

        # Update
        patch_res = self.client.patch(detail_url, {'content': 'Updated gratitude content'}, format='json')
        self.assertEqual(patch_res.status_code, status.HTTP_200_OK)
        self.assertEqual(patch_res.data['content'], 'Updated gratitude content')

        # Delete
        delete_res = self.client.delete(detail_url)
        self.assertEqual(delete_res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Entry.objects.filter(pk=entry.pk).exists())

    def test_multi_user_isolation(self):
        # Alice creates an entry
        alice_entry = Entry.objects.create(
            owner=self.user1,
            date=self.today,
            content="Alice's private thoughts"
        )

        # Bob logs in
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token2.key)

        # Bob lists entries -> should not see Alice's entry
        list_res = self.client.get(reverse('entry-list'))
        self.assertEqual(list_res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_res.data), 0)

        # Bob tries to access Alice's entry by ID -> 404 Not Found
        detail_url = reverse('entry-detail', kwargs={'pk': alice_entry.pk})
        get_res = self.client.get(detail_url)
        self.assertEqual(get_res.status_code, status.HTTP_404_NOT_FOUND)

        # Bob tries to update Alice's entry -> 404 Not Found
        patch_res = self.client.patch(detail_url, {'content': 'Hacked content'}, format='json')
        self.assertEqual(patch_res.status_code, status.HTTP_404_NOT_FOUND)

        # Bob tries to delete Alice's entry -> 404 Not Found
        del_res = self.client.delete(detail_url)
        self.assertEqual(del_res.status_code, status.HTTP_404_NOT_FOUND)

        # Bob can create his OWN entry on the exact same date without conflict
        bob_post_res = self.client.post(
            reverse('entry-list'),
            {'date': self.today.strftime('%Y-%m-%d'), 'content': "Bob's private gratitude"},
            format='json'
        )
        self.assertEqual(bob_post_res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Entry.objects.count(), 2)
