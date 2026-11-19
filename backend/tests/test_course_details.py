from datetime import datetime, timezone
from decimal import Decimal
import pytest
from app import create_app
from course_catalog.service import get_course_details


class FakeCursor:
    def __init__(self, course_row, review_rows):
        self.course_row = course_row
        self.review_rows = review_rows
        self.queries = []

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        return False

    def execute(self, sql, params=None):
        self.queries.append((sql, params))

    def fetchone(self):
        return self.course_row

    def fetchall(self):
        return self.review_rows


class FakeConnection:
    def __init__(self, course_row, review_rows):
        self._cursor = FakeCursor(course_row, review_rows)
        self.closed = False

    def cursor(self):
        return self._cursor

    def close(self):
        self.closed = True


def test_get_course_details_returns_schedule_and_anonymous_reviews_newest_first():
    course_row = {
        "id": 1,
        "code": "CS 1501",
        "title": "Algorithm Implementation",
        "department": "Computer Science",
        "professor": "Dr. Smith",
        "difficulty": Decimal("4.2"),
        "workload": Decimal("9.5"),
        "reviews": 2,
        "description": "Study algorithm design, implementation, and analysis.",
        "meeting_times": "Mon/Wed 1:00 PM - 2:15 PM",
    }
    # Simulated DB rows already ordered newest first (with extra PII keys to prove sanitization)
    review_rows = [
        {
            "id": 20,
            "rating": 5,
            "difficulty_rating": 4,
            "weekly_workload_hours": Decimal("9.0"),
            "written_feedback": "Newest review",
            "submitted_at": datetime(2026, 11, 16, 18, 0, tzinfo=timezone.utc),
            "student_name": "Should Never Leak",
            "student_id": "abc123",
        },
        {
            "id": 10,
            "rating": 4,
            "difficulty_rating": 4,
            "weekly_workload_hours": Decimal("10.0"),
            "written_feedback": "Older review",
            "submitted_at": datetime(2026, 11, 10, 14, 0, tzinfo=timezone.utc),
        },
    ]

    conn = FakeConnection(course_row, review_rows)
    result = get_course_details(conn, 1)

    assert result["professor"] == "Dr. Smith"
    assert result["description"] == "Study algorithm design, implementation, and analysis."
    assert result["meeting_times"] == "Mon/Wed 1:00 PM - 2:15 PM"
    assert result["difficulty"] == 4.2
    assert result["workload"] == 9.5
    assert len(result["reviews"]) == 2
    assert result["reviews"][0]["written_feedback"] == "Newest review"
    assert result["reviews"][1]["written_feedback"] == "Older review"

    # Verify FERPA compliance (Constraint C1): no identifying reviewer keys exist
    for review in result["reviews"]:
        assert "student_name" not in review
        assert "student_id" not in review
        assert "email" not in review

    # Verify SQL enforces newest-first ordering
    review_sql = conn._cursor.queries[1][0]
    assert "ORDER BY submitted_at DESC" in review_sql


def test_get_course_details_handles_zero_reviews():
    course_row = {
        "id": 6,
        "code": "PSY 0010",
        "title": "Introduction to Psychology",
        "department": "Psychology",
        "professor": "Dr. Brown",
        "difficulty": None,
        "workload": None,
        "reviews": 0,
        "description": "Survey major topics and methods in psychology.",
        "meeting_times": "Tue/Thu 1:00 PM - 2:15 PM",
    }
    conn = FakeConnection(course_row, [])
    result = get_course_details(conn, 6)

    assert result["reviews"] == []
    assert result["difficulty"] is None
    assert result["workload"] is None


def test_course_details_endpoint_returns_404_when_missing(monkeypatch):
    monkeypatch.setattr(
        "course_catalog.routes.get_db_connection",
        lambda: FakeConnection(None, []),
    )
    app = create_app()
    client = app.test_client()

    response = client.get("/api/courses/9999")
    assert response.status_code == 404
    assert response.get_json() == {"error": "Course not found"}