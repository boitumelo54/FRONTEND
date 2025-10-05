import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./styles/Navigation.css";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  // Hide nav on landing page when not authenticated
  if (location.pathname === "/" && !isAuthenticated()) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
    setUserMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setUserMenuOpen(false);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
    setIsMenuOpen(false);
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      student: "#60a5fa",        // Blue
      lecturer: "#34d399",       // Green
      'principal-lecturer': "#f59e0b", // Amber
      'program-leader': "#a78bfa" // Purple
    };
    return colors[role?.toLowerCase()] || "#6b7280";
  };

  const getRoleIcon = (role) => {
    const icons = {
      student: "🎓",
      lecturer: "👨‍🏫",
      'principal-lecturer': "⭐",
      'program-leader': "👑"
    };
    return icons[role?.toLowerCase()] || "👤";
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo */}
        <Link to="/" className="nav-logo">
          <div className="logo-icon">📚</div>
          <div className="logo-text">
            <span className="logo-primary">Edu</span>
            <span className="logo-secondary">Track</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="nav-links">
          {isAuthenticated() ? (
            <>
              {/* Dashboard Link */}
              <Link 
                to="/dashboard" 
                className={`nav-link dashboard-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
              >
                <span className="nav-icon">📊</span>
                Dashboard
              </Link>

              {/* User Menu */}
              <div className="user-menu-container">
                <button 
                  className="user-menu-trigger"
                  onClick={toggleUserMenu}
                >
                  <div className="user-avatar">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="user-info">
                    <span className="user-name">{user?.name}</span>
                    <span 
                      className="user-role-badge"
                      style={{ backgroundColor: getRoleBadgeColor(user?.role) }}
                    >
                      <span className="role-icon">{getRoleIcon(user?.role)}</span>
                      {user?.role?.replace('-', ' ') || 'User'}
                    </span>
                  </div>
                  <span className={`dropdown-arrow ${userMenuOpen ? 'open' : ''}`}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                    </svg>
                  </span>
                </button>

                {userMenuOpen && (
                  <div className="user-dropdown">
                    <div className="dropdown-header">
                      <div className="user-avatar large">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className="user-details">
                        <div className="user-name">{user?.name}</div>
                        <div className="user-email">{user?.email}</div>
                        <div 
                          className="user-role-badge large"
                          style={{ backgroundColor: getRoleBadgeColor(user?.role) }}
                        >
                          <span className="role-icon">{getRoleIcon(user?.role)}</span>
                          {user?.role?.replace('-', ' ') || 'User'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="dropdown-divider"></div>
                    
                    <Link 
                      to="/profile" 
                      className="dropdown-item"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <span className="dropdown-icon">👤</span>
                      My Profile
                    </Link>
                    
                    <Link 
                      to="/settings" 
                      className="dropdown-item"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <span className="dropdown-icon">⚙️</span>
                      Settings
                    </Link>

                    <div className="dropdown-divider"></div>

                    <button 
                      onClick={handleLogout} 
                      className="dropdown-item logout"
                    >
                      <span className="dropdown-icon">🚪</span>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              {location.pathname !== "/" && (
                <Link to="/" className="nav-link">
                  <span className="nav-icon">🏠</span>
                  Home
                </Link>
              )}
              <Link to="/login" className="nav-link login-btn">
                <span className="nav-icon">🔑</span>
                Sign In
              </Link>
              <Link to="/signup" className="nav-link signup-btn">
                <span className="nav-icon">✨</span>
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className={`mobile-menu-btn ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Mobile Navigation */}
        <div className={`mobile-nav ${isMenuOpen ? 'active' : ''}`}>
          {isAuthenticated() ? (
            <>
              {/* Mobile User Info */}
              <div className="mobile-user-header">
                <div className="user-avatar large">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="mobile-user-info">
                  <span className="user-name">{user?.name}</span>
                  <span 
                    className="user-role-badge"
                    style={{ backgroundColor: getRoleBadgeColor(user?.role) }}
                  >
                    <span className="role-icon">{getRoleIcon(user?.role)}</span>
                    {user?.role?.replace('-', ' ') || 'User'}
                  </span>
                </div>
              </div>

              <div className="mobile-nav-divider"></div>

              {/* Mobile Navigation Links */}
              <Link 
                to="/dashboard" 
                className="mobile-nav-link dashboard-link"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="nav-icon">📊</span>
                Dashboard
              </Link>
              
              <Link 
                to="/profile" 
                className="mobile-nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="nav-icon">👤</span>
                My Profile
              </Link>

              <Link 
                to="/settings" 
                className="mobile-nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="nav-icon">⚙️</span>
                Settings
              </Link>

              <div className="mobile-nav-divider"></div>

              <button 
                onClick={handleLogout} 
                className="mobile-nav-link logout"
              >
                <span className="nav-icon">🚪</span>
                Sign Out
              </button>
            </>
          ) : (
            <>
              {location.pathname !== "/" && (
                <Link 
                  to="/" 
                  className="mobile-nav-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="nav-icon">🏠</span>
                  Home
                </Link>
              )}
              <Link 
                to="/login" 
                className="mobile-nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="nav-icon">🔑</span>
                Sign In
              </Link>
              <Link 
                to="/signup" 
                className="mobile-nav-link signup"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="nav-icon">✨</span>
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Overlay for mobile menu */}
        {isMenuOpen && (
          <div 
            className="mobile-overlay"
            onClick={() => setIsMenuOpen(false)}
          ></div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;