import React from 'react';
import {
  MdCenterFocusStrong,
  MdFlashOn,
  MdFlight
} from 'react-icons/md';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
// eslint-disable-next-line import/no-webpack-loader-syntax
import Focus from 'svg-react-loader?name=Focus!../../../icons/focus.svg';

import InfoBox from '../../common/InfoBox/InfoBox';
import Button from '../../common/Input/Button/Button';
import Row from '../../common/Row/Row';
import SvgIcon from '../../common/SvgIcon/SvgIcon';

import styles from './NodeNavigationButton.scss';

const NavigationTypes = {
  jump: 'jump',
  fly: 'fly',
  focus: 'focus',
  frame: 'frame'
};

function NavigationButton({
  identifier, onFinish, showLabel, type
}) {
  const luaApi = useSelector((state) => state.luaApi);

  function focus(event) {
    // @TODO: Shift-click should focus without interpolation
    luaApi.setPropertyValueSingle('NavigationHandler.OrbitalNavigator.RetargetAnchor', null);
    luaApi.setPropertyValueSingle('NavigationHandler.OrbitalNavigator.Anchor', identifier);
    luaApi.setPropertyValueSingle('NavigationHandler.OrbitalNavigator.Aim', '');
    event.stopPropagation();
    onFinish();
  }

  const flyTo = (event) => {
    if (event.shiftKey) {
      luaApi.pathnavigation.flyTo(identifier, 0.0);
    } else {
      luaApi.pathnavigation.flyTo(identifier);
    }
    event.stopPropagation();
    onFinish();
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
    onFinish();
  };

  const fadeTo = async (event) => {
    event.stopPropagation();
    onFinish();
    luaApi.pathnavigation.jumpTo(identifier);
  };

  const buttonClass = showLabel ? styles.navButton : styles.smallNavButton;

  const content = {
    onClick: () => {},
    icon: <> </>,
    title: '',
    info: undefined
  };

  switch (type) {
    case NavigationTypes.jump:
      content.onClick = fadeTo;
      content.title = 'Jump to';
      content.icon = <MdFlashOn className={styles.buttonIcon} />;
      break;
    case NavigationTypes.focus:
      content.onClick = focus;
      content.title = 'Focus';
      content.icon = <SvgIcon className={styles.buttonIcon}><Focus /></SvgIcon>;
      break;
    case NavigationTypes.fly:
      content.onClick = flyTo;
      content.title = 'Fly to';
      content.icon = <MdFlight className={styles.buttonIcon} />;
      break;
    case NavigationTypes.frame:
      content.onClick = zoomToFocus;
      content.title = 'Zoom to / Frame';
      content.icon = <MdCenterFocusStrong className={styles.buttonIcon} />;
      content.info = `Focus on the target object by moving the camera in a straigt line
        and rotate towards the object`;
      break;
    default: break;
  }

  return (
    <Button className={buttonClass} onClick={content.onClick} title={content.title}>
      <Row>
        {content.icon}
        {showLabel && <span className={styles.label}>{content.title}</span>}
        {showLabel && content.info && <InfoBox text={content.info} />}
      </Row>
    </Button>
  );
}

NavigationButton.propTypes = {
  identifier: PropTypes.string.isRequired,
  onFinish: PropTypes.func,
  showLabel: PropTypes.bool,
  type: PropTypes.oneOf(Object.values(NavigationTypes)).isRequired
};

NavigationButton.defaultProps = {
  onFinish: () => {},
  showLabel: false
};

export default NavigationButton;
