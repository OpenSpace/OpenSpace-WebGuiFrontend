import React from 'react';
import { ReactSVG } from 'react-svg';
import PropTypes from 'prop-types';

import styles from './SvgIcon.scss';

function SvgIcon({
  className = '',
  src,
  style = {},
  ...props
}) {
  return (
    <div
      className={`${className} ${styles.SvgIcon}`}
      style={{ style, display: 'inline-grid', width: '1em' }}
      {...props}
    >
      <ReactSVG src={src} />
    </div>
  );
}

SvgIcon.propTypes = {
  className: PropTypes.string,

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
