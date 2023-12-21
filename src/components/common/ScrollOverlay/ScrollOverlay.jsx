import React from 'react';
import PropTypes from 'prop-types';

import { defer } from '../../../utils/helpers';

import styles from './ScrollOverlay.scss';

/**
 * Limit the vertical space an element, or a set of element, may take.
 * Adds a scroll bar and indicators for more content.
 *
 * Exposes the global CSS class `scroll-content`, so that it may be styled.
 */
function ScrollOverlay({ className, children }) {
  const [atTop, setAtTop] = React.useState(true);
  const [atBottom, setAtBottom] = React.useState(false);

  const id = React.useRef(ScrollOverlay.elementId());
  const nodeRef = React.useRef(null);

  /**
   * decide if the scroll indicators should be shown or not
   * @param target - the `.scroll-content` node
   */
  function updateScrollIndicators(target) {
    if (!document.body.contains(target)) {
      return;
    }
    // compare using `< 1` instead of `=== 0` because floating point precision
    const bottomHeight = target.scrollTop + target.clientHeight;
    const heightAtBottom = Math.abs(bottomHeight - target.scrollHeight) < 1;
    const heightAtTop = target.scrollTop === 0;
    setAtTop(heightAtTop);
    setAtBottom(heightAtBottom);
  }

  function setDomNode(node) {
    if (node) {
      nodeRef.current = node;
      nodeRef.current.addEventListener('scroll', ({ target }) => updateScrollIndicators(target));
      defer(updateScrollIndicators, nodeRef.current);
    }
  }

  return (
    <div
      className={`scroll-content ${className} ${styles.ScrollOverlay}`}
      id={id.current}
      ref={setDomNode}
    >
      {!atTop && <div className={styles.topShadow} />}
      { children }
      {!atBottom && <div className={styles.bottomShadow} />}
    </div>
  );
}

// Static functions & properties
ScrollOverlay.elementCount = 0;

// eslint-disable-next-line no-plusplus
ScrollOverlay.elementId = () => `scroll-overlay-${ScrollOverlay.elementCount++}`;

ScrollOverlay.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

ScrollOverlay.defaultProps = {
  className: ''
};

export default ScrollOverlay;
