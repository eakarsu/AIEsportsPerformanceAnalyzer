import React from 'react';
import FormattedAIReport from './FormattedAIReport';

function AIResultDisplay({ result, loading, error }) {
  if (loading) {
    return (
      <div className="ai-loading">
        <div className="ai-loading-spinner"></div>
        <div className="ai-loading-text">AI is analyzing...</div>
        <div className="ai-loading-sub">Processing data with Claude AI</div>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (result === null || result === undefined) return null;

  return <div className="ai-result-wrapper"><FormattedAIReport response={result} title="AI generated analysis" /></div>;
}

export default AIResultDisplay;
