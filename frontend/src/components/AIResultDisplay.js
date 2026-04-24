import React from 'react';
import ReactMarkdown from 'react-markdown';

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

  if (!result) return null;

  // Extract the text content from the result (could be analysis, report, plan, or prediction)
  const textContent = result.analysis || result.report || result.plan || result.prediction || '';

  return (
    <div className="ai-result-wrapper">
      <div className="ai-result-card">
        <div className="ai-result-header">
          <div className="ai-badge">
            <div className="ai-badge-dot"></div>
            AI Generated Analysis
          </div>
          {result.generatedAt && (
            <span className="ai-result-timestamp">
              Generated: {new Date(result.generatedAt).toLocaleString()}
            </span>
          )}
        </div>
        <div className="ai-result-body">
          <ReactMarkdown>{textContent}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

export default AIResultDisplay;
