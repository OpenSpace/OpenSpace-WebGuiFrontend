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

import {
  ApplyIdleBehaviorOnPathFinishKey,
  CameraPathArrivalDistanceFactorKey,
  CameraPathSpeedFactorKey
} from '../../../api/keys';
import Button from '../../common/Input/Button/Button';
import Popover from '../../common/Popover/Popover';
import Row from '../../common/Row/Row';
import SvgIcon from '../../common/SvgIcon/SvgIcon';
import ToggleContent from '../../common/ToggleContent/ToggleContent';
import TooltipMenu from '../../common/Tooltip/TooltipMenu';
import { useContextRefs } from '../../GettingStartedTour/GettingStartedContext';
import Property from '../../Sidebar/Properties/Property';

import styles from './FocusEntry.scss';

function FocusEntry({
  name, identifier, onSelect, active, showNavigationButtons, closePopoverIfSet
}) {
  const [isSettingsExpanded, setSettingsExpanded] = React.useState(false);

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
      luaApi.pathnavigation.zoomToFocus(0.0);
    } else {
      luaApi.pathnavigation.zoomToFocus();
    }
    event.stopPropagation();
    closePopoverIfSet();
  };

  const fadeTo = async (event) => {
    event.stopPropagation();
    const fadeTime = 1;
    const promise = new Promise((resolve) => {
      luaApi.setPropertyValueSingle('RenderEngine.BlackoutFactor', 0, fadeTime, 'QuadraticEaseOut');
      setTimeout(() => resolve('done!'), fadeTime * 1000);
    });
    await promise;
    luaApi.pathnavigation.flyTo(identifier, 0.0);
    luaApi.setPropertyValueSingle('RenderEngine.BlackoutFactor', 1, fadeTime, 'QuadraticEaseIn');
    event.stopPropagation();
    closePopoverIfSet();
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
          <Button onClick={flyTo} title="Fly to">
            <MdFlight className={styles.buttonIcon} />
          </Button>
          <TooltipMenu
            sourceObject={<MdMoreVert className={styles.buttonIcon} />}
          >
            <Button className={styles.flyToButton} onClick={select} title="Focus">
              <Row>
                <SvgIcon className={styles.buttonIcon}><Focus /></SvgIcon>
                <span className={styles.verticallyCentered}> Focus </span>
              </Row>
            </Button>
            <hr className={Popover.styles.delimiter} />
            <Button className={styles.flyToButton} onClick={flyTo} title="Fly to">
              <Row>
                <MdFlight className={styles.buttonIcon} />
                <span className={styles.verticallyCentered}> Fly to </span>
              </Row>
            </Button>
            <Button className={styles.flyToButton} onClick={fadeTo} title="Fade to">
              <Row>
                <MdFlashOn className={styles.buttonIcon} />
                <span className={styles.verticallyCentered}> Jump to </span>
              </Row>
            </Button>
            {/* TODO: Make it zoom to any node */}
            <Button className={styles.flyToButton} onClick={zoomToFocus} title="Zoom to">
              <Row>
                <MdCenterFocusStrong className={styles.buttonIcon} />
                <span className={styles.verticallyCentered}> Zoom to / Frame </span>
              </Row>
            </Button>
            <ToggleContent
              title="Camera Path Settings"
              expanded={isSettingsExpanded}
              setExpanded={setSettingsExpanded}
            >
              <Property uri={CameraPathSpeedFactorKey} />
              <Property uri={CameraPathArrivalDistanceFactorKey} />
              <Property uri={ApplyIdleBehaviorOnPathFinishKey} />
            </ToggleContent>
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
