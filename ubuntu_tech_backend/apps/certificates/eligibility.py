from apps.courses.models import LessonProgress, Module


def is_eligible_for_certificate(user):
    """
    Un apprenant est éligible si toutes les leçons de tous les modules publiés
    ont été marquées comme terminées.
    """
    published_modules = Module.objects.filter(is_published=True)
    for module in published_modules:
        lesson_ids = list(module.lessons.values_list("id", flat=True))
        if not lesson_ids:
            continue
        completed_count = LessonProgress.objects.filter(
            user=user, lesson_id__in=lesson_ids,
        ).values("lesson_id").distinct().count()
        if completed_count < len(lesson_ids):
            return False
    return True