import React from 'react';
import GraphBody from './GraphBody';

function Graph({ points, color }) {
  return (
    <div>
      <svg width={800} height={600}>
        <GraphBody
          points={points}
          color={color}
          x={0}
          y={600}
          fill="blue"
          fillOpacity=".5"
          strokeWidth={1}
        />
      </svg>
    </div>
  );
}

export default Graph;
