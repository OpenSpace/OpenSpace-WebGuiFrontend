import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import styles from './FocusEntry.scss';
import Button from '../../common/Input/Button/Button';
import MaterialIcon from '../../common/MaterialIcon/MaterialIcon';
import { useContextRefs } from '../../GettingStartedTour/GettingStartedContext';

function FocusEntry({ luaApi, name, identifier, onSelect, active, showNavigationButtons }) {

  function isActive() {
    return identifier === active;
  }

  function select(evt) {
    if (onSelect) {
      onSelect(identifier, evt);
    }
  }

  const flyTo = (event) => {
    luaApi.pathnavigation.flyTo(identifier);
    event.stopPropagation();
  };

  const zoomToFocus = (event) => {
    luaApi.pathnavigation.zoomToFocus();
    event.stopPropagation();
  };

  const refs = useContextRefs();

  console.log(showNavigationButtons);

  return (
    <li
      className={`${styles.entry} ${isActive() && styles.active}`}
      onClick={select}
      key={name}
      ref={el => refs.current[name] = el}
    >
      <span className={styles.title}>
        { name || identifier }
      </span>
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
    </li>
  );
}

const mapStateToProps = state => ({
  luaApi: state.luaApi,
});

FocusEntry.propTypes = {
  identifier: PropTypes.string.isRequired,
  name: PropTypes.string,
  onSelect: PropTypes.func,
  active: PropTypes.string,
  showNavigationButtons: PropTypes.bool,
  luaApi: PropTypes.object.isRequired,
};

FocusEntry.defaultProps = {
  name: undefined,
  onSelect: null,
  showNavigationButtons: false,
  active: '',
};

FocusEntry = connect(mapStateToProps)(FocusEntry);

export default FocusEntry;
