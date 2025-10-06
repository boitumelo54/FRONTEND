"use client"

import { useState, useEffect } from "react"
import API from "../../api"
import "../styles/principal.css"
import * as XLSX from "xlsx"

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
  const [searchReports, setSearchReports] = useState("")
  const [searchChallenges, setSearchChallenges] = useState("")

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

  const exportReportsToExcel = () => {
    if (reports.length === 0) {
      alert("No reports to export")
      return
    }

    const exportData = reports.map((report) => ({
      Module: report.module_name,
      Program: report.program_name,
      "Program Code": report.program_code,
      Lecturer: report.lecturer_name,
      Date: new Date(report.date_of_lecture).toLocaleDateString(),
      Week: report.week_of_reporting,
      Attendance: `${report.actual_students_present}/${report.total_registered_students}`,
      Venue: report.venue,
      Topic: report.topic_taught,
      "Learning Outcomes": report.learning_outcomes,
      Recommendations: report.recommendations,
      "Principal Feedback": report.principal_feedback || "No feedback yet",
      Status: report.status,
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reports")
    XLSX.writeFile(workbook, `Principal_Reports_${new Date().toISOString().split("T")[0]}.xlsx`)
  }

  const exportChallengesToExcel = () => {
    if (challenges.length === 0) {
      alert("No challenges to export")
      return
    }

    const exportData = challenges.map((challenge) => ({
      Module: challenge.module_name,
      Program: challenge.program_name,
      "Program Code": challenge.program_code,
      Type: challenge.challenge_type,
      Lecturer: challenge.lecturer_name,
      Description: challenge.description,
      Impact: challenge.impact,
      "Proposed Solution": challenge.proposed_solution || "N/A",
      Status: challenge.status,
      Submitted: new Date(challenge.submitted_date).toLocaleDateString(),
      "Admin Feedback": challenge.admin_feedback || "No feedback yet",
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Challenges")
    XLSX.writeFile(workbook, `Principal_Challenges_${new Date().toISOString().split("T")[0]}.xlsx`)
  }

  const filteredReports = reports.filter(
    (report) =>
      report.module_name?.toLowerCase().includes(searchReports.toLowerCase()) ||
      report.program_name?.toLowerCase().includes(searchReports.toLowerCase()) ||
      report.lecturer_name?.toLowerCase().includes(searchReports.toLowerCase()) ||
      report.topic_taught?.toLowerCase().includes(searchReports.toLowerCase()),
  )

  const filteredChallenges = challenges.filter(
    (challenge) =>
      challenge.module_name?.toLowerCase().includes(searchChallenges.toLowerCase()) ||
      challenge.program_name?.toLowerCase().includes(searchChallenges.toLowerCase()) ||
      challenge.lecturer_name?.toLowerCase().includes(searchChallenges.toLowerCase()) ||
      challenge.challenge_type?.toLowerCase().includes(searchChallenges.toLowerCase()) ||
      challenge.description?.toLowerCase().includes(searchChallenges.toLowerCase()),
  )

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
          <div className="section-header">
            <h2>Current Challenges</h2>
            <div className="header-actions">
              <input
                type="text"
                placeholder="Search challenges..."
                value={searchChallenges}
                onChange={(e) => setSearchChallenges(e.target.value)}
                className="search-input"
              />
              <button onClick={exportChallengesToExcel} className="btn-export" disabled={challenges.length === 0}>
                📥 Export to Excel
              </button>
            </div>
          </div>
          {loading.challenges ? (
            <div className="loading">Loading challenges...</div>
          ) : filteredChallenges.length === 0 ? (
            <div className="no-data">
              <p>{searchChallenges ? "No challenges match your search." : "No challenges reported"}</p>
            </div>
          ) : (
            <div className="challenges-tabs">
              <div className="tab-content">
                <h3>Pending Challenges ({filteredChallenges.filter((c) => c.status === "pending").length})</h3>
                {filteredChallenges.filter((c) => c.status === "pending").length === 0 ? (
                  <div className="no-data">
                    <p>No pending challenges</p>
                  </div>
                ) : (
                  <div className="challenges-grid">
                    {filteredChallenges
                      .filter((c) => c.status === "pending")
                      .map((challenge) => (
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

                {filteredChallenges.filter((c) => c.status === "resolved").length > 0 && (
                  <>
                    <h3>Resolved Challenges ({filteredChallenges.filter((c) => c.status === "resolved").length})</h3>
                    <div className="challenges-grid">
                      {filteredChallenges
                        .filter((c) => c.status === "resolved")
                        .slice(0, 3)
                        .map((challenge) => (
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
          <div className="section-header">
            <h2>Lecture Reports for Review</h2>
            <div className="header-actions">
              <input
                type="text"
                placeholder="Search reports..."
                value={searchReports}
                onChange={(e) => setSearchReports(e.target.value)}
                className="search-input"
              />
              <button onClick={exportReportsToExcel} className="btn-export" disabled={reports.length === 0}>
                📥 Export to Excel
              </button>
            </div>
          </div>
          {loading.reports ? (
            <div className="loading">Loading reports...</div>
          ) : filteredReports.length === 0 ? (
            <div className="no-data">
              <p>{searchReports ? "No reports match your search." : "No reports available for review"}</p>
            </div>
          ) : (
            <div className="reports-grid">
              {filteredReports.map((report) => (
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
