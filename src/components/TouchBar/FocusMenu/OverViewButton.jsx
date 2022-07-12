import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Icon from '../../common/MaterialIcon/MaterialIcon';
import SmallLabel from '../../common/SmallLabel/SmallLabel';
import styles from './FocusButton.scss';

class OverViewButton extends Component {
  render() {
    return (
      <div className={styles.FocusButton} onClick={this.props.onClick} role="button" tabIndex="0">
        <Icon icon="track_changes" className={styles.Icon} />
        <SmallLabel>Overview</SmallLabel>
      </div>
    );
  }
}

OverViewButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default OverViewButton;
