import React from 'react';
import PropTypes from 'prop-types';

import LoadingBlock from './LoadingBlock';

// eslint-disable-next-line no-mixed-operators
const rand = (min, max) => Math.random() * (max - min) + min;

function LoadingBlocks({ min = 2, max = 5, fixed = null, ...props}) {
  const count = fixed || Math.round(rand(min, max));
  return (
    <div {...props}>
      { Array.from(new Array(count), (_, key) => (
        <LoadingBlock key={`loading-${key}`} style={{ width: `${rand(50, 100)}%` }} />
      )) }
    </div>
  );
}

LoadingBlocks.propTypes = {
  fixed: PropTypes.number,
  max: PropTypes.number,
  min: PropTypes.number
};

export default LoadingBlocks;
