from flask import Blueprint, jsonify
from db import get_db_connection
from course_catalog.service import get_course_details

catalog_bp = Blueprint("course_catalog", __name__, url_prefix="/api/courses")

@catalog_bp.route("/<int:course_id>", methods=["GET"])
def view_course_details(course_id):
    """GET /api/courses/<course_id> - Return course details and newest-first anonymous reviews."""
    conn = None
    try:
        conn = get_db_connection()
        details = get_course_details(conn, course_id)
        if details is None:
            return jsonify({"error": "Course not found"}), 404
        return jsonify(details), 200
    except Exception as exc:
        print(f"Database error in view_course_details: {exc}")
        return jsonify({"error": f"Failed to load course details"}), 500
    finally:
        if conn is not None:
            conn.close()