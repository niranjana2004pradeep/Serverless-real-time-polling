import React, { useState, useEffect } from 'react';
import './App.css';
import PollList from './components/PollList';
import CreatePoll from './components/CreatePoll';
import PollDetail from './components/PollDetail';

// Replace with your API Gateway URL after deployment
const API_URL = process.env.REACT_APP_API_URL || 'YOUR_API_GATEWAY_URL';

function App() {
  const [view, setView] = useState('list'); // 'list', 'create', 'detail'
  const [polls, setPolls] = useState([]);
  const [selectedPollId, setSelectedPollId] = useState(null);
  const [userId] = useState(() => {
    // Generate or retrieve userId from localStorage
    let id = localStorage.getItem('userId');
    if (!id) {
      id = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('userId', id);
    }
    return id;
  });

  useEffect(() => {
    if (view === 'list') {
      fetchPolls();
    }
  }, [view]);

  const fetchPolls = async () => {
    try {
      const response = await fetch(`${API_URL}/polls`);
      const data = await response.json();
      setPolls(data.polls || []);
    } catch (error) {
      console.error('Error fetching polls:', error);
    }
  };

  const handleCreatePoll = async (question, options) => {
    try {
      const response = await fetch(`${API_URL}/polls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, options }),
      });
      
      if (response.ok) {
        setView('list');
        fetchPolls();
      }
    } catch (error) {
      console.error('Error creating poll:', error);
    }
  };

  const handleSelectPoll = (pollId) => {
    setSelectedPollId(pollId);
    setView('detail');
  };

  const handleBack = () => {
    setView('list');
    setSelectedPollId(null);
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>📊 Real-time Polling</h1>
        <p>Serverless polling powered by AWS</p>
      </header>

      <div className="container">
        {view === 'list' && (
          <>
            <div className="action-buttons">
              <button 
                className="btn btn-primary"
                onClick={() => setView('create')}
              >
                + Create New Poll
              </button>
            </div>
            <PollList 
              polls={polls} 
              onSelectPoll={handleSelectPoll}
            />
          </>
        )}

        {view === 'create' && (
          <CreatePoll 
            onCreatePoll={handleCreatePoll}
            onCancel={handleBack}
          />
        )}

        {view === 'detail' && selectedPollId && (
          <PollDetail 
            pollId={selectedPollId}
            userId={userId}
            apiUrl={API_URL}
            onBack={handleBack}
          />
        )}
      </div>

      <footer className="app-footer">
        <p>Built with AWS Lambda, DynamoDB, API Gateway & S3</p>
      </footer>
    </div>
  );
}

export default App;


