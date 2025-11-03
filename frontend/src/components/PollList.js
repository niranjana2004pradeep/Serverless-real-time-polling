import React from 'react';
import './PollList.css';

function PollList({ polls, onSelectPoll }) {
  if (!polls || polls.length === 0) {
    return (
      <div className="empty-state">
        <h3>No polls yet</h3>
        <p>Create your first poll to get started!</p>
      </div>
    );
  }

  return (
    <div className="poll-list">
      <h2>Active Polls</h2>
      <div className="polls-grid">
        {polls.map((poll) => (
          <div 
            key={poll.pollId} 
            className="poll-card"
            onClick={() => onSelectPoll(poll.pollId)}
          >
            <h3>{poll.question}</h3>
            <div className="poll-meta">
              <span>{poll.options.length} options</span>
              <span className="poll-date">
                {new Date(poll.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="poll-action">
              Click to view & vote →
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PollList;


