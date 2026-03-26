from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import JobApplicationViewSet, ScrapeJobAPIView, DownloadCoverLetterView

router = DefaultRouter()
router.register(r'', JobApplicationViewSet, basename='job')

urlpatterns = [
    path('scrape/', ScrapeJobAPIView.as_view(), name='scrape-job'),
    path('download-cover-letter/', DownloadCoverLetterView.as_view(), name='download-cover-letter'),
    path('', include(router.urls)),
]
