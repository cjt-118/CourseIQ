from datetime import datetime
from decimal import Decimal

ALLOWED_REVIEW_FIELDS = {
    "id",
    "rating",
    "difficulty_rating",
    "weekly_workload_hours",
    "written_feedback",
    "submitted_at",
}


def _to_float_or_none(value):
    if value is None:
        return None

    if isinstance(value, Decimal):
        return float(value)

    return float(value)


def sanitize_review(row):
    """Strip any identifying fields (Constraint C! / FERPA) and format types for JSON."""
    submitted_at = row.get("submitted_at")
    if isinstance(submitted_at, datetime):
        submitted_at = submitted_at.isoformat()

    return {
        "id": row["id"],
        "rating": int(row["rating"]),
        "difficulty_rating": int(row["difficulty_rating"]),
        "weekly_workload_hours": _to_float_or_none(row["weekly_workload_hours"]),
        "written_feedback": row["written_feedback"],
        "submitted_at": submitted_at,
    }


def get_course_details(conn, course_id):
    """
    Course Catalog Subsystem (ICatalogService):
    Implements AOM operations getClassDetails(), getSchedule(), and getReviews() for US6 / FR1.
    """

    with conn.cursor() as cur:
        # 1. Fetch course details, professor, description, and scheduled meeting times
        cur.execute(
            """
            SELECT id, code, title, department, professor, difficulty, workload, reviews, description, meeting_times
            FROM public.courses
            WHERE id = %s
            """,
            (course_id,),
        )
        course = cur.fetchone()
        if course is None:
            return None

        # 2. Fetch anonymous written reviews sorted newest first (US6, C1)
        # Explicitly select only non-identifying columns (never reviewer name/email/student_id)
        cur.execute(
            """
            SELECT id, rating, difficulty_rating, weekly_workload_hours, written_feedback, submitted_at
            FROM public.course_reviews
            WhERE course_id = %s
            ORDER BY submitted_at DESC, id DESC
            """,
            (course_id,),
        )
        review_rows = cur.fetchall()

    reviews = [sanitize_review(r) for r in review_rows]

    return {
        "id": course["id"],
        "code": course["code"],
        "title": course["title"],
        "department": course["department"],
        "professor": course["professor"],
        "description": course["description"] or "No course description available.",
        "meeting_times": course["meeting_times"] or "Schedule TBA",
        "difficulty": _to_float_or_none(course["difficulty"]),
        "workload": _to_float_or_none(course["workload"]),
        "review_count": max(int(course["reviews"] or 0), len(reviews)),
        "reviews": reviews,
    }
