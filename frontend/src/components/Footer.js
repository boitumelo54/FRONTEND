import React from "react";
import "./styles/footer.css"; 

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="brand-name">Limkokwing Platform</span>
            <p>Simplifying education management.</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 Limkokwing Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;