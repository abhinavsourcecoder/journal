import urllib.request
import urllib.parse
import json
from datetime import date, timedelta

BACKEND_URL = 'https://journal-gwzb.onrender.com'
FRONTEND_URL = 'https://journal-zeta-six.vercel.app'

def run_e2e_http_tests():
    print("=" * 60)
    print("DAILY GRATITUDE JOURNAL - E2E SYSTEM INTEGRATION TEST")
    print("=" * 60)

    # 1. Test Frontend Server Serving
    print("\n[1] Testing Frontend Dev Server...")
    req = urllib.request.Request(FRONTEND_URL)
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        html = resp.read().decode('utf-8')
        assert "Daily Gratitude Journal" in html
        print("  [PASS] Frontend HTML served successfully (Status 200, contains Title)")

    # Helper for API requests
    def api_call(path, method='GET', data=None, token=None):
        url = f"{BACKEND_URL}{path}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f"Token {token}"

        body = json.dumps(data).encode('utf-8') if data else None
        req = urllib.request.Request(url, data=body, headers=headers, method=method)
        try:
            with urllib.request.urlopen(req) as resp:
                status_code = resp.status
                res_body = resp.read().decode('utf-8')
                return status_code, json.loads(res_body) if res_body else {}
        except urllib.error.HTTPError as e:
            err_body = e.read().decode('utf-8')
            return e.code, json.loads(err_body) if err_body else {}

    # 2. Test Login
    print("\n[2] Testing Demo User Login...")
    status, data = api_call('/api/auth/login/', method='POST', data={
        'username': 'demo_user',
        'password': 'demo123'
    })
    assert status == 200, f"Login failed: {data}"
    demo_token = data['token']
    print(f"  [PASS] Demo login successful! Token received: {demo_token[:10]}...")

    # 3. Test Current User Info & Stats
    print("\n[3] Testing Current User Info & Gratitude Streak...")
    status, data = api_call('/api/auth/user/', method='GET', token=demo_token)
    assert status == 200
    assert data['user']['username'] == 'demo_user'
    print(f"  [PASS] User profile verified: {data['user']['username']}, Total entries: {data['stats']['total_entries']}, Streak: {data['stats']['streak_days']} days")

    # 4. Test Calendar Summary
    print("\n[4] Testing Calendar Summary Endpoint...")
    status, data = api_call('/api/entries/calendar-summary/', method='GET', token=demo_token)
    assert status == 200
    assert len(data) >= 1
    print(f"  [PASS] Calendar summary returned {len(data)} entry dates for monthly dots")

    # 5. Test Creating a New Entry
    test_date = (date.today() + timedelta(days=2)).strftime('%Y-%m-%d')
    print(f"\n[5] Testing Create Entry for {test_date}...")
    status, data = api_call('/api/entries/', method='POST', data={
        'date': test_date,
        'content': 'I am grateful for clear skies, productive focus, and continuous learning!'
    }, token=demo_token)
    assert status == 201, f"Create entry failed: {data}"
    created_id = data['id']
    print(f"  [PASS] Entry #{created_id} created successfully for {test_date}")

    # 6. Test Fetching by Date
    print(f"\n[6] Testing Get Entry by Date for {test_date}...")
    status, data = api_call(f'/api/entries/by-date/?date={test_date}', method='GET', token=demo_token)
    assert status == 200
    assert data['id'] == created_id
    print(f"  [PASS] Fetched entry by date successfully: '{data['content'][:40]}...'")

    # 7. Test Updating Entry
    print(f"\n[7] Testing Updating Entry #{created_id}...")
    status, data = api_call(f'/api/entries/{created_id}/', method='PATCH', data={
        'content': 'Updated: Grateful for clear skies, peace of mind, and evening tea.'
    }, token=demo_token)
    assert status == 200
    assert 'Updated:' in data['content']
    print("  [PASS] Entry updated successfully!")

    # 8. Test Duplicate Date Entry Prevention
    print(f"\n[8] Testing Duplicate Prevention on {test_date}...")
    status, data = api_call('/api/entries/', method='POST', data={
        'date': test_date,
        'content': 'Duplicate attempt note'
    }, token=demo_token)
    assert status == 400
    print(f"  [PASS] Duplicate entry correctly rejected with status 400: {data}")

    # 9. Test Deleting Entry
    print(f"\n[9] Testing Deleting Entry #{created_id}...")
    status, data = api_call(f'/api/entries/{created_id}/', method='DELETE', token=demo_token)
    assert status == 204
    print("  [PASS] Entry deleted successfully (Status 204 No Content)")

    # 10. Test Multi-User Isolation
    print("\n[10] Testing User Registration & Data Isolation...")
    import random
    rand_user = f"mindful_{random.randint(1000, 9999)}"
    status, data = api_call('/api/auth/register/', method='POST', data={
        'username': rand_user,
        'email': f'{rand_user}@example.com',
        'password': 'safePassword123'
    })
    assert status == 201, f"Registration failed: {data}"
    new_user_token = data['token']
    print(f"  [PASS] Registered new isolated user: {rand_user}")

    # New user should have 0 entries
    status, data = api_call('/api/entries/', method='GET', token=new_user_token)
    assert status == 200
    assert len(data) == 0, f"Expected 0 entries for new user, got: {data}"
    print(f"  [PASS] Verified strict user isolation: {rand_user} has 0 entries (cannot see demo_user's entries)")

    print("\n" + "=" * 60)
    print("ALL 10 END-TO-END SYSTEM INTEGRATION TESTS PASSED! SUCCESS")
    print("=" * 60)

if __name__ == '__main__':
    run_e2e_http_tests()
