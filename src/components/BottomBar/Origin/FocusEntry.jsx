import PropTypes from 'prop-types';
import React, { Component } from 'react';
import styles from './FocusEntry.scss';

class FocusEntry extends Component {
  constructor(props) {
    super(props);
    this.select = this.select.bind(this);
  }

  select(evt) {
    const { identifier } = this.props;
    if (this.props.onSelect) {
      this.props.onSelect(identifier, evt);
    }
  }

  get isActive() {
    return this.props.identifier === this.props.active;
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
  onSelect: PropTypes.func,
  active: PropTypes.string,
};

FocusEntry.defaultProps = {
  onSelect: null,
  active: '',
};

export default FocusEntry;
