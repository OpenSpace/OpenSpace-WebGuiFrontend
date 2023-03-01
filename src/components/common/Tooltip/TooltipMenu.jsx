import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Tooltip from './Tooltip';

class TooltipMenu extends Component {
  constructor(props) {
    super(props);

    this.mounted = false;
    this.state = {
      showPopup: false,
    };

    this.setRef = this.setRef.bind(this);
    this.togglePopup = this.togglePopup.bind(this);
    this.closePopup = this.closePopup.bind(this);
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
  }

  componentDidMount() {
    this.mounted = true;
    window.addEventListener('scroll', this.closePopup, true);
    window.addEventListener('mousedown', this.handleOutsideClick, true);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.closePopup);
    window.removeEventListener('mousedown', this.handleOutsideClick);
    this.mounted = false;
  }

  setRef(what) {
    return (element) => { this[what] = element; };
  }

  get position() {
    if (!this.wrapper) return { top: '0px', left: '0px' };
    const { top, right } = this.wrapper.getBoundingClientRect();
    return { top: `${top}px`, left: `${right}px` };
  }

  togglePopup(evt) {
    if (this.mounted) {
      this.setState({ showPopup: !this.state.showPopup });
    }
    evt.stopPropagation();
  }

  handleOutsideClick(evt) {
    if (!this.insideClickWrapper?.contains(evt.target) &&
        !this.buttonClickWrapper?.contains(evt.target))
    {
      this.closePopup();
    }
  }

  closePopup() {
    if (this.mounted) {
      this.setState({ showPopup: false });
    }
  }

  render() {
    const { children, className, disabled, sourceObject } = this.props;
    const customTooltipCss = {
      paddingRight: '4px', paddingLeft: '4px', maxWidth: '200px'
    };

    return (
      <div
        ref={this.setRef('wrapper')}
        className={className}
      >
        <div ref={this.setRef('buttonClickWrapper')} onClick={this.togglePopup} >
          { sourceObject }
        </div>
        {!disabled && this.state.showPopup && (
          <Tooltip
            fixed
            placement="right" // TODO: fix so placement can be set from property
            style={{...this.position, ...customTooltipCss}}
          >
            <div ref={this.setRef('insideClickWrapper')}>
              { children }
            </div>
          </Tooltip>
        )}
      </div>
    );
  }
}

TooltipMenu.propTypes = {
  className: PropTypes.string,
  disabled: PropTypes.bool,
  // An object that this tooltip menu should originate from
  sourceObject: PropTypes.object.isRequired,
};

TooltipMenu.defaultProps = {
  className: "",
  disabled: false,
};

export default TooltipMenu;
