import PropTypes from 'prop-types';
import React, { Component } from 'react';
import styles from './FocusEntry.scss';

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
    const { name, identifier } = this.props;
    return (
      <li className={`${styles.entry} ${this.isActive && styles.active}`} onClick={this.select}>
        <span className={styles.title}>
          { name || identifier }
        </span>
      </li>
    );
  }
}

FocusEntry.propTypes = {
  identifier: PropTypes.string.isRequired,
  name: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  active: PropTypes.string.isRequired,
};

FocusEntry.defaultProps = {
  name: undefined,
  onSelect: null,
  active: '',
};

export default FocusEntry;
