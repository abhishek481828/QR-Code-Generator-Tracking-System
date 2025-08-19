import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <header className="header">
        <nav className="navbar">
          <div className="nav-brand">
            <h1>Addwise</h1>
          </div>
          <div className="nav-links">
            <Link to="/login" className="btn btn-primary">Login</Link>
          </div>
        </nav>
      </header>

      <main className="main-content">
        <section className="hero">
          <div className="hero-content">
            <h1>Smart QR Code Management System</h1>
            <p>Generate, track, and manage QR codes with advanced location tracking capabilities.</p>
            <Link to="/login" className="btn btn-primary btn-large">Get Started</Link>
          </div>
          <div className="hero-image">
            <div className="qr-demo"></div>
          </div>
        </section>

        <section className="features">
          <div className="container">
            <h2>Our Features</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🔢</div>
                <h3>QR Code Generation</h3>
                <p>Generate up to 100 unique 16-digit QR codes instantly with our advanced system.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📍</div>
                <h3>Real-time Tracking</h3>
                <p>Track QR codes in real-time with our integrated Leaflet mapping system.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">👥</div>
                <h3>User Management</h3>
                <p>Comprehensive user management with role-based access control.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🔒</div>
                <h3>Security First</h3>
                <p>Enterprise-grade security with encrypted data and secure authentication.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="how-it-works">
          <div className="container">
            <h2>How It Works</h2>
            <div className="steps">
              <div className="step">
                <div className="step-number">1</div>
                <h3>Admin Creates QR Codes</h3>
                <p>Admins can generate 1-100 QR codes and activate them for assignment.</p>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <h3>Users Scan & Get Assigned</h3>
                <p>Users scan QR codes and get automatically assigned to track them.</p>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <h3>Track in Real-time</h3>
                <p>Set locations and track QR codes in real-time on interactive maps.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="about">
          <div className="container">
            <h2>About Addwise</h2>
            <p>
              Addwise is a cutting-edge QR code management platform designed for businesses 
              that need reliable tracking and management of their QR code assets. Our system 
              provides three levels of access control and advanced location tracking capabilities.
            </p>
            <div className="security-info">
              <h3>Security & Privacy</h3>
              <div className="security-features">
                <div className="security-item">
                  <span className="checkmark">✓</span>
                  <span>End-to-end encryption for all data transfers</span>
                </div>
                <div className="security-item">
                  <span className="checkmark">✓</span>
                  <span>Role-based access control (User, Admin, SuperAdmin)</span>
                </div>
                <div className="security-item">
                  <span className="checkmark">✓</span>
                  <span>Secure authentication with JWT tokens</span>
                </div>
                <div className="security-item">
                  <span className="checkmark">✓</span>
                  <span>Regular security audits and updates</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>Addwise</h3>
              <p>Smart QR Code Management System</p>
            </div>
            <div className="footer-section">
              <h4>Features</h4>
              <ul>
                <li>QR Code Generation</li>
                <li>Real-time Tracking</li>
                <li>User Management</li>
                <li>Security</li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Access Levels</h4>
              <ul>
                <li>User Dashboard</li>
                <li>Admin Panel</li>
                <li>SuperAdmin Control</li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 Addwise. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
