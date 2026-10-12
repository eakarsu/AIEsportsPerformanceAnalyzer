import React from 'react';

// Presets only call local state setters. The generation action remains separate.
export default function AIPresetButtons({ presets, prerequisite }) {
  return <div className="ai-preset-bar" aria-label="Example inputs">
    <div><strong>Try a sample</strong>{prerequisite && <p>{prerequisite}</p>}</div>
    <div className="ai-actions">{presets.map(({ label, fill, disabled }) =>
      <button key={label} type="button" className="btn btn-secondary" disabled={disabled} onClick={fill}>{label}</button>
    )}</div>
  </div>;
}
