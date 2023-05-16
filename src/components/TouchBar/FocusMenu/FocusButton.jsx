import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { icons } from '../../../api/resources';
import Icon from '../../common/MaterialIcon/MaterialIcon';
import SmallLabel from '../../common/SmallLabel/SmallLabel';
import styles from './FocusButton.scss';

class FocusButton extends Component {
  constructor(props) {
    super(props);
    this.select = this.select.bind(this);
  }

  get isActive() {
    const { active, identifier } = this.props;
    return identifier === active;
  }

  get icon() {
    const { identifier } = this.props;
    const icon = icons[identifier];
    if (icon) {
      return <img src={icon} className={styles.iconImage} alt={identifier} />;
    }
    return <Icon icon="language" className={styles.Icon} />;
  }

  select() {
    const { identifier, onChangeFocus } = this.props;
    onChangeFocus(identifier);
  }

  render() {
    const { identifier } = this.props;
    return (
      <div
        className={`${styles.FocusButton} ${this.isActive && styles.active}`}
        onClick={this.select}
        role="button"
        tabIndex="0"
      >
        { this.icon }
        <SmallLabel>{identifier}</SmallLabel>
      </div>
    );
  }
}

FocusButton.propTypes = {
  active: PropTypes.string.isRequired,
  identifier: PropTypes.string.isRequired,
  onChangeFocus: PropTypes.func.isRequired
};

export default FocusButton;
