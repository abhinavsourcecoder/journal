from django.contrib import admin
from .models import Entry


@admin.register(Entry)
class EntryAdmin(admin.ModelAdmin):
    list_display = ('id', 'owner', 'date', 'short_content', 'created_at', 'updated_at')
    list_filter = ('date', 'created_at', 'owner')
    search_fields = ('content', 'owner__username', 'owner__email')
    ordering = ('-date', '-created_at')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'date'

    def short_content(self, obj):
        if len(obj.content) > 60:
            return obj.content[:57] + '...'
        return obj.content
    short_content.short_description = 'Content Preview'
