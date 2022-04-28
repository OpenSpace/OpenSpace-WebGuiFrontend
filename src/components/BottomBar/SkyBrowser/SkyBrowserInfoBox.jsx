import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { times } from 'lodash';
import MaterialIcon from '../../common/MaterialIcon/MaterialIcon';
import Button from '../../common/Input/Button/Button';
import SkyBrowserTooltip from './SkyBrowserTooltip';
import styles from './SkyBrowserTooltip.scss';
import esaSkyLogo from './ESASKY.png';

class InfoBoxSkyBrowser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isPopupShowing: false,
      tooltipActive: false
    };

    this.setRef = this.setRef.bind(this);
    this.tooltipActive = this.tooltipActive.bind(this);
    this.checkIfTooltipActive = this.checkIfTooltipActive.bind(this);
    this.togglePopup = this.togglePopup.bind(this);
    this.openImageUrl = this.openImageUrl.bind(this);
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
    this.openEsaSky = this.openEsaSky.bind(this);
  }

  setRef(what) {
    return (element) => {
      this[what] = element;
    };
  }

  get position() {
    if (!this.wrapper) {
      return { top: '0px', left: '0px' };
    }
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
    if (!this.state.tooltipActive) {
      this.hidePopup();
    }
  }

  togglePopup(e) {
    this.setState({ isPopupShowing: !this.state.isPopupShowing });
    if (!e) var e = window.event;
    e.cancelBubble = true;
    if (e.stopPropagation) e.stopPropagation();
  }

  openEsaSky(ra, dec, fov) {
    let esaSkyUrl = "http://sky.esa.int/?target="+ra+"%"+dec+"&hips=DSS2+color&fov="+fov+"&cooframe=J2000&sci=true&lang=en";
    window.open(esaSkyUrl, "EsaSky");
  }

  render() {
    const { icon, text, title, textUrl, ra, dec, fov} = this.props;
    const { isPopupShowing } = this.state;
    const esaSkyButton = (
      <Button onClick={() => {this.openEsaSky(ra,dec,fov)}} className={styles.tooltipButton} transparent small>
        <img src={esaSkyLogo} alt="EsaSky" style={{width:'100%'}} />
      </Button>
    );

    return (
      <span ref={this.setRef('wrapper')}>
        <Button
          transparent
          small
          onClick={this.togglePopup}
        >
          <MaterialIcon icon={icon} style={{fontSize: '15px'}}/>
        </Button>
        {isPopupShowing && (
          <SkyBrowserTooltip
            placement="bottom-left"
            style={this.position}
          >
            <span className={styles.tooltipTitle}>{ title }</span>
            {text}
            {text && (
              <Button className={styles.tooltipButton} onClick={ () => this.openImageUrl(textUrl) }>
                Read more
              </Button>
            )}
            { esaSkyButton }
          </SkyBrowserTooltip>
        )}
      </span>
    );
  }
}

InfoBoxSkyBrowser.propTypes = {
  icon: PropTypes.string,
  title: PropTypes.string.isRequired,
  text: PropTypes.string,
  textUrl: PropTypes.string
};

InfoBoxSkyBrowser.defaultProps = {
  icon: 'help',
};

export default InfoBoxSkyBrowser;
