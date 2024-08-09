import React from 'react';
import PropTypes from 'prop-types';

function SvgIcon({ style, children, ...props }) {
  return (
    <div
      style={{ style, display: 'inline-grid', width: '1em' }}
      {...props}
    >
      {children}
    </div>
  );
}

SvgIcon.propTypes = {
  children: PropTypes.node.isRequired,
  style: PropTypes.object
};

SvgIcon.defaultProps = {
  style: {}
};

export default SvgIcon;
