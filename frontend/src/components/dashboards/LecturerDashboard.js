"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import API from "../../api"
import "../styles/lecture.css"


const LecturerDashboard = () => {
  const [reports, setReports] = useState([])
  const [assignments, setAssignments] = useState([])
  const [challenges, setChallenges] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [showChallengeForm, setShowChallengeForm] = useState(false)
  const [formData, setFormData] = useState({
    faculty_id: "",
    module_id: "",
    program_id: "",
    week_of_reporting: "",
    date_of_lecture: "",
    student_name: "",
    student_number: "",
    actual_students_present: "",
    total_registered_students: "",
    venue: "",
    scheduled_time: "",
    topic_taught: "",
    learning_outcomes: "",
    recommendations: "",
  })
  const [challengeFormData, setChallengeFormData] = useState({
    module_id: "",
    program_id: "",
    faculty_id: "",
    challenge_type: "",
    description: "",
    impact: "",
    proposed_solution: "",
    status: "pending",
  })
  const [faculties, setFaculties] = useState([])
  const [programs, setPrograms] = useState([])
  const { user } = useAuth()

  useEffect(() => {
    fetchAssignments()
    fetchReports()
    fetchFaculties()
    fetchChallenges()
  }, [])

  const fetchAssignments = async () => {
    try {
      const res = await API.get("/lecture-assignments")
      const myAssignments = res.data.filter((assignment) => assignment.lecturer_id === user.id)
      setAssignments(myAssignments)

      if (myAssignments.length > 0) {
        const firstAssignment = myAssignments[0]
        setFormData((prev) => ({
          ...prev,
          faculty_id: firstAssignment.faculty_id || "",
          module_id: firstAssignment.module_id,
          program_id: firstAssignment.program_id,
        }))

        setChallengeFormData((prev) => ({
          ...prev,
          faculty_id: firstAssignment.faculty_id || "",
          module_id: firstAssignment.module_id,
          program_id: firstAssignment.program_id,
        }))

        if (firstAssignment.faculty_id) {
          fetchProgramsByFaculty(firstAssignment.faculty_id)
        }
      }
    } catch (error) {
      console.error("Error fetching assignments:", error)
    }
  }

  const fetchReports = async () => {
    try {
      const res = await API.get("/reports")
      const myReports = res.data.filter((report) => report.lecturer_id === user.id)
      setReports(myReports)
    } catch (error) {
      console.error("Error fetching reports:", error)
    }
  }

  const fetchChallenges = async () => {
    try {
      const res = await API.get("/challenges")
      const myChallenges = res.data.filter((challenge) => challenge.lecturer_id === user.id)
      setChallenges(myChallenges)
    } catch (error) {
      console.error("Error fetching challenges:", error)
    }
  }

  const fetchFaculties = async () => {
    try {
      const res = await API.get("/faculties")
      setFaculties(res.data)
    } catch (error) {
      console.error("Error fetching faculties:", error)
    }
  }

  const fetchProgramsByFaculty = async (facultyId) => {
    try {
      const res = await API.get(`/programs/${facultyId}`)
      setPrograms(res.data)
    } catch (error) {
      console.error("Error fetching programs:", error)
    }
  }

  const getMyModules = () => {
    const uniqueModules = []
    const seen = new Set()

    assignments.forEach((assignment) => {
      if (!seen.has(assignment.module_id)) {
        seen.add(assignment.module_id)
        uniqueModules.push({
          id: assignment.module_id,
          name: assignment.module_name,
          program_id: assignment.program_id,
          program_name: assignment.program_name,
          program_code: assignment.program_code,
        })
      }
    })

    return uniqueModules
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await API.post("/reports", {
        ...formData,
        lecturer_id: user.id,
      })
      alert("Report submitted successfully!")
      setShowForm(false)
      setFormData({
        faculty_id: "",
        module_id: "",
        program_id: "",
        week_of_reporting: "",
        date_of_lecture: "",
        student_name: "",
        student_number: "",
        actual_students_present: "",
        total_registered_students: "",
        venue: "",
        scheduled_time: "",
        topic_taught: "",
        learning_outcomes: "",
        recommendations: "",
      })
      fetchReports()
    } catch (error) {
      console.error("Error submitting report:", error)
      alert(error.response?.data?.error || "Failed to submit report")
    }
  }

  const handleChallengeSubmit = async (e) => {
    e.preventDefault()
    try {
      await API.post("/challenges", {
        ...challengeFormData,
        lecturer_id: user.id,
        submitted_date: new Date().toISOString().split("T")[0],
      })
      alert("Challenge submitted successfully!")
      setShowChallengeForm(false)
      setChallengeFormData({
        module_id: "",
        program_id: "",
        faculty_id: "",
        challenge_type: "",
        description: "",
        impact: "",
        proposed_solution: "",
        status: "pending",
      })
      fetchChallenges()
    } catch (error) {
      console.error("Error submitting challenge:", error)
      alert(error.response?.data?.error || "Failed to submit challenge")
    }
  }

  const handleModuleChange = (moduleId) => {
    const selectedModule = getMyModules().find((module) => module.id == moduleId)
    if (selectedModule) {
      const assignment = assignments.find((a) => a.module_id == moduleId)
      setFormData((prev) => ({
        ...prev,
        module_id: moduleId,
        program_id: selectedModule.program_id,
        faculty_id: assignment.faculty_id || "",
      }))
    }
  }

  const handleChallengeModuleChange = (moduleId) => {
    const selectedModule = getMyModules().find((module) => module.id == moduleId)
    if (selectedModule) {
      const assignment = assignments.find((a) => a.module_id == moduleId)
      setChallengeFormData((prev) => ({
        ...prev,
        module_id: moduleId,
        program_id: selectedModule.program_id,
        faculty_id: assignment.faculty_id || "",
      }))
    }
  }

  const myModules = getMyModules()

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Lecturer Dashboard</h1>
        <p>Welcome, {user?.name}. Manage your assigned modules and submit lecture reports</p>

        {assignments.length > 0 ? (
          <div className="header-actions">
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              + New Report
            </button>
            <button className="btn-secondary" onClick={() => setShowChallengeForm(true)}>
              + Report Challenge
            </button>
          </div>
        ) : (
          <div className="info-message">
            <p>No modules assigned to you yet. Please contact your program leader.</p>
          </div>
        )}
      </div>

      <div className="dashboard-content">
        {/* My Assigned Modules Section */}
        <div className="assignments-section">
          <h2>My Assigned Modules</h2>
          {assignments.length === 0 ? (
            <div className="empty-state">
              <p>You don't have any modules assigned yet. Please contact your program leader.</p>
            </div>
          ) : (
            <div className="assignments-grid">
              {assignments.map((assignment) => (
                <div key={assignment.id} className="assignment-card">
                  <div className="assignment-header">
                    <h3>{assignment.module_name}</h3>
                    <span className="program-badge">{assignment.program_code}</span>
                  </div>
                  <div className="assignment-details">
                    <p>
                      <strong>Program:</strong> {assignment.program_name}
                    </p>
                    <p>
                      <strong>Assigned By:</strong> {assignment.assigned_by_name}
                    </p>
                    <p>
                      <strong>Date Assigned:</strong> {new Date(assignment.assigned_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Report Form Modal */}
        {showForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Submit Lecture Report</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Module *</label>
                    <select value={formData.module_id} onChange={(e) => handleModuleChange(e.target.value)} required>
                      <option value="">Select Module</option>
                      {myModules.map((module) => (
                        <option key={module.id} value={module.id}>
                          {module.name} ({module.program_code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Program</label>
                    <input
                      type="text"
                      value={programs.find((p) => p.id == formData.program_id)?.program_name || ""}
                      disabled
                      placeholder="Auto-filled from module selection"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Week of Reporting *</label>
                    <input
                      type="text"
                      value={formData.week_of_reporting}
                      onChange={(e) => setFormData({ ...formData, week_of_reporting: e.target.value })}
                      placeholder="e.g., Week 1, Semester 1"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Date of Lecture *</label>
                    <input
                      type="date"
                      value={formData.date_of_lecture}
                      onChange={(e) => setFormData({ ...formData, date_of_lecture: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Student Name (Optional)</label>
                    <input
                      type="text"
                      value={formData.student_name}
                      onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                      placeholder="Enter student name if applicable"
                    />
                  </div>
                  <div className="form-group">
                    <label>Student Number (Optional)</label>
                    <input
                      type="text"
                      value={formData.student_number}
                      onChange={(e) => setFormData({ ...formData, student_number: e.target.value })}
                      placeholder="Enter student ID/number if applicable"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Faculty</label>
                    <select
                      value={formData.faculty_id}
                      onChange={(e) => setFormData({ ...formData, faculty_id: e.target.value })}
                    >
                      <option value="">Select Faculty</option>
                      {faculties.map((faculty) => (
                        <option key={faculty.id} value={faculty.id}>
                          {faculty.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Venue *</label>
                    <input
                      type="text"
                      value={formData.venue}
                      onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                      placeholder="e.g., Room 101, Building A"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Scheduled Time *</label>
                    <input
                      type="text"
                      value={formData.scheduled_time}
                      onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                      placeholder="e.g., 9:00 AM - 11:00 AM"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Students Present *</label>
                    <input
                      type="number"
                      value={formData.actual_students_present}
                      onChange={(e) => setFormData({ ...formData, actual_students_present: e.target.value })}
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Total Registered Students *</label>
                    <input
                      type="number"
                      value={formData.total_registered_students}
                      onChange={(e) => setFormData({ ...formData, total_registered_students: e.target.value })}
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Topic Taught *</label>
                  <input
                    type="text"
                    value={formData.topic_taught}
                    onChange={(e) => setFormData({ ...formData, topic_taught: e.target.value })}
                    placeholder="Enter the topic covered in this lecture"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Learning Outcomes *</label>
                  <textarea
                    value={formData.learning_outcomes}
                    onChange={(e) => setFormData({ ...formData, learning_outcomes: e.target.value })}
                    placeholder="Describe what students should have learned..."
                    rows="4"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Recommendations *</label>
                  <textarea
                    value={formData.recommendations}
                    onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                    placeholder="Any recommendations for improvement..."
                    rows="4"
                    required
                  />
                </div>

                <div className="form-actions">
                  <button type="button" onClick={() => setShowForm(false)}>
                    Cancel
                  </button>
                  <button type="submit">Submit Report</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Challenge Form Modal */}
        {showChallengeForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Report Teaching Challenge</h2>
              <form onSubmit={handleChallengeSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Module *</label>
                    <select
                      value={challengeFormData.module_id}
                      onChange={(e) => handleChallengeModuleChange(e.target.value)}
                      required
                    >
                      <option value="">Select Module</option>
                      {myModules.map((module) => (
                        <option key={module.id} value={module.id}>
                          {module.name} ({module.program_code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Program</label>
                    <input
                      type="text"
                      value={programs.find((p) => p.id == challengeFormData.program_id)?.program_name || ""}
                      disabled
                      placeholder="Auto-filled from module selection"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Challenge Type *</label>
                    <select
                      value={challengeFormData.challenge_type}
                      onChange={(e) => setChallengeFormData({ ...challengeFormData, challenge_type: e.target.value })}
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="attendance">Low Attendance</option>
                      <option value="resources">Lack of Resources</option>
                      <option value="technical">Technical Issues</option>
                      <option value="student_engagement">Student Engagement</option>
                      <option value="content_coverage">Content Coverage</option>
                      <option value="time_management">Time Management</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={challengeFormData.status}
                      onChange={(e) => setChallengeFormData({ ...challengeFormData, status: e.target.value })}
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    value={challengeFormData.description}
                    onChange={(e) => setChallengeFormData({ ...challengeFormData, description: e.target.value })}
                    placeholder="Describe the challenge in detail..."
                    rows="4"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Impact *</label>
                  <textarea
                    value={challengeFormData.impact}
                    onChange={(e) => setChallengeFormData({ ...challengeFormData, impact: e.target.value })}
                    placeholder="How is this affecting teaching and learning?"
                    rows="3"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Proposed Solution</label>
                  <textarea
                    value={challengeFormData.proposed_solution}
                    onChange={(e) => setChallengeFormData({ ...challengeFormData, proposed_solution: e.target.value })}
                    placeholder="What solutions do you suggest?"
                    rows="3"
                  />
                </div>

                <div className="form-actions">
                  <button type="button" onClick={() => setShowChallengeForm(false)}>
                    Cancel
                  </button>
                  <button type="submit">Submit Challenge</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* My Reports Section */}
        <div className="reports-section">
          <h2>My Lecture Reports</h2>
          {reports.length === 0 ? (
            <div className="empty-state">
              <p>No reports submitted yet. Click "New Report" to get started.</p>
            </div>
          ) : (
            <div className="reports-grid">
              {reports.map((report) => (
                <div key={report.id} className="report-card">
                  <div className="report-header">
                    <h3>
                      {report.module_name} - {report.program_name}
                    </h3>
                    <span className={`status-badge status-${report.status}`}>{report.status}</span>
                  </div>
                  <div className="report-details">
                    <p>
                      <strong>Date:</strong> {new Date(report.date_of_lecture).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Week:</strong> {report.week_of_reporting}
                    </p>
                    {report.student_name && (
                      <p>
                        <strong>Student Name:</strong> {report.student_name}
                      </p>
                    )}
                    {report.student_number && (
                      <p>
                        <strong>Student Number:</strong> {report.student_number}
                      </p>
                    )}
                    <p>
                      <strong>Attendance:</strong> {report.actual_students_present}/{report.total_registered_students}
                    </p>
                    <p>
                      <strong>Venue:</strong> {report.venue}
                    </p>
                    <p>
                      <strong>Time:</strong> {report.scheduled_time}
                    </p>
                    <p>
                      <strong>Topic:</strong> {report.topic_taught}
                    </p>
                    {report.principal_feedback && (
                      <div className="feedback-section">
                        <h4>Principal Feedback:</h4>
                        <p>{report.principal_feedback}</p>
                      </div>
                    )}
                  </div>
                  <div className="report-content">
                    <p>
                      <strong>Learning Outcomes:</strong> {report.learning_outcomes}
                    </p>
                    <p>
                      <strong>Recommendations:</strong> {report.recommendations}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Challenges Section */}
        <div className="challenges-section">
          <div className="section-header">
            <h2>Teaching Challenges</h2>
            {assignments.length > 0 && (
              <button className="btn-secondary" onClick={() => setShowChallengeForm(true)}>
                + Report New Challenge
              </button>
            )}
          </div>
          {challenges.length === 0 ? (
            <div className="empty-state">
              <p>No challenges reported yet. Click "Report Challenge" to document any teaching challenges.</p>
            </div>
          ) : (
            <div className="challenges-grid">
              {challenges.map((challenge) => (
                <div key={challenge.id} className="challenge-card">
                  <div className="challenge-header">
                    <h3>
                      {challenge.module_name} - {challenge.challenge_type}
                    </h3>
                    <div className="challenge-meta">
                      <span className={`status-badge status-${challenge.status}`}>{challenge.status}</span>
                      <span className="date-badge">{new Date(challenge.submitted_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="challenge-details">
                    <p>
                      <strong>Program:</strong> {challenge.program_name}
                    </p>
                    <p>
                      <strong>Type:</strong>
                      <span className={`type-badge type-${challenge.challenge_type}`}>{challenge.challenge_type}</span>
                    </p>
                  </div>
                  <div className="challenge-content">
                    <div className="content-section">
                      <h4>Description:</h4>
                      <p>{challenge.description}</p>
                    </div>
                    <div className="content-section">
                      <h4>Impact:</h4>
                      <p>{challenge.impact}</p>
                    </div>
                    {challenge.proposed_solution && (
                      <div className="content-section">
                        <h4>Proposed Solution:</h4>
                        <p>{challenge.proposed_solution}</p>
                      </div>
                    )}
                    {challenge.admin_feedback && (
                      <div className="feedback-section">
                        <h4>Admin Feedback:</h4>
                        <p>{challenge.admin_feedback}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LecturerDashboard
