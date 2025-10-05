import React from "react";
import { Link } from "react-router-dom";
import "./styles/LandingPage.css";

const LandingPage = () => {
  return (
    <div className="landing-container">
      {/* Navigation */}
      <nav className="modern-nav">
        <div className="nav-container">
          <div className="nav-brand">
            <span className="brand-logo">🎓</span>
            <span className="brand-text">Limkokwing</span>
          </div>
          <div className="nav-actions">
            <Link to="/login" className="nav-link">
              Sign In
            </Link>
            <Link to="/signup" className="nav-button">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-glow"></div>
        </div>
        <div className="hero-content">
          <div className="hero-badge">
            <span>🚀 Next Generation Learning Platform</span>
          </div>
          <h1 className="hero-title">
            Elevate Your
            <span className="gradient-text"> Academic Journey</span>
          </h1>
          <p className="hero-subtitle">
            A cutting-edge platform where students and educators collaborate, 
            innovate, and achieve academic excellence through intelligent tools 
            and seamless workflows.
          </p>
          <div className="cta-buttons">
            <Link to="/signup" className="cta-button primary">
              <span>Start Learning Free</span>
              <div className="button-arrow">→</div>
            </Link>
            <Link to="/login" className="cta-button secondary">
              Explore Platform
            </Link>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-number">10K+</div>
              <div className="stat-label">Active Students</div>
            </div>
            <div className="stat">
              <div className="stat-number">500+</div>
              <div className="stat-label">Educators</div>
            </div>
            <div className="stat">
              <div className="stat-number">95%</div>
              <div className="stat-label">Success Rate</div>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="floating-card card-1">
            <div className="card-header"></div>
            <div className="card-content"></div>
          </div>
          <div className="floating-card card-2">
            <div className="card-header"></div>
            <div className="card-content"></div>
          </div>
          <div className="floating-card card-3">
            <div className="card-header"></div>
            <div className="card-content"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Choose Our Platform</h2>
            <p className="section-subtitle">
              Experience the future of education with tools designed to empower 
              both learners and educators
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <div className="feature-icon">📚</div>
              </div>
              <h3>Smart Course Management</h3>
              <p>Intelligent organization of courses, materials, and schedules with AI-powered recommendations.</p>
              <div className="feature-highlight"></div>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <div className="feature-icon">📊</div>
              </div>
              <h3>Advanced Analytics</h3>
              <p>Real-time progress tracking with predictive analytics and personalized insights.</p>
              <div className="feature-highlight"></div>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <div className="feature-icon">👥</div>
              </div>
              <h3>Seamless Collaboration</h3>
              <p>Integrated tools for group projects, peer reviews, and instant communication.</p>
              <div className="feature-highlight"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Role-based Sections */}
      <section className="roles-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Designed for Success</h2>
            <p className="section-subtitle">
              Tailored experiences for every member of our educational community
            </p>
          </div>
          <div className="roles-grid">
            <div className="role-card student-card">
              <div className="role-header">
                <div className="role-icon">👨‍🎓</div>
                <div className="role-badge">Student</div>
              </div>
              <h3>Accelerate Your Learning</h3>
              <p>Access interactive materials, track your progress, and collaborate with peers in real-time.</p>
              <ul className="role-features">
                <li>Personalized learning paths</li>
                <li>Interactive assignments</li>
                <li>Progress dashboard</li>
                <li>Peer collaboration</li>
              </ul>
            </div>
            <div className="role-card educator-card">
              <div className="role-header">
                <div className="role-icon">👨‍🏫</div>
                <div className="role-badge">Educator</div>
              </div>
              <h3>Empower Your Teaching</h3>
              <p>Create engaging content, monitor student performance, and provide meaningful feedback.</p>
              <ul className="role-features">
                <li>Course creation tools</li>
                <li>Performance analytics</li>
                <li>Automated grading</li>
                <li>Communication hub</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-background">
          <div className="cta-glow"></div>
        </div>
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Transform Education?</h2>
            <p>
              Join thousands of educators and students already experiencing 
              the future of learning
            </p>
            <div className="cta-buttons">
              <Link to="/signup" className="cta-button primary large">
                <span>Create Your Account</span>
                <div className="button-arrow">→</div>
              </Link>
            </div>
            <div className="cta-note">
              No credit card required • Free forever plan
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="modern-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="brand-logo">🎓</div>
              <div className="brand-text">Limkokwing Platform</div>
            </div>
            <div className="footer-links">
              <Link to="/about" className="footer-link">About</Link>
              <Link to="/contact" className="footer-link">Contact</Link>
              <Link to="/privacy" className="footer-link">Privacy</Link>
              <Link to="/terms" className="footer-link">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;