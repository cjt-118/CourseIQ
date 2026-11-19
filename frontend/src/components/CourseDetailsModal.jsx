import React, { useEffect, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function formatReviewData(isoString) {
    if (!isoString) return 'Recently';
    const parsed = newDate(isoString);
    if (Number.isNaN(parsed.getTime())) return 'Recently';
    return parsed.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export default function CourseDetailsModal({ course, onClose }) {
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showReviewNotice, setShowReviewNotice] = useState(false);

    useEffect(() => {
        let ignore = false;
        setLoading(true);
        setError(null);
        setShowReviewNotice(false);

        async function fetchDetails() {
            try {
                const response = await fetch(`${API_BASE_URL}/api/courses/${course.id}`);
                if (!response.ok) {
                    throw new Error(`Server returned ${response.status}`);
                }
                const data = await response.json();
                if (!ignore) {
                    setDetails(data);
                }
            } catch (err) {
                if (!ignore) {
                    setError('Unablel to load live course details from the backend API.');
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        }

        fetchDetails();
        return () => {
            ignore = true;
        };
    }, [course.id]);

    // Close modal on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === `Escape`) onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const active = details || course;
    const reviews = details?.reviews ?? []

    return (
        <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <section className="modal course-details-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
                <button className="close" onClick={onClose} aria-label="Close details">x</button>
                <span className="course-code">{active.code}</span>
                <h2 id="modal-title">{active.title}</h2>
                <p className="professor">{active.professor} · {active.department}</p>

                <div className="schedule-row">
                    <span className="schedule-label">Scheduled Meeting Times</span>
                    <strong>{details?.meeting_times || 'Loading schedule...'}</strong>
                </div>

                <p className="course-description">{active.description}</p>

                <div className="modal-stats">
                    <div>
                        <strong>{active.difficulty === null || active.difficulty === undefined ? 'Not enough data' : `${Number(active.difficulty).toFixed(1)} / 5`}</strong>
                        <span>Average difficulty</span>
                    </div>
                    <div>
                        <strong>{active.workload === null || active.workload == undefined ? 'Not enough data' : `${Number(active.workload).toFixed(1)} hours`}</strong>
                        <span>Weekly workload</span>
                    </div>
                    <div>
                        <strong>{details?.review_count ?? active.reviews ?? 0}</strong>
                        <span>Reviews</span>
                    </div>
                </div>

                <div className="reviews-section">
                    <div className="reviews-header">
                        <h3>Student Reviews</h3>
                        <span className="anonymity-badge">Anonymous · Newest first</span>
                    </div>

                    {loading && <p className="reviews-status">Loading course details and reviews...</p>}

                    {!loading && error && (<p className="reviews-error" role="alert">{error}</p>)}

                    {!loading && !error && reveiws.length === 0 && (
                        <div className="reviews-empty">
                            <p>No reviews yet</p>
                            <a href={`#write-review-${active.id}`} className="write-review-link" onClick={(e) => { e.preventDefault(); setShowReviewNotice(true); }}>Write a review →</a>
                            {showReviewNotice && (
                                <p className="coming-soon">Review submission (FR2) will be connected in the next sprint.</p>)}
                        </div>
                    )}

                    {!loading && !error && reviews.length > 0 && (
                        <ul className="review-list">
                            {reviews.map((review) => (
                                <li className="review-item" key={review.id}>
                                    <div className="review-meta">
                                        <span className="review-badge">Rating: {review.rating}/5</span>
                                        <span className="review-badge">Difficulty: {review.difficulty_rating}/5</span>
                                        <span className="review-badge">
                                            Workload: {Number(review.weekly_workload_hours).toFixed(1)}h/wk
                                        </span>
                                        <time className="review-date" dateTime={review.submitted_at}>
                                            {formatReviewDate(review.submitted_at)}
                                        </time>
                                    </div>
                                    <p className="review-feedback">{review.written_feedback}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </section>
        </div>
    );
}