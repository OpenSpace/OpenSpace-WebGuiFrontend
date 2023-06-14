import React from 'react';
import { Icon } from '@iconify/react';
import PropTypes from 'prop-types';

import { useContextRefs } from '../../GettingStartedTour/GettingStartedContext';
import Button from '../Input/Button/Button';

import styles from './ToggleHeader.scss';

function ToggleHeader({
  title, expanded, onClick, onIcon, offIcon
}) {
  const refs = useContextRefs();

  return (
    <Button
      ref={(el) => { refs.current[`Group ${title}`] = el; }}
      className={styles.toggle}
      onClick={onClick}
    >
      <Icon
        icon={expanded ? onIcon : offIcon}
        className={styles.icon}
      />
      <span className={`${styles.title}`}>
        { title }
      </span>
    </Button>
  );
}

ToggleHeader.propTypes = {
  offIcon: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  onIcon: PropTypes.string,
  title: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object
  ]).isRequired,
  expanded: PropTypes.bool.isRequired
};

ToggleHeader.defaultProps = {
  offIcon: 'material-symbols:chevron-right',
  onIcon: 'material-symbols:expand-more'
};

export default ToggleHeader;
