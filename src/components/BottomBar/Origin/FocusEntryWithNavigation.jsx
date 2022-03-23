import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import styles from './FocusEntryWithNavigation.scss';
import Button from '../../common/Input/Button/Button';
import MaterialIcon from '../../common/MaterialIcon/MaterialIcon';

class FocusEntry extends Component {
  constructor(props) {
    super(props);
    this.select = this.select.bind(this);
  }

  get isActive() {
    const { active, identifier } = this.props;
    return identifier === active;
  }

  select(evt) {
    const { identifier, onSelect } = this.props;
    if (onSelect) {
      onSelect(identifier, evt);
    }
  }

  render() {
    const { luaApi, name, identifier } = this.props;

    const flyTo = (event) => {
      luaApi.pathnavigation.flyTo(identifier);
      event.stopPropagation();
    };

    const zoomToFocus = (event) => {
      luaApi.pathnavigation.zoomToFocus();
      event.stopPropagation();
    };

    return (
      <li
        className={`${styles.entryWithNavigation} ${this.isActive && styles.active}`}
        onClick={this.select}
      >
        <span className={styles.title}>
          { name || identifier }
        </span>
        <div className={styles.buttonContainer}>
          { this.isActive && (
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
}

const mapStateToProps = state => ({
  luaApi: state.luaApi,
});

FocusEntry.propTypes = {
  identifier: PropTypes.string.isRequired,
  name: PropTypes.string,
  onSelect: PropTypes.func,
  active: PropTypes.string,
  luaApi: PropTypes.object.isRequired,
};

FocusEntry.defaultProps = {
  name: undefined,
  onSelect: null,
  active: '',
};

FocusEntry = connect(mapStateToProps)(FocusEntry);

export default FocusEntry;
