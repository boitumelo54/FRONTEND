"use client"

import { useState, useEffect } from "react"
import API from "../../api"
import "../styles/principal.css"

const PrincipalLecturerDashboard = () => {
  const [reports, setReports] = useState([])
  const [selectedReport, setSelectedReport] = useState(null)
  const [feedback, setFeedback] = useState("")
  const [challenges, setChallenges] = useState([])
  const [moduleRatings, setModuleRatings] = useState([])
  const [loading, setLoading] = useState({
    reports: true,
    challenges: true,
    ratings: true,
  })

  useEffect(() => {
    fetchReports()
    fetchChallenges()
    fetchModuleRatings()
  }, [])

  const fetchReports = async () => {
    try {
      const res = await API.get("/reports")
      setReports(res.data)
    } catch (error) {
      console.error("Error fetching reports:", error)
    } finally {
      setLoading((prev) => ({ ...prev, reports: false }))
    }
  }

  const fetchChallenges = async () => {
    try {
      const res = await API.get("/challenges")
      setChallenges(res.data)
    } catch (error) {
      console.error("Error fetching challenges:", error)
    } finally {
      setLoading((prev) => ({ ...prev, challenges: false }))
    }
  }

  const fetchModuleRatings = async () => {
    try {
      console.log("Fetching module ratings...")
      const res = await API.get("/ratings")
      console.log("Module ratings response:", res.data)

      // Transform the flat ratings array into grouped module data
      const transformedRatings = transformRatingsData(res.data)
      setModuleRatings(transformedRatings)
    } catch (error) {
      console.error("Error fetching module ratings:", error)
      setModuleRatings([])
    } finally {
      setLoading((prev) => ({ ...prev, ratings: false }))
    }
  }

  // Transform the ratings data from the API to group by module
  const transformRatingsData = (apiData) => {
    if (!apiData || apiData.length === 0) return []

    // Group ratings by module_id
    const modulesMap = {}

    apiData.forEach((rating) => {
      const moduleId = rating.module_id

      if (!modulesMap[moduleId]) {
        modulesMap[moduleId] = {
          id: moduleId,
          module_name: rating.module_name || `Module ${moduleId}`,
          program_name: rating.program_name || "Unknown Program",
          program_code: rating.program_code || "N/A",
          ratings: [],
        }
      }

      modulesMap[moduleId].ratings.push({
        id: rating.id,
        rating: rating.rating,
        comments: rating.comments,
        created_at: rating.created_at,
        rated_by_name: rating.rated_by_name || "Anonymous",
      })
    })

    return Object.values(modulesMap)
  }

  const submitFeedback = async (reportId) => {
    try {
      await API.put(`/reports/${reportId}/feedback`, {
        principal_feedback: feedback,
      })
      alert("Feedback submitted successfully!")
      setSelectedReport(null)
      setFeedback("")
      fetchReports()
    } catch (error) {
      console.error("Error submitting feedback:", error)
      alert("Failed to submit feedback")
    }
  }

  const updateChallengeStatus = async (challengeId, status, adminFeedback = "") => {
    try {
      await API.put(`/challenges/${challengeId}`, {
        status: status,
        admin_feedback: adminFeedback,
      })
      alert(`Challenge ${status} successfully!`)
      fetchChallenges()
    } catch (error) {
      console.error("Error updating challenge:", error)
      alert("Failed to update challenge")
    }
  }

  // Calculate average rating for a module
  const calculateAverageRating = (ratings) => {
    if (!ratings || ratings.length === 0) return 0
    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0)
    return (sum / ratings.length).toFixed(1)
  }

  // Get rating display with stars
  const renderRatingStars = (rating) => {
    const numericRating = Number.parseFloat(rating)
    const fullStars = Math.floor(numericRating)
    const hasHalfStar = numericRating % 1 >= 0.5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

    return (
      <div className="rating-stars">
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className="star full">
            ★
          </span>
        ))}
        {hasHalfStar && <span className="star half">★</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className="star empty">
            ☆
          </span>
        ))}
        <span className="rating-value">({rating})</span>
      </div>
    )
  }

  // Get challenges by status
  const pendingChallenges = challenges.filter((challenge) => challenge.status === "pending")
  const resolvedChallenges = challenges.filter((challenge) => challenge.status === "resolved")

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Principal Lecturer Dashboard</h1>
        <p>Review lecture reports, monitor module ratings, and manage challenges</p>
      </div>

      <div className="dashboard-content">
        {/* Statistics Overview */}
        <div className="stats-overview">
          <div className="stat-card">
            <h3>Reports for Review</h3>
            <p className="stat-number">{reports.filter((r) => !r.principal_feedback).length}</p>
          </div>
          <div className="stat-card">
            <h3>Pending Challenges</h3>
            <p className="stat-number">{pendingChallenges.length}</p>
          </div>
          <div className="stat-card">
            <h3>Modules Rated</h3>
            <p className="stat-number">{moduleRatings.length}</p>
          </div>
        </div>

        {/* Module Ratings Section */}
        <div className="module-ratings-section">
          <h2>Module Ratings & Student Feedback</h2>
          {loading.ratings ? (
            <div className="loading">Loading ratings...</div>
          ) : moduleRatings.length === 0 ? (
            <div className="no-data">
              <p>No module ratings available yet. Ratings will appear here once students submit their feedback.</p>
            </div>
          ) : (
            <div className="ratings-grid">
              {moduleRatings.map((module) => {
                const avgRating = calculateAverageRating(module.ratings)
                return (
                  <div key={module.id} className="rating-card">
                    <div className="rating-header">
                      <h3>{module.module_name}</h3>
                      <div className="module-info">
                        <span>
                          {module.program_name} ({module.program_code})
                        </span>
                      </div>
                      <div className="overall-rating">
                        <strong>Average Rating:</strong>
                        {renderRatingStars(avgRating)}
                      </div>
                    </div>

                    <div className="rating-details">
                      <p>
                        <strong>Total Ratings:</strong> {module.ratings?.length || 0}
                      </p>

                      {module.ratings && module.ratings.length > 0 && (
                        <div className="recent-feedback">
                          <h4>Recent Student Feedback:</h4>
                          {module.ratings.slice(0, 5).map((rating, index) => (
                            <div key={rating.id || index} className="feedback-item">
                              <div className="feedback-rating">
                                {renderRatingStars(rating.rating)}
                                <span className="feedback-date">
                                  {new Date(rating.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              {rating.comments && <p className="feedback-comment">"{rating.comments}"</p>}
                              <p className="feedback-author">- {rating.rated_by_name}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Challenges Section */}
        <div className="challenges-section">
          <h2>Current Challenges</h2>
          {loading.challenges ? (
            <div className="loading">Loading challenges...</div>
          ) : challenges.length === 0 ? (
            <div className="no-data">
              <p>No challenges reported</p>
            </div>
          ) : (
            <div className="challenges-tabs">
              <div className="tab-content">
                <h3>Pending Challenges ({pendingChallenges.length})</h3>
                {pendingChallenges.length === 0 ? (
                  <div className="no-data">
                    <p>No pending challenges</p>
                  </div>
                ) : (
                  <div className="challenges-grid">
                    {pendingChallenges.map((challenge) => (
                      <div key={challenge.id} className="challenge-card pending">
                        <div className="challenge-header">
                          <h3>{challenge.challenge_type}</h3>
                          <span className={`status-badge status-${challenge.status}`}>{challenge.status}</span>
                        </div>

                        <div className="challenge-details">
                          <p>
                            <strong>Module:</strong> {challenge.module_name}
                          </p>
                          <p>
                            <strong>Program:</strong> {challenge.program_name} ({challenge.program_code})
                          </p>
                          <p>
                            <strong>Reported By:</strong> {challenge.lecturer_name}
                          </p>
                          <p>
                            <strong>Date Reported:</strong> {new Date(challenge.submitted_date).toLocaleDateString()}
                          </p>
                          <p>
                            <strong>Description:</strong>
                          </p>
                          <div className="challenge-description">{challenge.description}</div>
                          <p>
                            <strong>Impact:</strong> {challenge.impact}
                          </p>
                          {challenge.proposed_solution && (
                            <p>
                              <strong>Proposed Solution:</strong> {challenge.proposed_solution}
                            </p>
                          )}
                        </div>

                        <div className="challenge-actions">
                          <button
                            className="btn-resolve"
                            onClick={() =>
                              updateChallengeStatus(
                                challenge.id,
                                "resolved",
                                "Challenge resolved by principal lecturer",
                              )
                            }
                          >
                            Mark as Resolved
                          </button>
                          <button
                            className="btn-secondary"
                            onClick={() =>
                              updateChallengeStatus(challenge.id, "in_progress", "Under review by principal lecturer")
                            }
                          >
                            Mark In Progress
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {resolvedChallenges.length > 0 && (
                  <>
                    <h3>Resolved Challenges ({resolvedChallenges.length})</h3>
                    <div className="challenges-grid">
                      {resolvedChallenges.slice(0, 3).map((challenge) => (
                        <div key={challenge.id} className="challenge-card resolved">
                          <div className="challenge-header">
                            <h3>{challenge.challenge_type}</h3>
                            <span className="status-badge status-resolved">Resolved</span>
                          </div>

                          <div className="challenge-details">
                            <p>
                              <strong>Module:</strong> {challenge.module_name}
                            </p>
                            <p>
                              <strong>Reported By:</strong> {challenge.lecturer_name}
                            </p>
                            <p>
                              <strong>Resolved On:</strong> {new Date(challenge.resolved_date).toLocaleDateString()}
                            </p>
                            {challenge.admin_feedback && (
                              <p>
                                <strong>Admin Feedback:</strong> {challenge.admin_feedback}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Reports Section */}
        <div className="reports-section">
          <h2>Lecture Reports for Review</h2>
          {loading.reports ? (
            <div className="loading">Loading reports...</div>
          ) : reports.length === 0 ? (
            <div className="no-data">
              <p>No reports available for review</p>
            </div>
          ) : (
            <div className="reports-grid">
              {reports.map((report) => (
                <div key={report.id} className="report-card">
                  <div className="report-header">
                    <h3>{report.module_name}</h3>
                    <span className={`status-badge status-${report.status}`}>{report.status}</span>
                  </div>

                  <div className="report-details">
                    <p>
                      <strong>Program:</strong> {report.program_name} ({report.program_code})
                    </p>
                    <p>
                      <strong>Lecturer:</strong> {report.lecturer_name}
                    </p>
                    <p>
                      <strong>Date:</strong> {new Date(report.date_of_lecture).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Week:</strong> {report.week_of_reporting}
                    </p>
                    <p>
                      <strong>Attendance:</strong> {report.actual_students_present}/{report.total_registered_students}
                    </p>
                    <p>
                      <strong>Venue:</strong> {report.venue}
                    </p>
                    <p>
                      <strong>Topic:</strong> {report.topic_taught}
                    </p>
                    <p>
                      <strong>Learning Outcomes:</strong> {report.learning_outcomes}
                    </p>
                    <p>
                      <strong>Recommendations:</strong> {report.recommendations}
                    </p>
                  </div>

                  {!report.principal_feedback ? (
                    <button className="btn-primary" onClick={() => setSelectedReport(report)}>
                      Add Feedback
                    </button>
                  ) : (
                    <div className="feedback-section">
                      <h4>Your Feedback:</h4>
                      <p>{report.principal_feedback}</p>
                      <button className="btn-secondary" onClick={() => setSelectedReport(report)}>
                        Update Feedback
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Feedback Modal */}
        {selectedReport && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Add Feedback for {selectedReport.module_name}</h2>
              <div className="form-group">
                <label>Your Feedback</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Enter your feedback for this lecture report..."
                  rows="6"
                />
              </div>
              <div className="form-actions">
                <button
                  className="btn-cancel"
                  onClick={() => {
                    setSelectedReport(null)
                    setFeedback("")
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn-primary"
                  onClick={() => submitFeedback(selectedReport.id)}
                  disabled={!feedback.trim()}
                >
                  Submit Feedback
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PrincipalLecturerDashboard
