"use client"

import { useState, useEffect } from "react"
import API from "../../api"
import "../styles/dashboards.css"

const ProgramLeaderDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview")
  const [programs, setPrograms] = useState([])
  const [modules, setModules] = useState([])
  const [reports, setReports] = useState([])
  const [assignments, setAssignments] = useState([])
  const [lecturers, setLecturers] = useState([])
  const [faculties, setFaculties] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    totalPrograms: 0,
    totalModules: 0,
    totalReports: 0,
    totalAssignments: 0,
    reviewedReports: 0,
    totalLecturers: 0,
    totalStudents: 0,
  })

  // Form states
  const [showProgramForm, setShowProgramForm] = useState(false)
  const [showModuleForm, setShowModuleForm] = useState(false)
  const [showAssignmentForm, setShowAssignmentForm] = useState(false)

  const [programForm, setProgramForm] = useState({
    program_code: "",
    program_name: "",
    faculty_id: "",
  })

  const [moduleForm, setModuleForm] = useState({
    module_name: "",
    program_id: "",
    faculty_id: "",
    total_registered_students: "",
  })

  const [assignmentForm, setAssignmentForm] = useState({
    module_id: "",
    program_id: "",
    lecturer_id: "",
  })

  // Fetch all data on component mount
  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchPrograms(),
        fetchModules(),
        fetchReports(),
        fetchAssignments(),
        fetchLecturers(),
        fetchFaculties(),
        fetchStudents(),
      ])
    } catch (error) {
      console.error("Error fetching initial data:", error)
      alert("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const fetchPrograms = async () => {
    try {
      const res = await API.get("/programs")
      setPrograms(res.data)
      setStats((prev) => ({ ...prev, totalPrograms: res.data.length }))
    } catch (error) {
      console.error("Error fetching programs:", error)
      throw error
    }
  }

  const fetchModules = async () => {
    try {
      const res = await API.get("/modules")
      setModules(res.data)
      setStats((prev) => ({ ...prev, totalModules: res.data.length }))
    } catch (error) {
      console.error("Error fetching modules:", error)
      throw error
    }
  }

  const fetchReports = async () => {
    try {
      const res = await API.get("/reports")
      setReports(res.data)
      const reviewed = res.data.filter((report) => report.status === "reviewed").length
      setStats((prev) => ({
        ...prev,
        totalReports: res.data.length,
        reviewedReports: reviewed,
      }))
    } catch (error) {
      console.error("Error fetching reports:", error)
      throw error
    }
  }

  const fetchAssignments = async () => {
    try {
      const res = await API.get("/lecture-assignments")
      setAssignments(res.data)
      setStats((prev) => ({ ...prev, totalAssignments: res.data.length }))
    } catch (error) {
      console.error("Error fetching assignments:", error)
      throw error
    }
  }

  const fetchLecturers = async () => {
    try {
      const res = await API.get("/lecturers")
      setLecturers(res.data)
      setStats((prev) => ({ ...prev, totalLecturers: res.data.length }))
    } catch (error) {
      console.error("Error fetching lecturers:", error)
      throw error
    }
  }

  const fetchFaculties = async () => {
    try {
      const res = await API.get("/faculties")
      setFaculties(res.data)
    } catch (error) {
      console.error("Error fetching faculties:", error)
      throw error
    }
  }

  const fetchStudents = async () => {
    try {
      const res = await API.get("/students")
      setStudents(res.data)
      setStats((prev) => ({ ...prev, totalStudents: res.data.length }))
    } catch (error) {
      console.error("Error fetching students:", error)
      // If endpoint doesn't exist, we'll handle it gracefully
    }
  }

  // Fetch programs by faculty ID - same approach as Signup.js
  const fetchProgramsByFaculty = async (facultyId) => {
    if (!facultyId) {
      return []
    }
    try {
      const res = await API.get(`/programs/${facultyId}`)
      return res.data
    } catch (error) {
      console.error("Error fetching programs by faculty:", error)
      return []
    }
  }

  // Form handlers
  const handleProgramSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await API.post("/programs", programForm)
      alert("Program created successfully!")
      setShowProgramForm(false)
      setProgramForm({ program_code: "", program_name: "", faculty_id: "" })
      await fetchPrograms()
    } catch (error) {
      console.error("Error creating program:", error)
      alert(error.response?.data?.error || "Failed to create program")
    } finally {
      setLoading(false)
    }
  }

  const handleModuleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await API.post("/modules", moduleForm)
      alert("Module created successfully!")
      setShowModuleForm(false)
      setModuleForm({ module_name: "", program_id: "", faculty_id: "", total_registered_students: "" })
      await fetchModules()
    } catch (error) {
      console.error("Error creating module:", error)
      alert(error.response?.data?.error || "Failed to create module")
    } finally {
      setLoading(false)
    }
  }

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await API.post("/lecture-assignments", assignmentForm)
      alert("Lecture assigned successfully!")
      setShowAssignmentForm(false)
      setAssignmentForm({ module_id: "", program_id: "", lecturer_id: "" })
      await fetchAssignments()
    } catch (error) {
      console.error("Error creating assignment:", error)
      alert(error.response?.data?.error || "Failed to assign lecture")
    } finally {
      setLoading(false)
    }
  }

  // Reset forms when modals close
  const handleCloseProgramForm = () => {
    setShowProgramForm(false)
    setProgramForm({ program_code: "", program_name: "", faculty_id: "" })
  }

  const handleCloseModuleForm = () => {
    setShowModuleForm(false)
    setModuleForm({ module_name: "", program_id: "", faculty_id: "", total_registered_students: "" })
  }

  const handleCloseAssignmentForm = () => {
    setShowAssignmentForm(false)
    setAssignmentForm({ module_id: "", program_id: "", lecturer_id: "" })
  }

  // Handle faculty change for programs - same approach as Signup.js
  const handleFacultyChange = async (facultyId, formType) => {
    if (formType === "program") {
      setProgramForm((prev) => ({ ...prev, faculty_id: facultyId }))
    } else if (formType === "module") {
      setModuleForm((prev) => ({ ...prev, faculty_id: facultyId, program_id: "" }))
    }
  }

  // Filter modules by program for the assignments dropdown
  const getModulesByProgram = (programId) => {
    if (!programId) return modules
    return modules.filter((module) => module.program_id == programId)
  }

  if (loading && programs.length === 0) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">Loading Dashboard...</div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Program Leader Dashboard</h1>
          <p>Manage programs, modules, assign lectures and monitor reports</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => setShowProgramForm(true)} disabled={loading}>
            + Program
          </button>
          <button className="btn-secondary" onClick={() => setShowModuleForm(true)} disabled={loading}>
            + Module
          </button>
          <button className="btn-primary" onClick={() => setShowAssignmentForm(true)} disabled={loading}>
            + Assign Lecture
          </button>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <h3>{stats.totalPrograms}</h3>
            <p>Programs</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏫</div>
          <div className="stat-content">
            <h3>{stats.totalModules}</h3>
            <p>Modules</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{stats.totalReports}</h3>
            <p>Reports</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👨‍🏫</div>
          <div className="stat-content">
            <h3>{stats.totalAssignments}</h3>
            <p>Assignments</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.totalStudents}</h3>
            <p>Students</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👤</div>
          <div className="stat-content">
            <h3>{stats.totalLecturers}</h3>
            <p>Lecturers</p>
          </div>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          📊 Overview
        </button>
        <button
          className={`tab-button ${activeTab === "programs" ? "active" : ""}`}
          onClick={() => setActiveTab("programs")}
        >
          📚 Programs
        </button>
        <button
          className={`tab-button ${activeTab === "modules" ? "active" : ""}`}
          onClick={() => setActiveTab("modules")}
        >
          🏫 Modules
        </button>
        <button
          className={`tab-button ${activeTab === "assignments" ? "active" : ""}`}
          onClick={() => setActiveTab("assignments")}
        >
          👨‍🏫 Assignments
        </button>
        <button
          className={`tab-button ${activeTab === "reports" ? "active" : ""}`}
          onClick={() => setActiveTab("reports")}
        >
          📋 Reports
        </button>
      </div>

      <div className="dashboard-content">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="tab-content overview-tab">
            <div className="activity-grid">
              <div className="activity-column">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                  {reports.slice(0, 5).map((report) => (
                    <div key={report.id} className="activity-item">
                      <div className="activity-icon">📝</div>
                      <div className="activity-content">
                        <p>
                          <strong>{report.lecturer_name}</strong> submitted report for {report.module_name}
                        </p>
                        <p>{new Date(report.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                  {reports.length === 0 && <p className="no-activity">No recent activity</p>}
                </div>
              </div>

              <div className="activity-column">
                <h3>Quick Stats</h3>
                <div className="stats-grid" style={{gridTemplateColumns: '1fr'}}>
                  <div className="stat-card">
                    <div className="stat-icon">📈</div>
                    <div className="stat-content">
                      <h3>
                        {stats.totalReports > 0 ? Math.round((stats.reviewedReports / stats.totalReports) * 100) : 0}%
                      </h3>
                      <p>Report Completion</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">🎯</div>
                    <div className="stat-content">
                      <h3>
                        {stats.totalAssignments > 0 ? Math.round((stats.totalAssignments / stats.totalModules) * 100) : 0}%
                      </h3>
                      <p>Module Coverage</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">⚖️</div>
                    <div className="stat-content">
                      <h3>
                        {stats.totalStudents > 0 ? Math.round(stats.totalStudents / stats.totalLecturers) : 0}
                      </h3>
                      <p>Student Ratio</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="quick-actions-section">
              <h3>Quick Actions</h3>
              <div className="quick-actions-grid">
                <button className="quick-action-card" onClick={() => setShowProgramForm(true)}>
                  <div className="action-icon">📚</div>
                  <h3>Create Program</h3>
                  <p>Add a new academic program</p>
                </button>
                <button className="quick-action-card" onClick={() => setShowModuleForm(true)}>
                  <div className="action-icon">🏫</div>
                  <h3>Create Module</h3>
                  <p>Add a new course module</p>
                </button>
                <button className="quick-action-card" onClick={() => setShowAssignmentForm(true)}>
                  <div className="action-icon">👨‍🏫</div>
                  <h3>Assign Lecture</h3>
                  <p>Assign lecturer to module</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Programs Tab */}
        {activeTab === "programs" && (
          <div className="tab-content">
            <div className="section-header">
              <div>
                <h2>Program Management</h2>
                <p className="section-subtitle">Manage all academic programs and their details</p>
              </div>
              <div className="section-actions">
                <button className="btn-primary" onClick={() => setShowProgramForm(true)} disabled={loading}>
                  {loading ? "Loading..." : "+ Add Program"}
                </button>
              </div>
            </div>

            {programs.length === 0 ? (
              <div className="empty-state">
                <p>No programs found. Create your first program to get started.</p>
              </div>
            ) : (
              <div className="modules-grid">
                {programs.map((program) => (
                  <div key={program.id} className="module-card">
                    <div className="module-header">
                      <h3>{program.program_name}</h3>
                      <span className="program-badge">{program.program_code}</span>
                    </div>
                    <div className="module-details">
                      <p><strong>Faculty:</strong> {program.faculty_name || "N/A"}</p>
                      <p><strong>Created By:</strong> {program.created_by_name}</p>
                      <p><strong>Created:</strong> {new Date(program.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="module-stats">
                      <div className="stat">
                        <span className="stat-number">
                          {modules.filter(m => m.program_id === program.id).length}
                        </span>
                        <span className="stat-label">Modules</span>
                      </div>
                      <div className="stat">
                        <span className="stat-number">
                          {assignments.filter(a => a.program_id === program.id).length}
                        </span>
                        <span className="stat-label">Assignments</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modules Tab */}
        {activeTab === "modules" && (
          <div className="tab-content">
            <div className="section-header">
              <div>
                <h2>Module Management</h2>
                <p className="section-subtitle">Manage all course modules and student enrollment</p>
              </div>
              <div className="section-actions">
                <button className="btn-primary" onClick={() => setShowModuleForm(true)} disabled={loading}>
                  {loading ? "Loading..." : "+ Add Module"}
                </button>
              </div>
            </div>

            {modules.length === 0 ? (
              <div className="empty-state">
                <p>No modules found. Create your first module to get started.</p>
              </div>
            ) : (
              <div className="modules-grid">
                {modules.map((module) => (
                  <div key={module.id} className="module-card">
                    <div className="module-header">
                      <h3>{module.module_name}</h3>
                      <span className={`status-badge ${assignments.some(a => a.module_id === module.id) ? 'status-present' : 'status-pending'}`}>
                        {assignments.some(a => a.module_id === module.id) ? 'Assigned' : 'Unassigned'}
                      </span>
                    </div>
                    <div className="module-details">
                      <p><strong>Program:</strong> {module.program_name || "N/A"}</p>
                      <p><strong>Faculty:</strong> {module.faculty_name || "N/A"}</p>
                      <p><strong>Created By:</strong> {module.created_by_name}</p>
                      <p><strong>Created:</strong> {new Date(module.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="module-stats">
                      <div className="stat">
                        <span className="stat-number">{module.total_registered_students}</span>
                        <span className="stat-label">Students</span>
                      </div>
                      <div className="stat">
                        <span className="stat-number">
                          {reports.filter(r => r.module_id === module.id).length}
                        </span>
                        <span className="stat-label">Reports</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === "assignments" && (
          <div className="tab-content">
            <div className="section-header">
              <div>
                <h2>Lecture Assignments</h2>
                <p className="section-subtitle">Manage lecturer assignments to modules</p>
              </div>
              <div className="section-actions">
                <button className="btn-primary" onClick={() => setShowAssignmentForm(true)} disabled={loading}>
                  {loading ? "Loading..." : "+ Assign Lecture"}
                </button>
              </div>
            </div>

            {assignments.length === 0 ? (
              <div className="empty-state">
                <p>No lecture assignments found. Assign your first lecture to get started.</p>
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
                      <p><strong>Lecturer:</strong> {assignment.lecturer_name}</p>
                      <p><strong>Program:</strong> {assignment.program_name}</p>
                      <p><strong>Assigned By:</strong> {assignment.assigned_by_name}</p>
                      <p><strong>Date Assigned:</strong> {new Date(assignment.assigned_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <div className="tab-content">
            <div className="section-header">
              <div>
                <h2>Lecture Reports</h2>
                <p className="section-subtitle">Review all submitted lecture reports</p>
              </div>
              <div className="report-filters">
                <span>Total: {reports.length} reports</span>
              </div>
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
                        {report.program_name} ({report.program_code})
                      </h3>
                      <span className={`status-badge status-${report.status}`}>{report.status}</span>
                    </div>
                    <div className="content-section">
                      <h4>Basic Information</h4>
                      <p><strong>Lecturer:</strong> {report.lecturer_name}</p>
                      <p><strong>Module:</strong> {report.module_name}</p>
                      <p><strong>Faculty:</strong> {report.faculty_name}</p>
                      <p><strong>Date:</strong> {new Date(report.date_of_lecture).toLocaleDateString()}</p>
                      <p><strong>Week:</strong> {report.week_of_reporting}</p>
                      <p><strong>Attendance:</strong> {report.actual_students_present}/{report.total_registered_students}</p>
                      <p><strong>Venue:</strong> {report.venue}</p>
                      <p><strong>Time:</strong> {report.scheduled_time}</p>
                    </div>
                    <div className="content-section">
                      <h4>Topic Taught</h4>
                      <p>{report.topic_taught}</p>
                    </div>
                    <div className="content-section">
                      <h4>Learning Outcomes</h4>
                      <p>{report.learning_outcomes}</p>
                    </div>
                    <div className="content-section">
                      <h4>Recommendations</h4>
                      <p>{report.recommendations}</p>
                    </div>
                    {report.principal_feedback && (
                      <div className="content-section">
                        <h4>Principal Feedback</h4>
                        <p>{report.principal_feedback}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Program Form Modal */}
      {showProgramForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create New Program</h2>
              <button className="close-button" onClick={handleCloseProgramForm}>
                ×
              </button>
            </div>
            <form onSubmit={handleProgramSubmit}>
              <div className="form-group">
                <label>Program Code *</label>
                <input
                  type="text"
                  value={programForm.program_code}
                  onChange={(e) => setProgramForm({ ...programForm, program_code: e.target.value })}
                  required
                  placeholder="e.g., CS101"
                />
              </div>
              <div className="form-group">
                <label>Program Name *</label>
                <input
                  type="text"
                  value={programForm.program_name}
                  onChange={(e) => setProgramForm({ ...programForm, program_name: e.target.value })}
                  required
                  placeholder="e.g., Introduction to Programming"
                />
              </div>
              <div className="form-group">
                <label>Faculty</label>
                <select value={programForm.faculty_id} onChange={(e) => handleFacultyChange(e.target.value, "program")}>
                  <option value="">Select Faculty (Optional)</option>
                  {faculties.map((faculty) => (
                    <option key={faculty.id} value={faculty.id}>
                      {faculty.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-actions">
                <button type="button" onClick={handleCloseProgramForm} disabled={loading}>
                  Cancel
                </button>
                <button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Program"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Module Form Modal */}
      {showModuleForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create New Module</h2>
              <button className="close-button" onClick={handleCloseModuleForm}>
                ×
              </button>
            </div>
            <form onSubmit={handleModuleSubmit}>
              <div className="form-group">
                <label>Module Name *</label>
                <input
                  type="text"
                  value={moduleForm.module_name}
                  onChange={(e) => setModuleForm({ ...moduleForm, module_name: e.target.value })}
                  required
                  placeholder="e.g., CS-2024-A"
                />
              </div>
              <div className="form-group">
                <label>Program *</label>
                <select
                  value={moduleForm.program_id}
                  onChange={(e) => setModuleForm({ ...moduleForm, program_id: e.target.value })}
                  required
                >
                  <option value="">Select Program</option>
                  {programs.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.program_code} - {program.program_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Total Registered Students *</label>
                <input
                  type="number"
                  value={moduleForm.total_registered_students}
                  onChange={(e) => setModuleForm({ ...moduleForm, total_registered_students: e.target.value })}
                  required
                  min="1"
                  placeholder="e.g., 30"
                />
              </div>
              <div className="form-group">
                <label>Faculty</label>
                <select value={moduleForm.faculty_id} onChange={(e) => handleFacultyChange(e.target.value, "module")}>
                  <option value="">Select Faculty (Optional)</option>
                  {faculties.map((faculty) => (
                    <option key={faculty.id} value={faculty.id}>
                      {faculty.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-actions">
                <button type="button" onClick={handleCloseModuleForm} disabled={loading}>
                  Cancel
                </button>
                <button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Module"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assignment Form Modal */}
      {showAssignmentForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Assign Lecture to Module</h2>
              <button className="close-button" onClick={handleCloseAssignmentForm}>
                ×
              </button>
            </div>
            <form onSubmit={handleAssignmentSubmit}>
              <div className="form-group">
                <label>Program *</label>
                <select
                  value={assignmentForm.program_id}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, program_id: e.target.value })}
                  required
                >
                  <option value="">Select Program</option>
                  {programs.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.program_code} - {program.program_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Module *</label>
                <select
                  value={assignmentForm.module_id}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, module_id: e.target.value })}
                  required
                  disabled={!assignmentForm.program_id}
                >
                  <option value="">Select Module</option>
                  {getModulesByProgram(assignmentForm.program_id).map((module) => (
                    <option key={module.id} value={module.id}>
                      {module.module_name}
                    </option>
                  ))}
                </select>
                {!assignmentForm.program_id && <small>Select a program first to see available modules</small>}
              </div>
              <div className="form-group">
                <label>Lecturer *</label>
                <select
                  value={assignmentForm.lecturer_id}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, lecturer_id: e.target.value })}
                  required
                >
                  <option value="">Select Lecturer</option>
                  {lecturers.map((lecturer) => (
                    <option key={lecturer.id} value={lecturer.id}>
                      {lecturer.name} {lecturer.faculty_name && `(${lecturer.faculty_name})`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-actions">
                <button type="button" onClick={handleCloseAssignmentForm} disabled={loading}>
                  Cancel
                </button>
                <button type="submit" disabled={loading}>
                  {loading ? "Assigning..." : "Assign Lecture"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProgramLeaderDashboard