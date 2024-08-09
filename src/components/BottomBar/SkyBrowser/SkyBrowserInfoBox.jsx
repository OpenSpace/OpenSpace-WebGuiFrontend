import React from 'react';
import { MdHelp } from 'react-icons/md';
import PropTypes from 'prop-types';

import { openUrl, stopEventPropagation } from '../../../utils/helpers';
import Button from '../../common/Input/Button/Button';

import esaSkyLogo from './ESASKY.png';
import SkyBrowserTooltip from './SkyBrowserTooltip';

import styles from './SkyBrowserTooltip.scss';

function SkyBrowserInfoBox({
  dec, fov, hasCelestialCoords, infoPlacement, ra, text, textUrl, title, ...props
}) {
  const [isPopupShowing, setIsPopupShowing] = React.useState(false);

  const ref = React.useRef(null);

  function position() {
    if (!ref.current) {
      return { top: '0px', left: '0px' };
    }
    const {
      top, right
    } = ref.current.getBoundingClientRect();
    return { top: `${top}`, left: `${right}` };
  }

  function togglePopup(e) {
    setIsPopupShowing(!isPopupShowing);
    stopEventPropagation(e);
  }

  function openEsaSky() {
    const esaSkyUrl = `http://sky.esa.int/?target=${ra}%${dec}&hips=DSS2+color&fov=${fov}&cooframe=J2000&sci=true&lang=en`;
    window.open(esaSkyUrl, 'EsaSky');
  }

  return (
    <span ref={ref} {...props}>
      <Button
        transparent
        small
        onClick={togglePopup}
      >
        <MdHelp style={{ fontSize: '15px' }} />
      </Button>
      {isPopupShowing && (
        <SkyBrowserTooltip
          placement={infoPlacement}
          style={position()}
        >
          <span className={styles.tooltipTitle}>{ title }</span>
          {text}
          {textUrl !== '' && (
            <Button
              className={styles.tooltipButton}
              onClick={() => openUrl(textUrl)}
            >
              Read more
            </Button>
          )}
          {hasCelestialCoords && (
            <Button
              onClick={() => { openEsaSky(); }}
              className={styles.tooltipButton}
              transparent
              small
            >
              <img src={esaSkyLogo} alt="EsaSky" style={{ width: '100%' }} />
            </Button>
          )}
        </SkyBrowserTooltip>
      )}
    </span>
  );
}

SkyBrowserInfoBox.defaultProps = {
  infoPlacement: 'bottom-left',
  dec: 0,
  fov: 0,
  ra: 0,
  text: '',
  textUrl: ''
};

SkyBrowserInfoBox.propTypes = {
  dec: PropTypes.number,
  fov: PropTypes.number,
  hasCelestialCoords: PropTypes.bool.isRequired,
  infoPlacement: PropTypes.string,
  ra: PropTypes.number,
  text: PropTypes.string,
  textUrl: PropTypes.string,
  title: PropTypes.string.isRequired
};

export default SkyBrowserInfoBox;
