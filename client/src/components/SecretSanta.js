import React, { useState } from 'react';
import { Gift, Users, Heart, Ban, Shuffle } from 'lucide-react';
import SantaListCollection from './SantaListCollection';
import './SecretSanta.css';

const SecretSanta = () => {
  const [participants, setParticipants] = useState(['Charl', 'Dave', 'Mel', 'Avvie', 'Sandy', 'Granny', 'Shano', 'Dale', 'Margie']);
  const [couples, setCouples] = useState([['Dave', 'Sandy'], ['Avvie', 'Shano'], ["Granny", "Margie"], ["Mel", "Dale"]]);
  const [blacklist, setBlacklist] = useState({});
  const [preDefinedMatches, setPreDefinedMatches] = useState({});
  const [matches, setMatches] = useState([]);

  const generateMatches = () => {
    const availableGivers = [...participants];
    const availableReceivers = [...participants];
    const newMatches = [];

    // Handle pre-defined matches
    Object.entries(preDefinedMatches).forEach(([giver, receiver]) => {
      newMatches.push([giver, receiver]);
      availableGivers.splice(availableGivers.indexOf(giver), 1);
      availableReceivers.splice(availableReceivers.indexOf(receiver), 1);
    });

    // Generate random matches for the rest
    while (availableGivers.length > 0) {
      const giver = availableGivers[Math.floor(Math.random() * availableGivers.length)];
      let possibleReceivers = availableReceivers.filter(receiver => 
        receiver !== giver && 
        !couples.some(couple => couple.includes(giver) && couple.includes(receiver)) &&
        (!blacklist[giver] || !blacklist[giver].includes(receiver))
      );

      if (possibleReceivers.length === 0) {
        // If no valid receiver, start over
        return generateMatches();
      }

      const receiver = possibleReceivers[Math.floor(Math.random() * possibleReceivers.length)];
      newMatches.push([giver, receiver]);
      availableGivers.splice(availableGivers.indexOf(giver), 1);
      availableReceivers.splice(availableReceivers.indexOf(receiver), 1);
    }

    setMatches(newMatches);
  };

  return (
    <div className="secret-santa-container">
      <h1 className="secret-santa-title">🎄 Secret Santa Matcher 🎅</h1>
      
      <div className="santa-list-grid">
        <SantaListCollection
          icon={Users}
          title="Participants"
          label="Enter names (comma-separated)"
          value={participants.join(', ')}
          onChange={(e) => setParticipants(e.target.value.split(',').map(p => p.trim()))}
          placeholder="e.g., John, Jane, Bob"
        />

        <SantaListCollection
          icon={Heart}
          title="Couples"
          label="Enter pairs (comma-separated, use + between names)"
          value={couples.map(couple => couple.join('+')).join(', ')}
          onChange={(e) => setCouples(e.target.value.split(',').map(pair => pair.trim().split('+')))}
          placeholder="e.g., John+Jane, Bob+Alice"
        />

        <SantaListCollection
          icon={Ban}
          title="Blacklist"
          label="Enter pairs to avoid (comma-separated, use > between names)"
          value={Object.entries(blacklist).map(([key, value]) => `${key}>${value.join(',')}`).join('; ')}
          onChange={(e) => {
            const newBlacklist = {};
            e.target.value.split(';').forEach(pair => {
              const [key, value] = pair.trim().split('>');
              if (key && value) {
                newBlacklist[key] = value.split(',').map(v => v.trim());
              }
            });
            setBlacklist(newBlacklist);
          }}
          placeholder="e.g., John>Jane,Bob; Alice>Charlie"
        />

        <SantaListCollection
          icon={Gift}
          title="Pre-defined Matches"
          label="Enter pre-defined matches (comma-separated, use > between names)"
          value={Object.entries(preDefinedMatches).map(([key, value]) => `${key}>${value}`).join(', ')}
          onChange={(e) => {
            const newPreDefined = {};
            e.target.value.split(',').forEach(pair => {
              const [key, value] = pair.trim().split('>');
              if (key && value) {
                newPreDefined[key] = value;
              }
            });
            setPreDefinedMatches(newPreDefined);
          }}
          placeholder="e.g., John>Alice, Bob>Charlie"
        />
      </div>

      <div className="generate-button-container">
        <button onClick={generateMatches} className="generate-button">
          <Shuffle className="generate-button-icon" />
          Generate Matches
        </button>
      </div>

      {matches.length > 0 && (
        <div className="matches-card">
          <h2 className="matches-title">🎁 Secret Santa Matches 🎁</h2>
          <ul className="matches-list">
            {matches.map(([giver, receiver], index) => (
              <li key={index} className="match-item">
                <span className="giver">{giver}</span> buys for <span className="receiver">{receiver}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SecretSanta;