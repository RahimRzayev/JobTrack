from django.urls import path
from .views import MatchScoreView, CoverLetterView, ScrapeJobView

urlpatterns = [
    path('match-score/', MatchScoreView.as_view(), name='ai-match-score'),
    path('cover-letter/', CoverLetterView.as_view(), name='ai-cover-letter'),
    path('scrape-job/', ScrapeJobView.as_view(), name='ai-scrape-job'),
]
