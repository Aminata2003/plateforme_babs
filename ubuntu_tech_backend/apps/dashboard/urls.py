from django.urls import path

from .views import DashboardStatsView, LearnerDetailView, LearnersOverviewView

urlpatterns = [
    path("stats/", DashboardStatsView.as_view(), name="dashboard-stats"),
    path("learners/", LearnersOverviewView.as_view(), name="dashboard-learners"),
    path("learners/<int:user_id>/", LearnerDetailView.as_view(), name="dashboard-learner-detail"),
]
