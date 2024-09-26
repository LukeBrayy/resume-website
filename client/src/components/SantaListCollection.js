// SantaListCollection.js
import React from 'react';
import './SantaListCollection.css';

const SantaListCollection = ({ icon: Icon, title, label, value, onChange, placeholder }) => (
  <div className="santa-list-card">
    <div className="santa-list-header">
      {Icon && <Icon className="santa-list-icon" />}
      <h3>{title}</h3>
    </div>
    <div className="santa-list-content">
      <label htmlFor={title.toLowerCase()}>{label}</label>
      <input
        id={title.toLowerCase()}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="santa-list-input"
      />
    </div>
  </div>
);

export default SantaListCollection;