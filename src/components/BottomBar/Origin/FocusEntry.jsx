import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Button from '../../common/Input/Button/Button';
import MaterialIcon from '../../common/MaterialIcon/MaterialIcon';
import { useContextRefs } from '../../GettingStartedTour/GettingStartedContext';

import styles from './FocusEntry.scss';

function FocusEntry({
  luaApi, name, identifier, onSelect, active, showNavigationButtons, closePopoverIfSet
}) {
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
    <li
      className={`${styles.entry} ${isActive() && styles.active}`}
      onClick={select}
      key={name}
      ref={(el) => refs.current[name] = el}
    >
      <span className={styles.title}>
        { name || identifier }
      </span>
      {showNavigationButtons && (
        <div className={styles.buttonContainer}>
          { isActive() && (
            <Button className={styles.flyToButton} onClick={zoomToFocus} title="Zoom to">
              <MaterialIcon className={styles.buttonIcon} icon="center_focus_strong" />
            </Button>
          )}
          <Button className={styles.flyToButton} onClick={flyTo} title="Fly to">
            <MaterialIcon className={styles.buttonIcon} icon="flight" />
          </Button>
        </div>
      )}
    </li>
  );
}

const mapStateToProps = (state) => ({
  luaApi: state.luaApi
});

FocusEntry.propTypes = {
  closePopoverIfSet: PropTypes.func.isRequired,
  identifier: PropTypes.string.isRequired,
  name: PropTypes.string,
  onSelect: PropTypes.func,
  active: PropTypes.string,
  showNavigationButtons: PropTypes.bool,
  luaApi: PropTypes.object.isRequired
};

FocusEntry.defaultProps = {
  name: undefined,
  onSelect: null,
  showNavigationButtons: false,
  active: ''
};

FocusEntry = connect(mapStateToProps)(FocusEntry);

export default FocusEntry;
