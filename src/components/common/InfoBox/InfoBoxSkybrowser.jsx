import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MaterialIcon from '../MaterialIcon/MaterialIcon';
import TooltipSkybrowser from '../Tooltip/TooltipSkybrowser';
import styles from '../Tooltip/TooltipSkybrowser.scss';
import Button from '../../common/Input/Button/Button';
import { times } from 'lodash';


class InfoBoxSkybrowser extends Component {
  constructor(props) {
    super(props);
    this.state = { showPopup: false, tooltipActive: false};
    this.setRef = this.setRef.bind(this);
    this.tooltipActive = this.tooltipActive.bind(this);
    this.checkIfTooltipActive = this.checkIfTooltipActive.bind(this);
    this.showPopup = this.showPopup.bind(this);
    this.hidePopup = this.hidePopup.bind(this);
    this.openImageUrl = this.openImageUrl.bind(this);
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
  }


  setRef(what) {
    return (element) => {
      this[what] = element;
    };
  }

  get position() {
    if (!this.wrapper) return { top: '0px', left: '0px' };
    const { top, left, right, bottom } = this.wrapper.getBoundingClientRect();
    return { top: `${top}`, left: `${right}`};
  }

  openImageUrl(imageUrl) {
    const newWindow = window.open(imageUrl, '_blank', 'noopener,noreferrer');
    if (newWindow) newWindow.opener = null;
  }

  handleOutsideClick(evt) {
    if (this.wrapper && !this.wrapper.contains(evt.target)) {
      this.hidePopup();
    }
  }

  tooltipActive() {
    this.setState({ tooltipActive: !this.state.tooltipActive });
  }

  checkIfTooltipActive() {
    if(!this.state.tooltipActive) {
        this.hidePopup();
    }
  }
  
  showPopup() {
    this.setState({ showPopup: !this.state.showPopup });
  }

  hidePopup() {
    this.setState({ showPopup: false, tooltipActive: false});
  }

  render() {
    const { icon, text, title, textUrl} = this.props;
    const { showPopup } = this.state;
    return (
      <span ref={this.setRef('wrapper')}>
        <MaterialIcon
        icon={icon}
        onMouseEnter={this.showPopup}
        onMouseLeave={() => setTimeout(this.checkIfTooltipActive, 500)}
        style={{fontSize: '15px'}}>
        </MaterialIcon>
            { showPopup && (
                <TooltipSkybrowser
                placement="bottom-left"
                style={this.position}
                onMouseEnter={this.tooltipActive}
                onMouseLeave={this.hidePopup}>
                <span className={styles.tooltipTitle}> { title } </span>
                { text }
                { text && (
                    <Button className={styles.tooltipButton} onClick={ () => this.openImageUrl(textUrl) }>
                    Discover more
                    </Button>
                )}
                </TooltipSkybrowser>
            )}
      </span>
    );
  }
}

InfoBoxSkybrowser.propTypes = {
  icon: PropTypes.string,
  title: PropTypes.string.isRequired,
  text: PropTypes.string,
  textUrl: PropTypes.string
};

InfoBoxSkybrowser.defaultProps = {
  icon: 'help',
};

export default InfoBoxSkybrowser;
