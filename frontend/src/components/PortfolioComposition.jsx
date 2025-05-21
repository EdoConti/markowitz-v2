import React from 'react';
import getRandomColors from '../hooks/getRandomColors';

const PortfolioComposition = ({ weights }) => {
  // 1) Build entries & parse weights
  const entries = Object.entries(weights).map(([ticker, w]) => ({
    ticker,
    weight: parseFloat(w),
  }));

  // 2) Generate colors
  const colors = getRandomColors(entries.length);

  // 3) Compute fractions
  const slices = entries.map(({ ticker, weight }, i) => ({
    ticker,
    fraction: weight / 100,
    color:    colors[i],
    label:    `${weight.toFixed(2)}%`,
  }));

  return (
    <div style={{ width: '100%' }}>
      {/* Bar container */}
      <div
        style={{
          display:      'flex',
          width:        '100%',
          height:       '3.5rem',
          borderRadius: '0.25rem',
          overflow:     'hidden',
          boxShadow:    '0 0 2px rgba(0,0,0,0.2)',
          marginBottom: '1rem',
        }}
      >
        {slices.map(({ ticker, fraction, color }) => (
          <div
            key={ticker}
            style={{
              flex:            fraction,
              backgroundColor: color,
            }}
          />
        ))}
      </div>

      {/* Centered legend with spacing */}
      <div
        style={{
          display:        'flex',
          justifyContent: 'center',
          gap:            '2rem',      // space between items
          flexWrap:       'wrap',      // wrap if too many
          marginTop:      '0.5rem',
        }}
      >
        {slices.map(({ ticker, label, color }) => (
          <div
            key={ticker}
            style={{
              display:       'flex',
              flexDirection: 'column',
              alignItems:    'center',
              fontSize:      '0.9rem',
              color:         '#333',
            }}
          >
            <span
              style={{
                display:         'inline-block',
                width:           '0.75rem',
                height:          '0.75rem',
                backgroundColor: color,
                marginBottom:    '0.25rem',
                borderRadius:    '0.125rem',
              }}
            />
            <span>{ticker}</span>
            <span style={{ fontWeight: 'bold' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PortfolioComposition;