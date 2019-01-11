import React, { Component } from 'react';
import PropTypes from 'prop-types';
import DataManager from '../../../api/DataManager';
import styles from './FocusEntry.scss';
import { jsonToLuaString } from '../../../utils/propertyTreeHelpers';

class FocusEntry extends Component {
  constructor(props) {
    super(props);
    this.select = this.select.bind(this);
  }

  select() {
    const { identifier } = this.props;
    if (this.props.onSelect) {
      this.props.onSelect(identifier);
    }
  }

  get isActive() {
    return this.props.identifier === this.props.active;
  }

  render() {
    const { identifier } = this.props;
    return (
      <li className={`${styles.entry} ${this.isActive && styles.active}`} onClick={this.select}>
        <span className={styles.title}>
          { identifier }
        </span>
      </li>
    );
  }
}

FocusEntry.propTypes = {
  identifier: PropTypes.string.isRequired,
  onSelect: PropTypes.func,
  active: PropTypes.string,
};

FocusEntry.defaultProps = {
  onSelect: null,
  active: '',
};

export default FocusEntry;
