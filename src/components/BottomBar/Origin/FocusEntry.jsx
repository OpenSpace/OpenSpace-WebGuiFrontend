import React from 'react';
import { MdCenterFocusStrong, MdFlight } from 'react-icons/md';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import Button from '../../common/Input/Button/Button';
import { useContextRefs } from '../../GettingStartedTour/GettingStartedContext';

import styles from './FocusEntry.scss';

function FocusEntry({
  name, identifier, onSelect, active, showNavigationButtons, closePopoverIfSet
}) {
  const luaApi = useSelector((state) => state.luaApi);
  function isActive() {
    return identifier === active;
  }

  function select(evt) {
    if (onSelect) {
      onSelect(identifier, evt);
    }
  }

  const flyTo = (event) => {
    if (event.shiftKey) {
      luaApi.pathnavigation.flyTo(identifier, 0.0);
    } else {
      luaApi.pathnavigation.flyTo(identifier);
    }
    event.stopPropagation();
    closePopoverIfSet();
  };

  const zoomToFocus = (event) => {
    if (event.shiftKey) {
      luaApi.pathnavigation.zoomToFocus(0.0);
    } else {
      luaApi.pathnavigation.zoomToFocus();
    }
    event.stopPropagation();
    closePopoverIfSet();
  };

  const refs = useContextRefs();

  return (
    <div
      className={`${styles.entry} ${isActive() && styles.active}`}
      onClick={select}
      onKeyPress={select}
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
          { isActive() && (
            <Button className={styles.flyToButton} onClick={zoomToFocus} title="Zoom to">
              <MdCenterFocusStrong className={styles.buttonIcon} />
            </Button>
          )}
          <Button className={styles.flyToButton} onClick={flyTo} title="Fly to">
            <MdFlight className={styles.buttonIcon} />
          </Button>
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
