"use client"

// Updated StudentDashboard.js
import { useState, useEffect } from "react"
import API from "../../api"
import "../styles/dashboards.css"

const StudentDashboard = () => {
  const [reports, setReports] = useState([])
  const [modules, setModules] = useState([])
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("modules")
  const [error, setError] = useState("")
  const [studentInfo, setStudentInfo] = useState({})
  const [hasProgram, setHasProgram] = useState(true)
  const [signingReport, setSigningReport] = useState(null)
  const [attendanceSignature, setAttendanceSignature] = useState({
    student_name: "",
    student_number: "",
  })
  const [newChallenge, setNewChallenge] = useState({
    module_id: "",
    title: "",
    description: "",
    priority: "medium",
  })

  useEffect(() => {
    fetchStudentData()
    fetchDebugInfo() // Temporary for debugging
  }, [])

  const fetchDebugInfo = async () => {
    try {
      const res = await API.get("/debug/student-info")
      console.log("🔍 Debug info:", res.data)
      setStudentInfo(res.data)
    } catch (error) {
      console.error("Debug info error:", error)
    }
  }

  const fetchStudentData = async () => {
    try {
      setLoading(true)
      setError("")
      await Promise.all([fetchReports(), fetchStudentModules(), fetchChallenges()])
    } catch (error) {
      console.error("Error fetching student data:", error)
      setError("Failed to load dashboard data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const fetchReports = async () => {
    try {
      const res = await API.get("/reports")
      setReports(res.data)
    } catch (error) {
      console.error("Error fetching reports:", error)
    }
  }

  const fetchStudentModules = async () => {
    try {
      console.log("Fetching student modules...")
      const res = await API.get("/student/modules")
      console.log("Student modules response:", res.data)

      if (res.data.modules) {
        setModules(res.data.modules)
        setHasProgram(res.data.hasProgram)

        if (!res.data.hasProgram) {
          setError(res.data.message)
        }
      } else {
        // Handle old response format
        setModules(res.data)
        setHasProgram(res.data.length > 0)
      }
    } catch (error) {
      console.error("Error fetching student modules:", error)
      if (error.response?.status === 400) {
        setError("You are not enrolled in any program. Please contact your program leader.")
        setHasProgram(false)
      } else {
        setError("Failed to load modules. Please try again later.")
      }
    }
  }

  const fetchChallenges = async () => {
    try {
      const res = await API.get("/student/challenges")
      setChallenges(res.data)
    } catch (error) {
      console.error("Error fetching challenges:", error)
    }
  }

  const submitModuleRating = async (moduleId, rating, comments = "") => {
    try {
      await API.post("/module-ratings", {
        module_id: moduleId,
        rating,
        comments,
      })
      alert("Module rating submitted successfully!")

      // Refresh modules to show updated ratings
      fetchStudentModules()
    } catch (error) {
      console.error("Error submitting module rating:", error)
      alert("Failed to submit module rating")
    }
  }

  const submitChallenge = async (e) => {
    e.preventDefault()
    try {
      await API.post("/student/challenges", newChallenge)
      alert("Challenge submitted successfully!")
      setNewChallenge({
        module_id: "",
        title: "",
        description: "",
        priority: "medium",
      })
      fetchChallenges()
    } catch (error) {
      console.error("Error submitting challenge:", error)
      alert("Failed to submit challenge")
    }
  }

  const updateChallengeStatus = async (challengeId, status) => {
    try {
      await API.put(`/student/challenges/${challengeId}`, { status })
      fetchChallenges()
    } catch (error) {
      console.error("Error updating challenge:", error)
      alert("Failed to update challenge status")
    }
  }

  const signAttendance = async (reportId) => {
    try {
      if (!attendanceSignature.student_name || !attendanceSignature.student_number) {
        alert("Please enter both your name and student number")
        return
      }

      await API.put(`/reports/${reportId}/sign-attendance`, {
        student_name: attendanceSignature.student_name,
        student_number: attendanceSignature.student_number,
      })

      alert("Attendance signed successfully!")
      setSigningReport(null)
      setAttendanceSignature({ student_name: "", student_number: "" })
      fetchReports()
    } catch (error) {
      console.error("Error signing attendance:", error)
      alert("Failed to sign attendance")
    }
  }

  if (loading) return <div className="dashboard-loading">Loading your dashboard...</div>

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Student Dashboard</h1>
        <p>View your modules, monitor lecture reports, submit challenges and provide ratings</p>
      </div>

      {/* Debug info - remove this section after testing */}
      {process.env.NODE_ENV === "development" && studentInfo.user && (
        <div
          style={{
            background: "#f3f4f6",
            padding: "10px",
            borderRadius: "8px",
            marginBottom: "20px",
            fontSize: "14px",
          }}
        >
          <strong>Debug Info:</strong> User ID: {studentInfo.user.id}, Role: {studentInfo.user.role}, Program ID:{" "}
          {studentInfo.database_user?.program_id || "None"}, Program:{" "}
          {studentInfo.database_user?.program_name || "Not assigned"}
        </div>
      )}

      {error && (
        <div className="error-banner">
          <div className="error-content">
            <span>⚠️</span>
            <div>
              <strong>Notice:</strong> {error}
              <button onClick={fetchStudentData} className="retry-btn">
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === "modules" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("modules")}
        >
          📚 My Modules
        </button>
        <button
          className={`tab-button ${activeTab === "reports" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("reports")}
        >
          📊 Lecture Reports
        </button>
        <button
          className={`tab-button ${activeTab === "challenges" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("challenges")}
        >
          🎯 My Challenges
        </button>
      </div>

      <div className="dashboard-content">
        {/* My Modules Tab */}
        {activeTab === "modules" && (
          <div className="tab-content">
            <div className="section-header">
              <h2>My Enrolled Modules</h2>
              <p className="section-subtitle">
                {hasProgram
                  ? "These are the modules under your program"
                  : "You need to be enrolled in a program to see modules"}
              </p>
            </div>

            {!hasProgram ? (
              <div className="empty-state">
                <div className="no-program-message">
                  <h3>📝 Program Enrollment Required</h3>
                  <p>You are not currently enrolled in any academic program.</p>
                  <p>Please contact your program leader or administrator to:</p>
                  <ul>
                    <li>Assign you to a program</li>
                    <li>Enroll you in the appropriate modules</li>
                  </ul>
                </div>
              </div>
            ) : modules.length === 0 ? (
              <div className="empty-state">
                <p>No modules found for your program. Please contact your program leader.</p>
              </div>
            ) : (
              <div className="modules-grid">
                {modules.map((module) => (
                  <div key={module.id} className="module-card">
                    <div className="module-header">
                      <h3>{module.module_name}</h3>
                      <span className="module-code">{module.program_code}</span>
                    </div>

                    <div className="module-details">
                      <p>
                        <strong>Program:</strong> {module.program_name}
                      </p>
                      <p>
                        <strong>Faculty:</strong> {module.faculty_name}
                      </p>
                      <p>
                        <strong>Total Students:</strong> {module.total_registered_students}
                      </p>
                      {module.created_at && (
                        <p>
                          <strong>Created:</strong> {new Date(module.created_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <div className="module-rating-section">
                      <h4>Rate this Module:</h4>
                      <div className="rating-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            className="star-btn"
                            onClick={() => submitModuleRating(module.id, star)}
                            title={`Rate ${star} star${star > 1 ? "s" : ""}`}
                          >
                            ⭐
                          </button>
                        ))}
                      </div>
                      <small>Click a star to rate this module</small>
                    </div>

                    <div className="module-actions">
                      <button className="btn-outline" onClick={() => setActiveTab("reports")}>
                        View Reports
                      </button>
                      <button className="btn-primary" onClick={() => setActiveTab("challenges")}>
                        Report Challenge
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Lecture Reports Tab */}
        {activeTab === "reports" && (
          <div className="tab-content">
            <div className="section-header">
              <h2>Lecture Reports</h2>
              <p className="section-subtitle">Monitor lecture reports and provide ratings</p>
            </div>

            {reports.length === 0 ? (
              <div className="empty-state">
                <p>No lecture reports found. Reports will appear here once submitted by lecturers.</p>
              </div>
            ) : (
              <div className="reports-grid">
                {reports.map((report) => (
                  <div key={report.id} className="report-card">
                    <div className="report-header">
                      <h3>
                        {report.course_name || report.module_name} ({report.course_code || report.program_code})
                      </h3>
                      <span className={`status-badge status-${report.status}`}>{report.status}</span>
                    </div>

                    <div className="report-details">
                      <p>
                        <strong>Lecturer:</strong> {report.lecturer_name}
                      </p>
                      <p>
                        <strong>Module:</strong> {report.module_name}
                      </p>
                      <p>
                        <strong>Program:</strong> {report.program_name}
                      </p>
                      <p>
                        <strong>Date:</strong> {new Date(report.date_of_lecture).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Attendance:</strong> {report.actual_students_present}/{report.total_registered_students}
                      </p>
                      <p>
                        <strong>Topic:</strong> {report.topic_taught}
                      </p>
                      <p>
                        <strong>Venue:</strong> {report.venue}
                      </p>
                      <p>
                        <strong>Week:</strong> {report.week_of_reporting}
                      </p>
                    </div>

                    {report.learning_outcomes && (
                      <div className="learning-outcomes">
                        <strong>Learning Outcomes:</strong>
                        <p>{report.learning_outcomes}</p>
                      </div>
                    )}

                    {report.recommendations && (
                      <div className="recommendations">
                        <strong>Recommendations:</strong>
                        <p>{report.recommendations}</p>
                      </div>
                    )}

                    {/* Students should not see principal feedback */}

                    <div className="report-actions">
                      {report.student_name && report.student_number ? (
                        <div className="attendance-signed">
                          <span className="signed-badge">✓ Attendance Signed</span>
                          <p>
                            <small>
                              Signed by: {report.student_name} ({report.student_number})
                            </small>
                          </p>
                        </div>
                      ) : (
                        <button className="btn-primary" onClick={() => setSigningReport(report)}>
                          Sign Attendance
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Challenges Tab */}
        {activeTab === "challenges" && (
          <div className="tab-content">
            <div className="challenges-section">
              <div className="section-header">
                <h2>My Learning Challenges</h2>
                <p className="section-subtitle">
                  Report challenges you're facing in your modules and track their status
                </p>
              </div>

              {/* Submit Challenge Form */}
              <div className="challenge-form-section">
                <h3>Report New Challenge</h3>
                <form onSubmit={submitChallenge} className="challenge-form">
                  <div className="form-group">
                    <label htmlFor="module">Module:</label>
                    <select
                      id="module"
                      value={newChallenge.module_id}
                      onChange={(e) => setNewChallenge({ ...newChallenge, module_id: e.target.value })}
                      required
                    >
                      <option value="">Select a module</option>
                      {modules.map((module) => (
                        <option key={module.id} value={module.id}>
                          {module.module_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="title">Challenge Title:</label>
                    <input
                      type="text"
                      id="title"
                      value={newChallenge.title}
                      onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })}
                      placeholder="Brief title of your challenge"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="description">Description:</label>
                    <textarea
                      id="description"
                      value={newChallenge.description}
                      onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
                      placeholder="Describe the challenge you're facing in detail..."
                      rows="4"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="priority">Priority:</label>
                    <select
                      id="priority"
                      value={newChallenge.priority}
                      onChange={(e) => setNewChallenge({ ...newChallenge, priority: e.target.value })}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <button type="submit" className="btn-primary">
                    Submit Challenge
                  </button>
                </form>
              </div>

              {/* Challenges List */}
              <div className="challenges-list">
                <h3>My Submitted Challenges</h3>
                {challenges.length === 0 ? (
                  <div className="empty-state">
                    <p>No challenges submitted yet. Use the form above to report your first challenge.</p>
                  </div>
                ) : (
                  <div className="challenges-grid">
                    {challenges.map((challenge) => (
                      <div key={challenge.id} className={`challenge-card priority-${challenge.priority}`}>
                        <div className="challenge-header">
                          <h4>{challenge.title}</h4>
                          <span className={`priority-badge priority-${challenge.priority}`}>{challenge.priority}</span>
                        </div>

                        <div className="challenge-details">
                          <p>
                            <strong>Module:</strong> {challenge.module_name}
                          </p>
                          <p>
                            <strong>Description:</strong> {challenge.description}
                          </p>
                          <p>
                            <strong>Submitted:</strong> {new Date(challenge.created_at).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="challenge-status">
                          <span className={`status-badge status-${challenge.status}`}>{challenge.status}</span>
                          {challenge.status === "pending" && (
                            <button
                              className="btn-outline btn-small"
                              onClick={() => updateChallengeStatus(challenge.id, "resolved")}
                            >
                              Mark as Resolved
                            </button>
                          )}
                        </div>

                        {challenge.feedback && (
                          <div className="challenge-feedback">
                            <strong>Instructor Feedback:</strong>
                            <p>{challenge.feedback}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {signingReport && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Sign Attendance</h2>
            <p>
              Confirm your attendance for: <strong>{signingReport.module_name}</strong>
            </p>
            <p>Date: {new Date(signingReport.date_of_lecture).toLocaleDateString()}</p>

            <div className="form-group">
              <label>Your Full Name *</label>
              <input
                type="text"
                value={attendanceSignature.student_name}
                onChange={(e) =>
                  setAttendanceSignature({
                    ...attendanceSignature,
                    student_name: e.target.value,
                  })
                }
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label>Student Number *</label>
              <input
                type="text"
                value={attendanceSignature.student_number}
                onChange={(e) =>
                  setAttendanceSignature({
                    ...attendanceSignature,
                    student_number: e.target.value,
                  })
                }
                placeholder="Enter your student number"
                required
              />
            </div>

            <div className="form-actions">
              <button
                className="btn-cancel"
                onClick={() => {
                  setSigningReport(null)
                  setAttendanceSignature({ student_name: "", student_number: "" })
                }}
              >
                Cancel
              </button>
              <button className="btn-primary" onClick={() => signAttendance(signingReport.id)}>
                Confirm Attendance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentDashboard
