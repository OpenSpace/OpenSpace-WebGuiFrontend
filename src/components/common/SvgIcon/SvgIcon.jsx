import React from 'react';
import { ReactSVG } from 'react-svg';
import PropTypes from 'prop-types';

function SvgIcon({ style = {}, src, ...props }) {
  return (
    <div
      style={{ style, display: 'inline-grid', width: '1em' }}
      {...props}
    >
      <ReactSVG src={src} />
    </div>
  );
}

SvgIcon.propTypes = {
  /**
   * The loaded Svg
   */
  src: PropTypes.node.isRequired,

  /**
   * Any custom style
   */
  style: PropTypes.object
};

export default SvgIcon;
