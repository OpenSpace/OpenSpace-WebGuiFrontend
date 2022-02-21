import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import FlyToIcon from 'svg-react-loader?name=FlyTo!../../../icons/paper-plane-solid.svg';
import ZoomToIcon from 'svg-react-loader?name=ZoomTo!../../../icons/arrow-right-to-bracket-solid.svg';
import styles from './FocusEntryWithNavigation.scss';
import Button from '../../common/Input/Button/Button';
import SvgIcon from '../../common/SvgIcon/SvgIcon';

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
          <Button className={styles.flyToButton} small onClick={flyTo} title="Fly to">
            <SvgIcon className={styles.buttonIcon}><FlyToIcon /></SvgIcon>
          </Button>
          { this.isActive && (
            <Button className={styles.zoomToButton} small onClick={zoomToFocus} title="Zoom to">
              <SvgIcon className={styles.buttonIcon}><ZoomToIcon /></SvgIcon>
            </Button>
          )}
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
