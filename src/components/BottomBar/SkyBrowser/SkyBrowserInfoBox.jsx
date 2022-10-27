import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MaterialIcon from '../../common/MaterialIcon/MaterialIcon';
import Button from '../../common/Input/Button/Button';
import SkyBrowserTooltip from './SkyBrowserTooltip';
import styles from './SkyBrowserTooltip.scss';
import esaSkyLogo from './ESASKY.png';

function SkyBrowserInfoBox({
  icon, text, title, textUrl, ra, dec, fov, hasCelestialCoords
 }) {
  const [isPopupShowing, setIsPopupShowing] = React.useState(false);

  const ref = React.useRef(null);

  function position() {
    if (!ref.current) {
      return { top: '0px', left: '0px' };
    }
    const { top, left, right, bottom } = ref.current.getBoundingClientRect();
    return { top: `${top}`, left: `${right}`};
  }

  function openImageUrl(imageUrl) {
    const newWindow = window.open(imageUrl, '_blank', 'noopener,noreferrer');
    if (newWindow) newWindow.opener = null;
  }

  function togglePopup(e) {
    setIsPopupShowing(!isPopupShowing);
    if (!e) var e = window.event;
    e.cancelBubble = true;
    if (e.stopPropagation) e.stopPropagation();
  }

  function openEsaSky(ra, dec, fov) {
    let esaSkyUrl = "http://sky.esa.int/?target="+ra+"%"+dec+"&hips=DSS2+color&fov="+fov+"&cooframe=J2000&sci=true&lang=en";
    window.open(esaSkyUrl, "EsaSky");
  }

  const esaSkyButton = hasCelestialCoords ? (
    <Button
      onClick={() => {
        openEsaSky(ra, dec, fov)
      }}
      className={styles.tooltipButton} transparent small
    >
      <img src={esaSkyLogo} alt="EsaSky" style={{width:'100%'}} />
    </Button>
  ) : "";

  return (
    <span ref={(el) => ref.current = el}>
      <Button
        transparent
        small
        onClick={togglePopup}
      >
        <MaterialIcon icon={icon} style={{fontSize: '15px'}}/>
      </Button>
      {isPopupShowing && (
        <SkyBrowserTooltip
          placement="bottom-left"
          style={position()}
        >
          <span className={styles.tooltipTitle}>{ title }</span>
          {text}
          {textUrl !== "" && (
            <Button
              className={styles.tooltipButton}
              onClick={() => openImageUrl(textUrl)}
            >
              Read more
            </Button>
          )}
          { esaSkyButton }
        </SkyBrowserTooltip>
      )}
    </span>
  );
}

SkyBrowserInfoBox.propTypes = {
  icon: PropTypes.string,
  title: PropTypes.string.isRequired,
  text: PropTypes.string,
  textUrl: PropTypes.string
};

SkyBrowserInfoBox.defaultProps = {
  icon: 'help',
};

export default SkyBrowserInfoBox;
