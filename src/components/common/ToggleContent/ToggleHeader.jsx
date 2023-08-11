import React from 'react';
import { MdChevronRight, MdExpandMore } from 'react-icons/md';
import PropTypes from 'prop-types';

import { useContextRefs } from '../../GettingStartedTour/GettingStartedContext';
import Button from '../Input/Button/Button';

import styles from './ToggleHeader.scss';

function ToggleHeader({
  title, expanded, onClick
}) {
  const refs = useContextRefs();

  return (
    <Button
      ref={(el) => { refs.current[`Group ${title}`] = el; }}
      className={styles.toggle}
      onClick={onClick}
    >
      {expanded ?
        <MdChevronRight className={styles.icon} /> :
        <MdExpandMore className={styles.icon} />}
      <span className={`${styles.title}`}>
        { title }
      </span>
    </Button>
  );
}

ToggleHeader.propTypes = {
  onClick: PropTypes.func.isRequired,
  title: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object
  ]).isRequired,
  expanded: PropTypes.bool.isRequired
};

ToggleHeader.defaultProps = {

};

export default ToggleHeader;
