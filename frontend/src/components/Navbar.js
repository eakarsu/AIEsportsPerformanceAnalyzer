import React from 'react';
import { useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate('/')}>
        <span className="navbar-brand-icon">🎮</span>
        <span className="navbar-brand-text">Esports AI Analyzer</span>
      </div>
      <div className="navbar-right">
        <button className="navbar-link" onClick={() => navigate('/')}>Dashboard</button>
        <button className="navbar-link" data-testid="nav-esports-views" onClick={() => navigate('/custom-views')}>Esports Views</button>
        <span className="navbar-user">{user.email || 'User'}</span>
        <button className="navbar-logout" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;
