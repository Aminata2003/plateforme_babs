from django.contrib import admin

from .models import (
    Choice, Devoir, Enrollment, Lesson, LessonProgress, Module,
    Question, Quiz, QuizAttempt, Submission,
)

admin.site.register(Module)
admin.site.register(Lesson)
admin.site.register(Quiz)
admin.site.register(Question)
admin.site.register(Choice)
admin.site.register(QuizAttempt)
admin.site.register(Devoir)
admin.site.register(Submission)
admin.site.register(Enrollment)
admin.site.register(LessonProgress)
