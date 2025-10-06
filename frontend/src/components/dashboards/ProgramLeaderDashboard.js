"use client"

import { useState, useEffect } from "react"
import API from "../../api"
import "../styles/leader.css"
import * as XLSX from "xlsx"

const ProgramLeaderDashboard = () => {
  const [activeTab, setActiveTab] = useState("programs")
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

  // Search state
  const [searchReports, setSearchReports] = useState("")

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

  // Excel export function for reports
  const exportReportsToExcel = () => {
    if (reports.length === 0) {
      alert("No reports to export")
      return
    }

    const exportData = reports.map((report) => ({
      Program: report.program_name,
      "Program Code": report.program_code,
      Module: report.module_name,
      Faculty: report.faculty_name,
      Lecturer: report.lecturer_name,
      Date: new Date(report.date_of_lecture).toLocaleDateString(),
      Week: report.week_of_reporting,
      Attendance: `${report.actual_students_present}/${report.total_registered_students}`,
      Venue: report.venue,
      Time: report.scheduled_time,
      Topic: report.topic_taught,
      "Learning Outcomes": report.learning_outcomes,
      Recommendations: report.recommendations,
      "Principal Feedback": report.principal_feedback || "No feedback yet",
      Status: report.status,
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reports")
    XLSX.writeFile(workbook, `Program_Leader_Reports_${new Date().toISOString().split("T")[0]}.xlsx`)
  }

  // Filter function for reports
  const filteredReports = reports.filter(
    (report) =>
      report.program_name?.toLowerCase().includes(searchReports.toLowerCase()) ||
      report.module_name?.toLowerCase().includes(searchReports.toLowerCase()) ||
      report.lecturer_name?.toLowerCase().includes(searchReports.toLowerCase()) ||
      report.faculty_name?.toLowerCase().includes(searchReports.toLowerCase()) ||
      report.topic_taught?.toLowerCase().includes(searchReports.toLowerCase()),
  )

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
        <h1>Program Leader Dashboard</h1>
        <p>Manage programs, modules, assign lectures and monitor reports</p>
      </div>

      {/* Statistics Overview */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-info">
            <h3>{stats.totalPrograms}</h3>
            <p>Total Programs</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏫</div>
          <div className="stat-info">
            <h3>{stats.totalModules}</h3>
            <p>Total Modules</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>{stats.totalReports}</h3>
            <p>Total Reports</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👨‍🏫</div>
          <div className="stat-info">
            <h3>{stats.totalAssignments}</h3>
            <p>Lecture Assignments</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{stats.totalStudents}</h3>
            <p>Total Students</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👤</div>
          <div className="stat-info">
            <h3>{stats.totalLecturers}</h3>
            <p>Lecturers</p>
          </div>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === "programs" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("programs")}
        >
          📚 Programs
        </button>
        <button
          className={`tab-button ${activeTab === "modules" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("modules")}
        >
          🏫 Modules
        </button>
        <button
          className={`tab-button ${activeTab === "assignments" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("assignments")}
        >
          👨‍🏫 Assign Lectures
        </button>
        <button
          className={`tab-button ${activeTab === "reports" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("reports")}
        >
          📊 Reports
        </button>
        <button
          className={`tab-button ${activeTab === "monitoring" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("monitoring")}
        >
          📈 Monitoring
        </button>
      </div>

      <div className="dashboard-content">
        {/* Programs Tab */}
        {activeTab === "programs" && (
          <div className="tab-content">
            <div className="section-header">
              <h2>Program Management</h2>
              <button className="btn-primary" onClick={() => setShowProgramForm(true)} disabled={loading}>
                {loading ? "Loading..." : "+ Add Program"}
              </button>
            </div>

            <div className="table-container">
              {programs.length === 0 ? (
                <div className="empty-state">
                  <p>No programs found. Create your first program to get started.</p>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Program Code</th>
                      <th>Program Name</th>
                      <th>Faculty</th>
                      <th>Created By</th>
                      <th>Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {programs.map((program) => (
                      <tr key={program.id}>
                        <td>
                          <strong>{program.program_code}</strong>
                        </td>
                        <td>{program.program_name}</td>
                        <td>{program.faculty_name || "N/A"}</td>
                        <td>{program.created_by_name}</td>
                        <td>{new Date(program.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Modules Tab */}
        {activeTab === "modules" && (
          <div className="tab-content">
            <div className="section-header">
              <h2>Module Management</h2>
              <button className="btn-primary" onClick={() => setShowModuleForm(true)} disabled={loading}>
                {loading ? "Loading..." : "+ Add Module"}
              </button>
            </div>

            <div className="table-container">
              {modules.length === 0 ? (
                <div className="empty-state">
                  <p>No modules found. Create your first module to get started.</p>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Module Name</th>
                      <th>Program</th>
                      <th>Faculty</th>
                      <th>Registered Students</th>
                      <th>Created By</th>
                      <th>Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modules.map((module) => (
                      <tr key={module.id}>
                        <td>
                          <strong>{module.module_name}</strong>
                        </td>
                        <td>{module.program_name || "N/A"}</td>
                        <td>{module.faculty_name || "N/A"}</td>
                        <td>{module.total_registered_students}</td>
                        <td>{module.created_by_name}</td>
                        <td>{new Date(module.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === "assignments" && (
          <div className="tab-content">
            <div className="section-header">
              <h2>Lecture Assignments</h2>
              <button className="btn-primary" onClick={() => setShowAssignmentForm(true)} disabled={loading}>
                {loading ? "Loading..." : "+ Assign Lecture"}
              </button>
            </div>

            <div className="table-container">
              {assignments.length === 0 ? (
                <div className="empty-state">
                  <p>No lecture assignments found. Assign your first lecture to get started.</p>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Module</th>
                      <th>Program</th>
                      <th>Lecturer</th>
                      <th>Assigned By</th>
                      <th>Date Assigned</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map((assignment) => (
                      <tr key={assignment.id}>
                        <td>
                          <strong>{assignment.module_name}</strong>
                        </td>
                        <td>
                          <div>
                            <strong>{assignment.program_code}</strong>
                            <div>{assignment.program_name}</div>
                          </div>
                        </td>
                        <td>{assignment.lecturer_name}</td>
                        <td>{assignment.assigned_by_name}</td>
                        <td>{new Date(assignment.assigned_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <div className="tab-content">
            <div className="section-header">
              <h2>All Lecture Reports</h2>
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
                <span className="report-count">Total: {filteredReports.length} reports</span>
              </div>
            </div>

            {filteredReports.length === 0 ? (
              <div className="empty-state">
                <p>
                  {searchReports
                    ? "No reports match your search."
                    : "No lecture reports found. Reports will appear here once submitted by lecturers."}
                </p>
              </div>
            ) : (
              <div className="reports-grid">
                {filteredReports.map((report) => (
                  <div key={report.id} className="report-card">
                    <div className="report-header">
                      <h3>
                        {report.program_name} ({report.program_code})
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
                        <strong>Faculty:</strong> {report.faculty_name}
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
                        <strong>Time:</strong> {report.scheduled_time}
                      </p>
                      {report.principal_feedback && (
                        <div className="feedback-section">
                          <strong>Principal Feedback:</strong>
                          <p>{report.principal_feedback}</p>
                        </div>
                      )}
                    </div>
                    <div className="report-topics">
                      <p>
                        <strong>Topic Taught:</strong> {report.topic_taught}
                      </p>
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
        )}

        {/* Monitoring Tab */}
        {activeTab === "monitoring" && (
          <div className="tab-content">
            <h2>Monitoring Dashboard</h2>

            <div className="monitoring-grid">
              <div className="monitoring-card">
                <h3>Quick Overview</h3>
                <div className="overview-stats">
                  <div className="overview-item">
                    <span className="label">Programs Created:</span>
                    <span className="value">{stats.totalPrograms}</span>
                  </div>
                  <div className="overview-item">
                    <span className="label">Modules Managed:</span>
                    <span className="value">{stats.totalModules}</span>
                  </div>
                  <div className="overview-item">
                    <span className="label">Active Assignments:</span>
                    <span className="value">{stats.totalAssignments}</span>
                  </div>
                  <div className="overview-item">
                    <span className="label">Total Students:</span>
                    <span className="value">{stats.totalStudents}</span>
                  </div>
                  <div className="overview-item">
                    <span className="label">Report Completion:</span>
                    <span className="value">
                      {stats.totalReports > 0 ? Math.round((stats.reviewedReports / stats.totalReports) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="monitoring-card">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                  {reports.slice(0, 5).map((report) => (
                    <div key={report.id} className="activity-item">
                      <div className="activity-dot"></div>
                      <div className="activity-content">
                        <p>
                          <strong>{report.lecturer_name}</strong> submitted report for {report.program_name}
                        </p>
                        <span className="activity-time">{new Date(report.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                  {reports.length === 0 && <p className="no-activity">No recent activity</p>}
                </div>
              </div>

              <div className="monitoring-card">
                <h3>Student Distribution</h3>
                <div className="student-distribution">
                  {modules.map((module) => (
                    <div key={module.id} className="distribution-item">
                      <span className="module-name">{module.module_name}</span>
                      <span className="student-count">{module.total_registered_students} students</span>
                    </div>
                  ))}
                  {modules.length === 0 && <p className="no-data">No module data available</p>}
                </div>
              </div>
            </div>
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
