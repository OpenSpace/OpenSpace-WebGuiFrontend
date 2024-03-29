import React from 'react';
import ReactDom from 'react-dom';
import PropTypes from 'prop-types';

import { excludeKeys } from '../../../utils/helpers';

import styles from './Tooltip.scss';

function Tooltip({
  children, className, fixed, placement, ...props
}) {
  const [domReady, setDomReady] = React.useState(false);
  React.useEffect(() => {
    setDomReady(true);
  });

  const tooltip = (
    <div
      {...excludeKeys(props, 'placement fixed')}
      className={`${styles.tooltip} ${styles[placement]} ${fixed && styles.fixed} ${className}`}
    >
      { children }
    </div>
  );

  if (fixed) {
    // If ficed positioning, render tooltips independent from their stacking contexts,
    // by drawing it at root level. Fixes all problems with positioning for "fixed"
    // positioning (in relation to viewport)
    return domReady && ReactDom.createPortal(tooltip, document.getElementById('root'));
  }

  // If fixed positioning is not used, just render normally
  return tooltip;
}

Tooltip.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  fixed: PropTypes.bool,
  placement: PropTypes.oneOf('top right bottom left'.split(' '))
};

Tooltip.defaultProps = {
  className: '',
  fixed: false,
  placement: 'top'
};

export default Tooltip;
