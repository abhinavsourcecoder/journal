from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from journal.models import Entry
from datetime import date, timedelta


class Command(BaseCommand):
    help = 'Seeds the database with an admin user and demo user with sample entries.'

    def handle(self, *args, **options):
        # Admin user
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@example.com',
                'is_staff': True,
                'is_superuser': True
            }
        )
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write(self.style.SUCCESS("Created admin user: 'admin' / 'admin123'"))
        else:
            self.stdout.write("Admin user already exists.")

        # Demo user
        demo_user, created = User.objects.get_or_create(
            username='demo_user',
            defaults={
                'email': 'demo@example.com'
            }
        )
        if created:
            demo_user.set_password('demo123')
            demo_user.save()
            self.stdout.write(self.style.SUCCESS("Created demo user: 'demo_user' / 'demo123'"))

            today = date.today()
            sample_entries = [
                (today, "Grateful for a productive day, the gentle morning breeze, and a peaceful walk in the park. 🌿"),
                (today - timedelta(days=1), "Thankful for a great cup of coffee, laughter with good friends, and learning something new today. ☕✨"),
                (today - timedelta(days=3), "Appreciative of my family's support, warm sunshine after the rain, and time to read my favorite book. 📖🌸"),
                (today - timedelta(days=5), "Grateful for deep, uninterrupted sleep and feeling energized to tackle new goals. 💫")
            ]

            for entry_date, content in sample_entries:
                Entry.objects.create(owner=demo_user, date=entry_date, content=content)

            self.stdout.write(self.style.SUCCESS(f"Created {len(sample_entries)} sample entries for demo_user."))
        else:
            self.stdout.write("Demo user already exists.")
