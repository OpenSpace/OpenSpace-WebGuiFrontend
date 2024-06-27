import React from 'react';
import {
  MdMoreVert
} from 'react-icons/md';
import PropTypes from 'prop-types';

import HorizontalDelimiter from '../../common/HorizontalDelimiter/HorizontalDelimiter';
import SmallLabel from '../../common/SmallLabel/SmallLabel';
import TooltipMenu from '../../common/Tooltip/TooltipMenu';
import { useContextRefs } from '../../GettingStartedTour/GettingStartedContext';

import NavigationButton from './NodeNavigationButton';

import styles from './FocusEntry.scss';

function FocusEntry({
  name, identifier, onSelect, active, showNavigationButtons, closePopoverIfSet
}) {
  function isActive() {
    return identifier === active;
  }

  function select(evt) {
    if (onSelect) {
      onSelect(identifier, evt);
    }
  }

  function keyboardSelect(evt) {
    if (evt.key === 'Enter' && onSelect) {
      onSelect(identifier, evt);
    }
  }

  const refs = useContextRefs();

  return (
    <div
      className={`${styles.entry} ${isActive() && styles.active}`}
      onClick={select}
      onKeyPress={keyboardSelect}
      key={name}
      role="button"
      ref={(el) => { refs.current[name] = el; }}
      tabIndex={0}
    >
      <span className={styles.title}>
        { name || identifier }
      </span>
      {showNavigationButtons && (
        <div className={styles.buttonContainer}>
          {isActive() && (
            <NavigationButton type="frame" identifier={identifier} onFinish={closePopoverIfSet} />
          )}
          <NavigationButton type="fly" identifier={identifier} onFinish={closePopoverIfSet} />
          <TooltipMenu
            sourceObject={<MdMoreVert className={styles.buttonIcon} />}
          >
            <SmallLabel className={styles.menuTopLabel}>{identifier}</SmallLabel>
            <HorizontalDelimiter />
            <NavigationButton type="focus" identifier={identifier} showLabel onFinish={closePopoverIfSet} />
            <HorizontalDelimiter />
            <NavigationButton type="fly" identifier={identifier} showLabel onFinish={closePopoverIfSet} />
            <NavigationButton type="jump" identifier={identifier} showLabel onFinish={closePopoverIfSet} />
            <NavigationButton type="frame" identifier={identifier} showLabel onFinish={closePopoverIfSet} />
          </TooltipMenu>
        </div>
      )}
    </div>
  );
}

FocusEntry.propTypes = {
  closePopoverIfSet: PropTypes.func,
  identifier: PropTypes.string.isRequired,
  name: PropTypes.string,
  onSelect: PropTypes.func,
  active: PropTypes.string,
  showNavigationButtons: PropTypes.bool
};

FocusEntry.defaultProps = {
  closePopoverIfSet: () => {},
  name: undefined,
  onSelect: null,
  showNavigationButtons: false,
  active: ''
};

export default FocusEntry;
