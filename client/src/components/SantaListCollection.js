import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import './SantaListCollection.css';

const SantaListCollection = ({ icon: Icon, title, type, items, onItemsChange }) => {
  const [newItem, setNewItem] = useState(['', '']);

  const addItem = () => {
    if (type === 'participants') {
      if (newItem[0].trim()) {
        onItemsChange([...items, newItem[0].trim()]);
        setNewItem(['', '']);
      }
    } else if (newItem[0].trim() && newItem[1].trim()) {
      onItemsChange([...items, newItem]);
      setNewItem(['', '']);
    }
  };

  const removeItem = (index) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    onItemsChange(updatedItems);
  };

  const renderInputFields = () => {
    if (type === 'participants') {
      return (
        <input
          value={newItem[0]}
          onChange={(e) => setNewItem([e.target.value, ''])}
          placeholder="Enter name"
          className="santa-list-input"
        />
      );
    } else {
      const placeholders = {
        couples: ['Name 1', 'Name 2'],
        blacklist: ['Giver', 'Receiver'],
        predefined: ['Giver', 'Receiver'],
      };
      return (
        <div className="input-group">
          <input
            value={newItem[0]}
            onChange={(e) => setNewItem([e.target.value, newItem[1]])}
            placeholder={placeholders[type][0]}
            className="santa-list-input"
          />
          <input
            value={newItem[1]}
            onChange={(e) => setNewItem([newItem[0], e.target.value])}
            placeholder={placeholders[type][1]}
            className="santa-list-input"
          />
        </div>
      );
    }
  };

  return (
    <div className="santa-list-card">
      <div className="santa-list-header">
        {Icon && <Icon className="santa-list-icon" />}
        <h3>{title}</h3>
      </div>
      <div className="santa-list-content">
        <ul className="santa-list">
          {items.map((item, index) => (
            <li key={index} className="santa-list-item">
              {type === 'participants' ? item : `${item[0]} & ${item[1]}`}
              <button onClick={() => removeItem(index)} className="remove-button">
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>
        <div className="santa-list-add">
          {renderInputFields()}
          <button onClick={addItem} className="add-button">
            <Plus size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SantaListCollection;