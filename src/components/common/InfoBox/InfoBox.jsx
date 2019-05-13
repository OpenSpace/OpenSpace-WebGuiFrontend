import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MaterialIcon from '../MaterialIcon/MaterialIcon';
import Tooltip from '../Tooltip/Tooltip';

class InfoBox extends Component {
  constructor(props) {
    super(props);

    this.state = { showPopup: false };

    this.setRef = this.setRef.bind(this);
    this.showPopup = this.showPopup.bind(this);
    this.hidePopup = this.hidePopup.bind(this);
  }

  setRef(what) {
    return (element) => {
      this[what] = element;
    };
  }

  get position() {
    if (!this.wrapper) return { top: '0px', left: '0px' };
    const { top, right } = this.wrapper.getBoundingClientRect();
    return { top: `${top}px`, left: `${right}px` };
  }

  showPopup() {
    this.setState({ showPopup: true });
  }

  hidePopup() {
    this.setState({ showPopup: false });
  }

  render() {
    const { icon, text } = this.props;
    const { showPopup } = this.state;
    return (
      <span
        ref={this.setRef('wrapper')}
      >
        <MaterialIcon icon={icon}
         onMouseEnter={this.showPopup}
         onMouseLeave={this.hidePopup} />
        { showPopup && (
          <Tooltip fixed placement="right" style={this.position}>
            { text }
          </Tooltip>
        )}
      </span>
    );
  }
}

InfoBox.propTypes = {
  icon: PropTypes.string,
  text: PropTypes.string.isRequired,
};

InfoBox.defaultProps = {
  icon: 'info',
};

export default InfoBox;
