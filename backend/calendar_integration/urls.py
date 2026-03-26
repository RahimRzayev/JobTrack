from django.urls import path
from .views import ScheduleInterviewView, GoogleCalendarCallbackView

urlpatterns = [
    path('schedule/', ScheduleInterviewView.as_view(), name='calendar-schedule'),
    path('callback/', GoogleCalendarCallbackView.as_view(), name='calendar-callback'),
]
