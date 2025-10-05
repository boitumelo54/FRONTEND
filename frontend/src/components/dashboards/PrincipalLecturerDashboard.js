"use client"

import { useState, useEffect } from "react"
import API from "../../api"

const PrincipalLecturerDashboard = () => {
  const [reports, setReports] = useState([])
  const [filteredReports, setFilteredReports] = useState([])
  const [selectedReport, setSelectedReport] = useState(null)
  const [feedback, setFeedback] = useState("")
  const [challenges, setChallenges] = useState([])
  const [moduleRatings, setModuleRatings] = useState([])
  const [loading, setLoading] = useState({
    reports: true,
    challenges: true,
    ratings: true,
  })
  
  // Filter states only
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("")
  const [programFilter, setProgramFilter] = useState("all")

  useEffect(() => {
    fetchReports()
    fetchChallenges()
    fetchModuleRatings()
  }, [])

  // Filter reports whenever filter criteria change
  useEffect(() => {
    filterReports()
  }, [reports, statusFilter, dateFilter, programFilter])

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

  // Filter reports based on filter criteria
  const filterReports = () => {
    let filtered = [...reports]

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(report => report.status === statusFilter)
    }

    // Date filter
    if (dateFilter) {
      filtered = filtered.filter(report => 
        report.date_of_lecture?.startsWith(dateFilter)
      )
    }

    // Program filter
    if (programFilter !== "all") {
      filtered = filtered.filter(report => report.program_code === programFilter)
    }

    setFilteredReports(filtered)
  }

  // Get unique programs for filter dropdown
  const getUniquePrograms = () => {
    const programs = [...new Set(reports.map(report => report.program_code).filter(Boolean))]
    return programs
  }

  // Export reports to CSV
  const exportReportsToCSV = () => {
    if (filteredReports.length === 0) {
      alert("No reports to export")
      return
    }

    const headers = [
      "Module Name",
      "Program",
      "Lecturer",
      "Date",
      "Week",
      "Attendance",
      "Venue",
      "Topic",
      "Learning Outcomes",
      "Recommendations",
      "Status",
      "Principal Feedback"
    ]

    const csvData = filteredReports.map(report => [
      report.module_name || "",
      `${report.program_name} (${report.program_code})` || "",
      report.lecturer_name || "",
      report.date_of_lecture ? new Date(report.date_of_lecture).toLocaleDateString() : "",
      report.week_of_reporting || "",
      `${report.actual_students_present}/${report.total_registered_students}`,
      report.venue || "",
      report.topic_taught || "",
      report.learning_outcomes || "",
      report.recommendations || "",
      report.status || "",
      report.principal_feedback || ""
    ])

    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.map(field => `"${field}"`).join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `lecture-reports-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Export reports to PDF (simplified version - in real app, you might use a library like jsPDF)
  const exportReportsToPDF = () => {
    if (filteredReports.length === 0) {
      alert("No reports to export")
      return
    }

    // Simple PDF export using window.print() for now
    // In a real application, you might want to use a library like jsPDF
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>Lecture Reports Export</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            .report { border: 1px solid #ddd; margin: 10px 0; padding: 15px; }
            .report-header { background: #f5f5f5; padding: 10px; margin: -15px -15px 15px -15px; }
          </style>
        </head>
        <body>
          <h1>Lecture Reports Export</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <p>Total Reports: ${filteredReports.length}</p>
          ${filteredReports.map(report => `
            <div class="report">
              <div class="report-header">
                <h2>${report.module_name || "N/A"} - ${report.program_name || "N/A"}</h2>
                <p><strong>Status:</strong> ${report.status || "N/A"}</p>
              </div>
              <p><strong>Lecturer:</strong> ${report.lecturer_name || "N/A"}</p>
              <p><strong>Date:</strong> ${report.date_of_lecture ? new Date(report.date_of_lecture).toLocaleDateString() : "N/A"}</p>
              <p><strong>Attendance:</strong> ${report.actual_students_present || 0}/${report.total_registered_students || 0}</p>
              <p><strong>Topic:</strong> ${report.topic_taught || "N/A"}</p>
              <p><strong>Learning Outcomes:</strong> ${report.learning_outcomes || "N/A"}</p>
              ${report.principal_feedback ? `<p><strong>Principal Feedback:</strong> ${report.principal_feedback}</p>` : ''}
            </div>
          `).join('')}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} style={{ color: '#ffc107', fontSize: '18px' }}>
            ★
          </span>
        ))}
        {hasHalfStar && <span style={{ color: '#ffc107', fontSize: '18px' }}>★</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} style={{ color: '#e0e0e0', fontSize: '18px' }}>
            ☆
          </span>
        ))}
        <span style={{ marginLeft: '8px', fontSize: '14px', color: '#666' }}>({rating})</span>
      </div>
    )
  }

  // Get challenges by status
  const pendingChallenges = challenges.filter((challenge) => challenge.status === "pending")
  const resolvedChallenges = challenges.filter((challenge) => challenge.status === "resolved")

  return (
    <div style={styles.dashboardContainer}>
      <div style={styles.dashboardHeader}>
        <h1 style={styles.headerTitle}>Principal Lecturer Dashboard</h1>
        <p style={styles.headerSubtitle}>Review lecture reports, monitor module ratings, and manage challenges</p>
      </div>

      <div style={styles.dashboardContent}>
        {/* Statistics Overview */}
        <div style={styles.statsOverview}>
          <div style={styles.statCard}>
            <h3 style={styles.statTitle}>Reports for Review</h3>
            <p style={styles.statNumber}>{reports.filter((r) => !r.principal_feedback).length}</p>
          </div>
          <div style={styles.statCard}>
            <h3 style={styles.statTitle}>Pending Challenges</h3>
            <p style={styles.statNumber}>{pendingChallenges.length}</p>
          </div>
          <div style={styles.statCard}>
            <h3 style={styles.statTitle}>Modules Rated</h3>
            <p style={styles.statNumber}>{moduleRatings.length}</p>
          </div>
        </div>

        {/* Module Ratings Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Module Ratings & Student Feedback</h2>
          {loading.ratings ? (
            <div style={styles.loading}>Loading ratings...</div>
          ) : moduleRatings.length === 0 ? (
            <div style={styles.noData}>
              <p>No module ratings available yet. Ratings will appear here once students submit their feedback.</p>
            </div>
          ) : (
            <div style={styles.ratingsGrid}>
              {moduleRatings.map((module) => {
                const avgRating = calculateAverageRating(module.ratings)
                return (
                  <div key={module.id} style={styles.ratingCard}>
                    <div style={styles.ratingHeader}>
                      <h3 style={styles.moduleName}>{module.module_name}</h3>
                      <div style={styles.moduleInfo}>
                        <span>
                          {module.program_name} ({module.program_code})
                        </span>
                      </div>
                      <div style={styles.overallRating}>
                        <strong>Average Rating:</strong>
                        {renderRatingStars(avgRating)}
                      </div>
                    </div>

                    <div style={styles.ratingDetails}>
                      <p>
                        <strong>Total Ratings:</strong> {module.ratings?.length || 0}
                      </p>

                      {module.ratings && module.ratings.length > 0 && (
                        <div style={styles.recentFeedback}>
                          <h4>Recent Student Feedback:</h4>
                          {module.ratings.slice(0, 5).map((rating, index) => (
                            <div key={rating.id || index} style={styles.feedbackItem}>
                              <div style={styles.feedbackRating}>
                                {renderRatingStars(rating.rating)}
                                <span style={styles.feedbackDate}>
                                  {new Date(rating.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              {rating.comments && <p style={styles.feedbackComment}>"{rating.comments}"</p>}
                              <p style={styles.feedbackAuthor}>- {rating.rated_by_name}</p>
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
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Current Challenges</h2>
          {loading.challenges ? (
            <div style={styles.loading}>Loading challenges...</div>
          ) : challenges.length === 0 ? (
            <div style={styles.noData}>
              <p>No challenges reported</p>
            </div>
          ) : (
            <div style={styles.challengesTabs}>
              <div style={styles.tabContent}>
                <h3 style={styles.subsectionTitle}>Pending Challenges ({pendingChallenges.length})</h3>
                {pendingChallenges.length === 0 ? (
                  <div style={styles.noData}>
                    <p>No pending challenges</p>
                  </div>
                ) : (
                  <div style={styles.challengesGrid}>
                    {pendingChallenges.map((challenge) => (
                      <div key={challenge.id} style={styles.challengeCardPending}>
                        <div style={styles.challengeHeader}>
                          <h3 style={styles.challengeType}>{challenge.challenge_type}</h3>
                          <span style={styles.statusBadgePending}>{challenge.status}</span>
                        </div>

                        <div style={styles.challengeDetails}>
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
                          <div style={styles.challengeDescription}>{challenge.description}</div>
                          <p>
                            <strong>Impact:</strong> {challenge.impact}
                          </p>
                          {challenge.proposed_solution && (
                            <p>
                              <strong>Proposed Solution:</strong> {challenge.proposed_solution}
                            </p>
                          )}
                        </div>

                        <div style={styles.challengeActions}>
                          <button
                            style={styles.btnResolve}
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
                            style={styles.btnSecondary}
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
                    <h3 style={styles.subsectionTitle}>Resolved Challenges ({resolvedChallenges.length})</h3>
                    <div style={styles.challengesGrid}>
                      {resolvedChallenges.slice(0, 3).map((challenge) => (
                        <div key={challenge.id} style={styles.challengeCardResolved}>
                          <div style={styles.challengeHeader}>
                            <h3 style={styles.challengeType}>{challenge.challenge_type}</h3>
                            <span style={styles.statusBadgeResolved}>Resolved</span>
                          </div>

                          <div style={styles.challengeDetails}>
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
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Lecture Reports for Review</h2>
            <div style={styles.exportActions}>
              <button 
                style={styles.btnExport} 
                onClick={exportReportsToCSV}
                disabled={filteredReports.length === 0}
              >
                Export to CSV
              </button>
              <button 
                style={styles.btnExport} 
                onClick={exportReportsToPDF}
                disabled={filteredReports.length === 0}
              >
                Export to PDF
              </button>
            </div>
          </div>

          {/* Filter Controls */}
          <div style={styles.filterControls}>
            <div style={styles.filterGroup}>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="completed">Completed</option>
              </select>

              <select 
                value={programFilter} 
                onChange={(e) => setProgramFilter(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="all">All Programs</option>
                {getUniquePrograms().map(program => (
                  <option key={program} value={program}>{program}</option>
                ))}
              </select>

              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                style={styles.dateFilter}
              />

              <button 
                style={styles.btnClear}
                onClick={() => {
                  setStatusFilter("all")
                  setDateFilter("")
                  setProgramFilter("all")
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div style={styles.resultsInfo}>
            <p>
              Showing {filteredReports.length} of {reports.length} reports
            </p>
          </div>

          {loading.reports ? (
            <div style={styles.loading}>Loading reports...</div>
          ) : filteredReports.length === 0 ? (
            <div style={styles.noData}>
              <p>No reports found matching your filter criteria</p>
            </div>
          ) : (
            <div style={styles.reportsGrid}>
              {filteredReports.map((report) => (
                <div key={report.id} style={styles.reportCard}>
                  <div style={styles.reportHeader}>
                    <h3 style={styles.reportModuleName}>{report.module_name}</h3>
                    <span style={getStatusBadgeStyle(report.status)}>{report.status}</span>
                  </div>

                  <div style={styles.reportDetails}>
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
                    <button style={styles.btnPrimary} onClick={() => setSelectedReport(report)}>
                      Add Feedback
                    </button>
                  ) : (
                    <div style={styles.feedbackSection}>
                      <h4>Your Feedback:</h4>
                      <p>{report.principal_feedback}</p>
                      <button style={styles.btnSecondary} onClick={() => setSelectedReport(report)}>
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
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
              <h2>Add Feedback for {selectedReport.module_name}</h2>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Your Feedback</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Enter your feedback for this lecture report..."
                  rows="6"
                  style={styles.textarea}
                />
              </div>
              <div style={styles.formActions}>
                <button
                  style={styles.btnCancel}
                  onClick={() => {
                    setSelectedReport(null)
                    setFeedback("")
                  }}
                >
                  Cancel
                </button>
                <button
                  style={styles.btnPrimary}
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

// Internal CSS Styles
const styles = {
  dashboardContainer: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  },
  dashboardHeader: {
    marginBottom: '30px',
    textAlign: 'center'
  },
  headerTitle: {
    color: '#2c3e50',
    marginBottom: '10px',
    fontSize: '2.5rem',
    fontWeight: 'bold'
  },
  headerSubtitle: {
    color: '#7f8c8d',
    fontSize: '1.1rem',
    margin: 0
  },
  dashboardContent: {
    maxWidth: '1200px',
    margin: '0 auto'
  },
  statsOverview: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '40px'
  },
  statCard: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    textAlign: 'center',
    borderTop: '4px solid #3498db'
  },
  statTitle: {
    color: '#7f8c8d',
    fontSize: '1rem',
    margin: '0 0 10px 0',
    fontWeight: 'normal'
  },
  statNumber: {
    color: '#2c3e50',
    fontSize: '2.5rem',
    margin: 0,
    fontWeight: 'bold'
  },
  section: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    marginBottom: '30px'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '15px'
  },
  sectionTitle: {
    color: '#2c3e50',
    margin: 0,
    fontSize: '1.5rem'
  },
  subsectionTitle: {
    color: '#34495e',
    marginBottom: '15px',
    fontSize: '1.2rem'
  },
  exportActions: {
    display: 'flex',
    gap: '10px'
  },
  btnExport: {
    padding: '10px 20px',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  filterControls: {
    marginBottom: '20px'
  },
  filterGroup: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  filterSelect: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px'
  },
  dateFilter: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px'
  },
  btnClear: {
    padding: '8px 16px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  resultsInfo: {
    marginBottom: '20px',
    color: '#7f8c8d',
    fontSize: '14px'
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#7f8c8d',
    fontSize: '16px'
  },
  noData: {
    textAlign: 'center',
    padding: '40px',
    color: '#7f8c8d',
    fontSize: '16px'
  },
  ratingsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px'
  },
  ratingCard: {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '20px',
    backgroundColor: '#fafafa'
  },
  ratingHeader: {
    marginBottom: '15px'
  },
  moduleName: {
    margin: '0 0 10px 0',
    color: '#2c3e50',
    fontSize: '1.2rem'
  },
  moduleInfo: {
    color: '#7f8c8d',
    fontSize: '14px',
    marginBottom: '10px'
  },
  overallRating: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px'
  },
  ratingDetails: {
    fontSize: '14px'
  },
  recentFeedback: {
    marginTop: '15px'
  },
  feedbackItem: {
    borderTop: '1px solid #eee',
    padding: '10px 0',
    fontSize: '13px'
  },
  feedbackRating: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '5px'
  },
  feedbackDate: {
    color: '#7f8c8d',
    fontSize: '12px'
  },
  feedbackComment: {
    margin: '5px 0',
    fontStyle: 'italic',
    color: '#555'
  },
  feedbackAuthor: {
    margin: 0,
    color: '#7f8c8d',
    fontSize: '12px'
  },
  challengesTabs: {
    marginTop: '20px'
  },
  tabContent: {
    marginTop: '15px'
  },
  challengesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  challengeCardPending: {
    border: '1px solid #e74c3c',
    borderRadius: '8px',
    padding: '20px',
    backgroundColor: '#fdf2f2'
  },
  challengeCardResolved: {
    border: '1px solid #27ae60',
    borderRadius: '8px',
    padding: '20px',
    backgroundColor: '#f2fdf2'
  },
  challengeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '15px'
  },
  challengeType: {
    margin: 0,
    color: '#2c3e50',
    fontSize: '1.1rem'
  },
  statusBadgePending: {
    backgroundColor: '#e74c3c',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  statusBadgeResolved: {
    backgroundColor: '#27ae60',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  challengeDetails: {
    fontSize: '14px',
    lineHeight: '1.5'
  },
  challengeDescription: {
    backgroundColor: 'white',
    padding: '10px',
    borderRadius: '5px',
    margin: '5px 0',
    border: '1px solid #eee'
  },
  challengeActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '15px'
  },
  btnResolve: {
    padding: '8px 16px',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  reportsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '20px'
  },
  reportCard: {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '20px',
    backgroundColor: 'white'
  },
  reportHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '15px'
  },
  reportModuleName: {
    margin: 0,
    color: '#2c3e50',
    fontSize: '1.1rem'
  },
  reportDetails: {
    fontSize: '14px',
    lineHeight: '1.5',
    marginBottom: '15px'
  },
  btnPrimary: {
    padding: '10px 20px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  btnSecondary: {
    padding: '8px 16px',
    backgroundColor: '#95a5a6',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  feedbackSection: {
    marginTop: '15px',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '5px'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '10px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '80vh',
    overflow: 'auto'
  },
  formGroup: {
    marginBottom: '20px'
  },
  formLabel: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  textarea: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px',
    resize: 'vertical',
    fontFamily: 'Arial, sans-serif'
  },
  formActions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end'
  },
  btnCancel: {
    padding: '10px 20px',
    backgroundColor: '#95a5a6',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px'
  }
}

// Helper function for status badge styles
const getStatusBadgeStyle = (status) => {
  const baseStyle = {
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold'
  }

  switch (status) {
    case 'pending':
      return { ...baseStyle, backgroundColor: '#f39c12', color: 'white' }
    case 'reviewed':
      return { ...baseStyle, backgroundColor: '#3498db', color: 'white' }
    case 'completed':
      return { ...baseStyle, backgroundColor: '#27ae60', color: 'white' }
    default:
      return { ...baseStyle, backgroundColor: '#95a5a6', color: 'white' }
  }
}

export default PrincipalLecturerDashboard