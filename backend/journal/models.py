from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError


class Entry(models.Model):
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='journal_entries',
        help_text="User who wrote this gratitude journal entry"
    )
    content = models.TextField(
        help_text="The gratitude reflection and notes for the day"
    )
    date = models.DateField(
        help_text="The date of this gratitude entry (one entry per user per date)"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['owner', 'date'],
                name='unique_owner_date_entry'
            )
        ]
        verbose_name = 'Gratitude Entry'
        verbose_name_plural = 'Gratitude Entries'

    def clean(self):
        super().clean()
        if not self.content or not self.content.strip():
            raise ValidationError({'content': 'Gratitude entry content cannot be empty.'})

    def __str__(self):
        return f"{self.owner.username}'s Gratitude Entry for {self.date}"
