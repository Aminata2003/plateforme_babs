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
    choices = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = ["id", "text", "order", "choices"]

    def get_choices(self, obj):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if user and user.is_authenticated and (user.is_admin or user.is_formateur):
            return ChoiceSerializer(obj.choices.all(), many=True).data
        return ChoicePublicSerializer(obj.choices.all(), many=True).data


class QuestionWriteSerializer(serializers.ModelSerializer):
    """Utilisé par l'admin/formateur pour créer/modifier une question (choix ajoutés séparément)."""
    class Meta:
        model = Question
        fields = ["id", "quiz", "text", "order"]


class ChoiceWriteSerializer(serializers.ModelSerializer):
    """Utilisé par l'admin/formateur pour créer/modifier un choix de réponse."""
    class Meta:
        model = Choice
        fields = ["id", "question", "text", "is_correct"]


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
    lessons = serializers.SerializerMethodField()
    lessons_count = serializers.SerializerMethodField()

    class Meta:
        model = Module
        fields = [
            "id", "title", "description", "order", "is_published",
            "created_by", "created_at", "lessons", "lessons_count",
        ]
        read_only_fields = ["created_by", "created_at"]

    def _is_staff(self):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        return bool(user and user.is_authenticated and (user.is_admin or user.is_formateur))

    def get_lessons(self, obj):
        queryset = obj.lessons.all().order_by("order")
        if not self._is_staff():
            queryset = queryset.filter(is_published=True)
        return LessonSerializer(queryset, many=True, context=self.context).data

    def get_lessons_count(self, obj):
        if self._is_staff():
            return obj.lessons.count()
        return obj.lessons.filter(is_published=True).count()


class ModuleListSerializer(serializers.ModelSerializer):
    """Version allégée pour les listes (sans le détail des leçons)."""
    lessons_count = serializers.SerializerMethodField()

    class Meta:
        model = Module
        fields = ["id", "title", "description", "order", "is_published", "lessons_count"]

    def get_lessons_count(self, obj):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if user and user.is_authenticated and (user.is_admin or user.is_formateur):
            return obj.lessons.count()
        return obj.lessons.filter(is_published=True).count()


class DevoirSerializer(serializers.ModelSerializer):
    class Meta:
        model = Devoir
        fields = ["id", "module", "title", "instructions", "deadline", "max_score", "created_at"]


class SubmissionSerializer(serializers.ModelSerializer):
    user_full_name = serializers.SerializerMethodField()
    devoir_title = serializers.CharField(source="devoir.title", read_only=True)
    devoir_max_score = serializers.IntegerField(source="devoir.max_score", read_only=True)

    class Meta:
        model = Submission
        fields = [
            "id", "devoir", "devoir_title", "devoir_max_score", "user", "user_full_name",
            "file", "comment", "grade", "feedback", "submitted_at", "graded_at",
        ]
        read_only_fields = ["user", "submitted_at", "graded_at"]

    def get_user_full_name(self, obj):
        return obj.user.get_full_name()


class LessonProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonProgress
        fields = ["id", "lesson", "completed_at"]
        read_only_fields = ["completed_at"]


class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = ["id", "user", "enrolled_at", "is_active"]
