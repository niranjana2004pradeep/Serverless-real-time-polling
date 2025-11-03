import React, { useState, useEffect } from 'react';
import './PollDetail.css';

function PollDetail({ pollId, userId, apiUrl, onBack }) {
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    fetchPoll();
    const interval = setInterval(fetchPoll, 3000); // Poll for updates every 3 seconds
    return () => clearInterval(interval);
  }, [pollId]);

  const fetchPoll = async () => {
    try {
      const response = await fetch(`${apiUrl}/polls/${pollId}`);
      const data = await response.json();
      setPoll(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching poll:', error);
      setLoading(false);
    }
  };

  const handleVote = async (optionId) => {
    try {
      const response = await fetch(`${apiUrl}/polls/${pollId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId, userId }),
      });

      if (response.ok) {
        setHasVoted(true);
        setSelectedOption(optionId);
        fetchPoll(); // Refresh results
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading poll...</div>;
  }

  if (!poll) {
    return <div className="error">Poll not found</div>;
  }

  const maxVotes = Math.max(...poll.results.map(r => r.votes), 1);

  return (
    <div className="poll-detail">
      <button onClick={onBack} className="btn-back">
        ← Back to Polls
      </button>

      <div className="poll-header">
        <h2>{poll.question}</h2>
        <div className="poll-stats">
          <span className="total-votes">
            {poll.totalVotes} {poll.totalVotes === 1 ? 'vote' : 'votes'}
          </span>
        </div>
      </div>

      <div className="poll-options">
        {poll.results.map((option) => {
          const isSelected = selectedOption === option.id;
          const barWidth = poll.totalVotes > 0 
            ? (option.votes / maxVotes) * 100 
            : 0;

          return (
            <div key={option.id} className="option-container">
              <button
                className={`btn btn-option ${isSelected ? 'voted' : ''}`}
                onClick={() => handleVote(option.id)}
                disabled={hasVoted}
              >
                <span className="option-text">{option.text}</span>
                <span className="option-stats">
                  {option.votes} ({option.percentage}%)
                </span>
              </button>
              
              {poll.totalVotes > 0 && (
                <div className="vote-bar-container">
                  <div 
                    className="vote-bar"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {hasVoted && (
        <div className="voted-message">
          ✓ Your vote has been recorded! Results update in real-time.
        </div>
      )}

      <div className="poll-footer">
        <small>Created {new Date(poll.createdAt).toLocaleString()}</small>
      </div>
    </div>
  );
}

export default PollDetail;


