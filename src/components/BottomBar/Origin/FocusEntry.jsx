import React from 'react';
import {
  MdCenterFocusStrong,
  MdFlashOn,
  MdFlight,
  MdMoreVert
} from 'react-icons/md';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
// eslint-disable-next-line import/no-webpack-loader-syntax
import Focus from 'svg-react-loader?name=Focus!../../../icons/focus.svg';

import HorizontalDelimiter from '../../common/HorizontalDelimiter/HorizontalDelimiter';
import InfoBox from '../../common/InfoBox/InfoBox';
import Button from '../../common/Input/Button/Button';
import Row from '../../common/Row/Row';
import SmallLabel from '../../common/SmallLabel/SmallLabel';
import SvgIcon from '../../common/SvgIcon/SvgIcon';
import TooltipMenu from '../../common/Tooltip/TooltipMenu';
import { useContextRefs } from '../../GettingStartedTour/GettingStartedContext';

import styles from './FocusEntry.scss';

function FocusEntry({
  name, identifier, onSelect, active, showNavigationButtons, closePopoverIfSet
}) {
  const luaApi = useSelector((state) => state.luaApi);
  function isActive() {
    return identifier === active;
  }

  function select(evt) {
    if (onSelect) {
      onSelect(identifier, evt);
    }
  }

  function keyboardSelect(evt) {
    if (evt.key === 'Enter' && onSelect) {
      onSelect(identifier, evt);
    }
  }

  const flyTo = (event) => {
    if (event.shiftKey) {
      luaApi.pathnavigation.flyTo(identifier, 0.0);
    } else {
      luaApi.pathnavigation.flyTo(identifier);
    }
    event.stopPropagation();
    closePopoverIfSet();
  };

  const zoomToFocus = (event) => {
    if (event.shiftKey) {
      luaApi.pathnavigation.createPath({
        TargetType: 'Node',
        Target: identifier,
        Duration: 0,
        PathType: 'Linear'
      });
    } else {
      luaApi.pathnavigation.createPath({
        TargetType: 'Node',
        Target: identifier,
        PathType: 'Linear'
      });
    }

    event.stopPropagation();
    closePopoverIfSet();
  };

  const fadeTo = async (event) => {
    event.stopPropagation();
    closePopoverIfSet();
    luaApi.pathnavigation.jumpTo(identifier);
  };

  const refs = useContextRefs();

  return (
    <div
      className={`${styles.entry} ${isActive() && styles.active}`}
      onClick={select}
      onKeyPress={keyboardSelect}
      key={name}
      role="button"
      ref={(el) => { refs.current[name] = el; }}
      tabIndex={0}
    >
      <span className={styles.title}>
        { name || identifier }
      </span>
      {showNavigationButtons && (
        <div className={styles.buttonContainer}>
          {isActive() && (
            <Button className={styles.quickAccessFlyTo} onClick={zoomToFocus} title="Zoom to">
              <MdCenterFocusStrong className={styles.buttonIcon} />
            </Button>
          )}
          <Button className={styles.quickAccessFlyTo} onClick={flyTo} title="Fly to">
            <MdFlight className={styles.buttonIcon} />
          </Button>
          <TooltipMenu
            sourceObject={<MdMoreVert className={styles.buttonIcon} />}
          >
            <SmallLabel className={styles.menuTopLabel}>{identifier}</SmallLabel>
            <HorizontalDelimiter />
            <Button className={styles.flyToButton} onClick={select} title="Focus">
              <Row>
                <SvgIcon className={styles.buttonIcon}><Focus /></SvgIcon>
                <span className={styles.menuButtonLabel}> Focus </span>
              </Row>
            </Button>
            <HorizontalDelimiter />
            <Button className={styles.flyToButton} onClick={flyTo} title="Fly to">
              <Row>
                <MdFlight className={styles.buttonIcon} />
                <span className={styles.menuButtonLabel}> Fly to </span>
              </Row>
            </Button>
            <Button className={styles.flyToButton} onClick={fadeTo} title="Jump to">
              <Row>
                <MdFlashOn className={styles.buttonIcon} />
                <span className={styles.menuButtonLabel}> Jump to </span>
              </Row>
            </Button>
            <Button className={styles.flyToButton} onClick={zoomToFocus} title="Zoom to">
              <Row>
                <MdCenterFocusStrong className={styles.buttonIcon} />
                <span className={styles.menuButtonLabel}> Zoom to / Frame </span>
                <InfoBox
                  text={`Focus on the target object by moving the camera in a straigt line
                  and rotate towards the object`}
                />
              </Row>
            </Button>
          </TooltipMenu>
        </div>
      )}
    </div>
  );
}

FocusEntry.propTypes = {
  closePopoverIfSet: PropTypes.func,
  identifier: PropTypes.string.isRequired,
  name: PropTypes.string,
  onSelect: PropTypes.func,
  active: PropTypes.string,
  showNavigationButtons: PropTypes.bool
};

FocusEntry.defaultProps = {
  closePopoverIfSet: () => {},
  name: undefined,
  onSelect: null,
  showNavigationButtons: false,
  active: ''
};

export default FocusEntry;
