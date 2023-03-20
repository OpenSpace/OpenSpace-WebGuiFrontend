import PropTypes from 'prop-types';
import React, { Component } from 'react';
import MaterialIcon from '../MaterialIcon/MaterialIcon';
import Tooltip from '../Tooltip/Tooltip';
import { excludeKeys } from '../../../utils/helpers';

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
    else {
      const { top, right } = this.wrapper.getBoundingClientRect();
      return { top: `${top}px`, left: `${right}px` };
    }
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
    const passOnProps = excludeKeys(this.props, 'icon text'); 
    return (
      <span
        ref={this.setRef('wrapper')}
        {...passOnProps}
      >
        <MaterialIcon icon={icon}
         onMouseEnter={this.showPopup}
         onMouseLeave={this.hidePopup} 
        />
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
  text: PropTypes.node.isRequired, // should be text or html object
};

InfoBox.defaultProps = {
  icon: 'info',
};

export default InfoBox;
