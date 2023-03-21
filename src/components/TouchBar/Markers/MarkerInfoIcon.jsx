import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Icon from '../../common/MaterialIcon/MaterialIcon';
import Popover from '../../common/Popover/Popover';
import styles from './MarkerInfo.scss';

class MarkerInfoIcon extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showInfoWindow: false,
    };
  }

  componentWillUnmount() {
    this.setState({ showInfoWindow: false });
  }

  toggleInfoWindow() {
    this.setState({
      showInfoWindow: !this.state.showInfoWindow,
    });
  }

  render() {
    const { positionStyles, identifier, infoText } = this.props;
    return (
      <div>
        <Icon
          onClick={() => this.toggleInfoWindow()}
          className={styles.Icon}
          icon="info_outline"
          style={positionStyles.Icon}
        />
        {this.state.showInfoWindow &&
          <Popover
            className={styles.InfoPopover}
            arrow=""
            title={identifier}
            closeCallback={() => this.toggleInfoWindow()}
          >
            <p className={styles.InfoText}>
              {infoText ? infoText : 'No data available'}
            </p>
          </Popover>
        }
      </div>);
  }
}

MarkerInfoIcon.propTypes = {
  positionStyles: PropTypes.objectOf(PropTypes.shape({})).isRequired,
  identifier: PropTypes.string.isRequired,
  infoText: PropTypes.string.isRequired,
};

export default MarkerInfoIcon;
