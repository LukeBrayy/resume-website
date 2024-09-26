import React, { useState , useEffect }from 'react';
import { Gift, Users, Heart, Ban, Shuffle, RotateCcw, Check } from 'lucide-react';
import SantaListCollection from './SantaListCollection';
import './SecretSanta.css';

const predefinedLists = {
  familyAdults: {
    participants: ['Shano', 'Charl', 'Avvie', 'Mel', 'Dale', 'Granny Margi', 'Dave', 'Sandy'],
    couples: [['Mel', 'Dale'], ['Avvie', 'Shano'], ['Sandy', 'Dave']],
    blacklist: [['Margi', 'Granny']]
  },
  cousins: {
    // luke sam briony jamie shantelle doug levi jake shane keisha
    participants: ['Luke', 'Sam', 'Briony', 'Jamie', 'Shantelle', 'Doug', 'Levi', 'Jake', 'Shane', 'Keisha'],
    couples: [['Jake', 'Keisha'], ['Doug', 'Shantelle']],
    blacklist: [['Luke', 'Sam'], ['Briony', 'Jamie'], ['Jake', 'Shane'], ['Jake', 'Doug'], ['Shane', 'Doug']]
  },
  friends: {
    participants: ['Sarah', 'Mike', 'Lisa', 'Tom', 'Rachel', 'Chris'],
    couples: [['Sarah', 'Mike'], ['Lisa', 'Tom']],
    blacklist: [['Rachel', 'Chris'], ['Sarah', 'Lisa']]
  }
};

const SecretSanta = () => {
  const [category, setCategory] = useState('familyAdults');
  const [participants, setParticipants] = useState(predefinedLists.familyAdults.participants);
  const [couples, setCouples] = useState(predefinedLists.familyAdults.couples);
  const [blacklist, setBlacklist] = useState(predefinedLists.familyAdults.blacklist);
  const [preDefinedMatches, setPreDefinedMatches] = useState([]);
  const [matches, setMatches] = useState([]);
  const [checkedGivers, setCheckedGivers] = useState({});
  const [checkedReceivers, setCheckedReceivers] = useState({});

  useEffect(() => {
    const titles = {
      familyAdults: "Secret Santa - Family Adults",
      cousins: "Secret Santa - Cousins",
      friends: "Secret Santa - Friends"
    };
    document.title = titles[category] || "Secret Santa Matcher";
  }, [category]);

  const changeCategory = (newCategory) => {
    setCategory(newCategory);
    setParticipants(predefinedLists[newCategory].participants);
    setCouples(predefinedLists[newCategory].couples);
    setBlacklist(predefinedLists[newCategory].blacklist);
    setPreDefinedMatches([]);
    setMatches([]);
    setCheckedGivers({});
    setCheckedReceivers({});
  };

  const resetAll = () => {
    setMatches([]);
    setCheckedGivers({});
    setCheckedReceivers({});
  };
  
  const toggleChecked = (type, name) => {
    if (type === 'giver') {
      setCheckedGivers(prev => ({ ...prev, [name]: !prev[name] }));
    } else {
      setCheckedReceivers(prev => ({ ...prev, [name]: !prev[name] }));
    }
  };

  const generateMatches = () => {
    const availableGivers = [...participants];
    const availableReceivers = [...participants];
    const newMatches = [];

    // Handle pre-defined matches
    preDefinedMatches.forEach(([giver, receiver]) => {
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
        !blacklist.some(pair => pair[0] === giver && pair[1] === receiver)
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
      
      <div className="category-selector">
        <button 
          className={`category-button ${category === 'familyAdults' ? 'active' : ''}`}
          onClick={() => changeCategory('familyAdults')}
        >
          Family Adults
        </button>
        <button 
          className={`category-button ${category === 'cousins' ? 'active' : ''}`}
          onClick={() => changeCategory('cousins')}
        >
          Cousins
        </button>
        <button 
          className={`category-button ${category === 'friends' ? 'active' : ''}`}
          onClick={() => changeCategory('friends')}
        >
          Friends
        </button>
      </div>
      
      <div className="santa-list-grid">
        <SantaListCollection
          icon={Users}
          title="Participants"
          type="participants"
          items={participants}
          onItemsChange={setParticipants}
        />

        <SantaListCollection
          icon={Heart}
          title="Couples"
          type="couples"
          items={couples}
          onItemsChange={setCouples}
        />

        <SantaListCollection
          icon={Ban}
          title="Blacklist"
          type="blacklist"
          items={blacklist}
          onItemsChange={setBlacklist}
        />

        <SantaListCollection
          icon={Gift}
          title="Pre-defined Matches"
          type="predefined"
          items={preDefinedMatches}
          onItemsChange={setPreDefinedMatches}
        />
      </div>


      <div className="generate-button-container">
        <button onClick={generateMatches} className="generate-button">
          <Shuffle className="generate-button-icon" />
          Generate Matches
        </button>
        <button onClick={resetAll} className="reset-button">
          <RotateCcw className="reset-button-icon" />
          Reset
        </button>
      </div>

      <div className="matches-section">
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

        <div className="checklists-container">
          <div className="checklist">
            <h3>Givers</h3>
            {participants.map(name => (
              <label key={`giver-${name}`} className="checklist-item">
                <input
                  type="checkbox"
                  checked={checkedGivers[name] || false}
                  onChange={() => toggleChecked('giver', name)}
                />
                <Check className={`check-icon ${checkedGivers[name] ? 'checked' : ''}`} />
                {name}
              </label>
            ))}
          </div>
          <div className="checklist">
            <h3>Receivers</h3>
            {participants.map(name => (
              <label key={`receiver-${name}`} className="checklist-item">
                <input
                  type="checkbox"
                  checked={checkedReceivers[name] || false}
                  onChange={() => toggleChecked('receiver', name)}
                />
                <Check className={`check-icon ${checkedReceivers[name] ? 'checked' : ''}`} />
                {name}
              </label> 
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecretSanta;