import React from 'react';

function ResponsableTabs({ activeTab, onChange }) {
  return (
    <div style={{ display:'flex', gap:'1rem', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom:'10px' }}>
      <button className={`btn-secondary ${activeTab === 'dashboard' ? 'btn-primary' : ''}`} onClick={() => onChange('dashboard')}>
        📊 Dashboard
      </button>
      <button className={`btn-secondary ${activeTab === 'competitions' ? 'btn-primary' : ''}`} onClick={() => onChange('competitions')}>
        🏆 Compétitions
      </button>
      <button className={`btn-secondary ${activeTab === 'users' ? 'btn-primary' : ''}`} onClick={() => onChange('users')}>
        👥 Utilisateurs
      </button>
      <button className={`btn-secondary ${activeTab === 'volontaires' ? 'btn-primary' : ''}`} onClick={() => onChange('volontaires')}>
        🦺 Volontaires
      </button>
      {/* ✅ AJOUTE CETTE LIGNE */}
      <button className={`btn-secondary ${activeTab === 'notifications' ? 'btn-primary' : ''}`} onClick={() => onChange('notifications')}>
        📢 Notifications
      </button>
    </div>
  );
}

export default ResponsableTabs;
