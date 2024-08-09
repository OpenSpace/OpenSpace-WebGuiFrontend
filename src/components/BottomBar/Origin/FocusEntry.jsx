import React from 'react';
import {
  MdMoreVert
} from 'react-icons/md';
import PropTypes from 'prop-types';

import HorizontalDelimiter from '../../common/HorizontalDelimiter/HorizontalDelimiter';
import SmallLabel from '../../common/SmallLabel/SmallLabel';
import TooltipMenu from '../../common/Tooltip/TooltipMenu';
import { useContextRefs } from '../../GettingStartedTour/GettingStartedContext';

import NavigationButton, { NavigationTypes } from './NodeNavigationButton';

import styles from './FocusEntry.scss';

function FocusEntry({
  identifier,
  active = '',
  name = undefined,
  onSelect = null,
  showNavigationButtons = false,
  closePopoverIfSet = () => {}
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

  // Common props for all the navbuttons
  const navButtonProps = {
    identifier,
    onFinish: closePopoverIfSet
  };

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
            <NavigationButton type={NavigationTypes.frame} {...navButtonProps} />
          )}
          <NavigationButton type={NavigationTypes.fly} {...navButtonProps} />
          <TooltipMenu
            sourceObject={<MdMoreVert className={styles.buttonIcon} />}
          >
            <SmallLabel className={styles.menuTopLabel}>{identifier}</SmallLabel>
            <HorizontalDelimiter />
            <NavigationButton type={NavigationTypes.focus} showLabel {...navButtonProps} />
            <HorizontalDelimiter />
            <NavigationButton type={NavigationTypes.fly} showLabel {...navButtonProps} />
            <NavigationButton type={NavigationTypes.jump} showLabel {...navButtonProps} />
            <NavigationButton type={NavigationTypes.frame} showLabel {...navButtonProps} />
          </TooltipMenu>
        </div>
      )}
    </div>
  );
}

FocusEntry.propTypes = {
  identifier: PropTypes.string.isRequired,
  closePopoverIfSet: PropTypes.func,
  name: PropTypes.string,
  onSelect: PropTypes.func,
  active: PropTypes.string,
  showNavigationButtons: PropTypes.bool
};

export default FocusEntry;
