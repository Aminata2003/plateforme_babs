from rest_framework import serializers

from .models import (
    Choice, Devoir, Enrollment, Lesson, LessonProgress, Module,
    Question, Quiz, QuizAttempt, Submission,
)


class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ["id", "text", "is_correct"]


class ChoicePublicSerializer(serializers.ModelSerializer):
    """Ne renvoie pas is_correct côté apprenant tant qu'il n'a pas répondu."""
    class Meta:
        model = Choice
        fields = ["id", "text"]


class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True)

    class Meta:
        model = Question
        fields = ["id", "text", "order", "choices"]

    def create(self, validated_data):
        choices_data = validated_data.pop("choices")
        question = Question.objects.create(**validated_data)
        for choice in choices_data:
            Choice.objects.create(question=question, **choice)
        return question


class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = ["id", "lesson", "title", "passing_score", "questions"]


class QuizAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizAttempt
        fields = ["id", "quiz", "user", "score", "passed", "submitted_at"]
        read_only_fields = ["user", "passed", "submitted_at"]


class LessonSerializer(serializers.ModelSerializer):
    quiz = QuizSerializer(read_only=True)
    is_completed = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = [
            "id", "module", "title", "description", "youtube_url",
            "duration_minutes", "resource_file", "order", "is_published",
            "quiz", "is_completed",
        ]

    def get_is_completed(self, obj):
        user = self.context.get("request").user if self.context.get("request") else None
        if not user or not user.is_authenticated:
            return False
        return LessonProgress.objects.filter(user=user, lesson=obj).exists()


class ModuleSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    lessons_count = serializers.IntegerField(source="lessons.count", read_only=True)

    class Meta:
        model = Module
        fields = [
            "id", "title", "description", "order", "is_published",
            "created_by", "created_at", "lessons", "lessons_count",
        ]
        read_only_fields = ["created_by", "created_at"]


class ModuleListSerializer(serializers.ModelSerializer):
    """Version allégée pour les listes (sans le détail des leçons)."""
    lessons_count = serializers.IntegerField(source="lessons.count", read_only=True)

    class Meta:
        model = Module
        fields = ["id", "title", "description", "order", "is_published", "lessons_count"]


class DevoirSerializer(serializers.ModelSerializer):
    class Meta:
        model = Devoir
        fields = ["id", "module", "title", "instructions", "deadline", "max_score", "created_at"]


class SubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = [
            "id", "devoir", "user", "file", "comment",
            "grade", "feedback", "submitted_at", "graded_at",
        ]
        read_only_fields = ["user", "submitted_at", "graded_at"]


class LessonProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonProgress
        fields = ["id", "lesson", "completed_at"]
        read_only_fields = ["completed_at"]


class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = ["id", "user", "enrolled_at", "is_active"]
