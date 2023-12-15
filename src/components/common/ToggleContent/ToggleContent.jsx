import React from 'react';
import PropTypes from 'prop-types';

import ToggleHeader from './ToggleHeader';

import styles from './ToggleContent.scss';

function ToggleContent({
  setExpanded, children, header, title, expanded, showEnabled
}) {
  // If there are no children, return
  if (children.length === 0) {
    return null;
  }

  function toggleExpanded(evt) {
    setExpanded(!expanded);
    evt.stopPropagation();
  }

  return (
    <div className={styles.toggleContent}>
      { header || (
        <ToggleHeader
          title={title}
          onClick={toggleExpanded}
          showEnabled={showEnabled}
          expanded={expanded}
        />
      )}
      <div className={styles.content}>
        { expanded && children }
      </div>
    </div>
  );
}

ToggleContent.propTypes = {
  children: PropTypes.node,
  header: PropTypes.node,
  setExpanded: PropTypes.func.isRequired,
  expanded: PropTypes.bool,
  showEnabled: PropTypes.bool,
  title: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object
  ])
};

ToggleContent.defaultProps = {
  children: null,
  header: null,
  showEnabled: false,
  expanded: false,
  title: ''
};

export default ToggleContent;
