import PropTypes from 'prop-types';
import React, { Component } from 'react';
import styles from './ToggleContent.scss';
import ToggleHeader from './ToggleHeader';

function ToggleContent({setExpanded, children, header, title, expanded, showEnabled}) {
  const [hovered, setHovered] = React.useState(false);

  function toggleExpanded() {
    setExpanded(!expanded);
  }

  function mouseEntered() {
    setHovered(true);
  }

  function mouseLeft() {
    setHovered(false);
  }

  if(!(children.length !== 0 && ((children[0].length != 0) || (children[1].length != 0)))) {
    return null;
  }
  else {
    return (
    <div className={styles.toggleContent}
          onMouseEnter={mouseEntered}
          onMouseLeave={mouseLeft}>
      { header ? header : 
        <ToggleHeader
          title={title}
          onClick={toggleExpanded}
          showEnabled={showEnabled}
          expanded={expanded}
        />
      }
      <div className={styles.content}>
        { expanded && children }
      </div>
    </div>);
  }
}

ToggleContent.propTypes = {
  children: PropTypes.node,
  header: PropTypes.node,
  setExpanded: PropTypes.func.isRequired,
  expanded: PropTypes.bool.isRequired,
  showEnabled: PropTypes.bool,
  title: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object
  ])
};

ToggleContent.defaultProps = {
  children: '',
  expanded: false
};

export default ToggleContent;
