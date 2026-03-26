from django.contrib import admin
from .models import JobApplication


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ('company', 'position', 'status', 'user', 'deadline', 'match_score', 'updated_at')
    list_filter = ('status', 'created_at')
    search_fields = ('company', 'position')
    readonly_fields = ('created_at', 'updated_at')
