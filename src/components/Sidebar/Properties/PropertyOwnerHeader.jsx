import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Button from '../../common/Input/Button/Button';
import Checkbox from '../../common/Input/Checkbox/Checkbox';
import Focus from 'svg-react-loader?name=Focus!../../../icons/focus.svg';
import DraggableIcon from 'svg-react-loader?name=Aim!../../../icons/draggable_list.svg';
import styles from './PropertyOwnerHeader.scss';
import toggleHeaderStyles from '../../common/ToggleContent/ToggleHeader.scss';
import MaterialIcon from '../../common/MaterialIcon/MaterialIcon';
import SvgIcon from '../../common/SvgIcon/SvgIcon';
import { displayName } from './PropertyOwner';
import propertyDispatcher from '../../../api/propertyDispatcher';
import {
  Engine_FadeDurationKey,
  NavigationAnchorKey,
  NavigationAimKey,
  RetargetAnchorKey,
} from '../../../api/keys';
import { isGlobeBrowsingLayer } from '../../../utils/propertyTreeHelpers';
import { useContextRefs } from '../../GettingStartedTour/GettingStartedContext';
import Row from '../../common/Row/Row';
import TooltipMenu from '../../common/Tooltip/TooltipMenu';

function PropertyOwnerHeader({
  enabled, enabledUri, expanded, fadeDuration, fadeUri, fadeValue, focusAction,
  getPropertyDispatcher, identifier, isLayer, luaApi, metaAction,  offIcon, onIcon,
  popOutAction, setExpanded, shiftFocusAction, title, trashAction
}) {
  // 1 is positive => fading in, -1 negative => fading out. Undefined or 0 means no fading
  const [fadeDirection, setFadeDirection] = React.useState(0);
  const prevFadeValueRef = useRef(fadeValue);

  useEffect(() => {
    if (!fadeUri) { return; }

    getPropertyDispatcher(fadeUri).subscribe();
    return () => {
      // unsubscribe on component unmount
      getPropertyDispatcher(fadeUri).unsubscribe();
    }
  }, []);

  useEffect(() => {
    if (!enabledUri) { return; }

    getPropertyDispatcher(enabledUri).subscribe();
    return () => {
      // unsubscribe on component unmount
      getPropertyDispatcher(enabledUri).unsubscribe();
    }
  }, []);

  // When fade value changes
  useEffect(() => {
    const prevFade = prevFadeValueRef.current;
    prevFadeValueRef.current = fadeValue;

    if (fadeValue && prevFade && prevFade !== fadeValue) {
      if (fadeValue > prevFade) {
        setFadeDirection(1); // fading in
      }
      else {
        setFadeDirection(-1); // fading out
        // Disable after finished fading out
        if (fadeValue < 0.0001) {
          getPropertyDispatcher(enabledUri).set(false);
        }
      }
    }
    else {
      setFadeDirection(0);
    }
  }, [fadeValue])

  function onClick(evt) {
    setExpanded(!expanded);
  };

  function onClickFocus(evt) {
    if (evt.shiftKey && shiftFocusAction) {
      shiftFocusAction();
    } else if (focusAction) {
      focusAction();
    }
    evt.stopPropagation();
  };

  function onToggleCheckboxClick(shouldBeEnabled, event) {
    if (!enabledUri) return;

    const holdingShift = event.getModifierState('Shift');
    const shouldNotFade = !fadeUri || (fadeDuration < 0.001) || holdingShift;

    if (shouldNotFade) {
      getPropertyDispatcher(enabledUri).set(shouldBeEnabled);
      if (fadeUri) {
      // Also set the fade value to 1
        getPropertyDispatcher(fadeUri).set(1.0);
      }
      setFadeDirection(0);
      return;
    }

    const isFadingIn = fadeDirection > 0;
    const isFadingOut = fadeDirection < 0;
    const shouldFadeIn = isFadingOut || (shouldBeEnabled && !isFadingIn);

    if (shouldFadeIn) {
      if (!isFadingOut) {
        // If not in mid fade, fade out the thing before fading in
        luaApi.setPropertyValueSingle(fadeUri, 0.0);
      }
      // Enable the thing immediately so we see the visual changes
      getPropertyDispatcher(enabledUri).set(true);
      luaApi.setPropertyValueSingle(fadeUri, 1.0, fadeDuration);
    }
    else { // fade out
      luaApi.setPropertyValueSingle(fadeUri, 0.0, fadeDuration);
    }
  };

  function popoutClick(evt) {
    popOutAction();
    evt.stopPropagation();
  };

  function metaClick(evt) {
    metaAction();
    evt.stopPropagation();
  };

  function trashClick(evt) {
    trashAction(identifier);
    evt.stopPropagation();
  };

  const focusButton = (
    <div className={styles.rightButton} onClick={onClickFocus}>
      <SvgIcon><Focus /></SvgIcon>
    </div>
  );

  const moreButtonsButton = (
    <div className={styles.rightButton} >
      <MaterialIcon icon={"more_vert"} />
    </div>
  );

  const popoutButton = (
    <Button className={styles.menuButton} onClick={popoutClick}>
      <MaterialIcon icon={"build"} /> Quick access settings
    </Button>
  );

  const metaButton = (
    <Button className={styles.menuButton} onClick={metaClick}>
      <MaterialIcon icon={"help_outline"} /> Show asset information
    </Button>
  );

  const trashButton = (
    <Button className={styles.menuButton} onClick={trashClick}>
      <MaterialIcon icon={"delete"} /> Delete
    </Button>
  );

  // Headers look slightly different for globe browsing layers
  let titleClass = '';
  if (isLayer) {
    titleClass = enabled ? styles.enabledLayerTitle : styles.disabledLayerTitle;
  }
  // And additionally for height layers
  const isHeightLayer = isLayer && enabledUri.includes('Layers.HeightLayers.');
  const refs = useContextRefs();

  let refName = "PropertyOwner " + title;
  const titleNoSpaces = title.replace(/\s/g, '');
  if (titleNoSpaces !== identifier) {
    refName += " " + identifier;
  }

  const hasMoreButtons = (popOutAction || metaAction);
  const shouldFadeCheckbox = (fadeUri && fadeValue > 0.0)

  return (
    <header
      className={`${toggleHeaderStyles.toggle} ${isLayer && styles.layerHeader}`}
      onClick={onClick}
      role={"button"}
      tabIndex={0}
      ref={el => refs.current[refName] = el}
    >
      <Row>
        <MaterialIcon
          icon={expanded ? onIcon : offIcon}
          className={toggleHeaderStyles.icon}
        />
        { enabledUri &&
          <span className={styles.leftButtonContainer}>
            <Checkbox
              className={styles.enabledCheckbox}
              wide={false}
              checked={enabled}
              label={null}
              setChecked={onToggleCheckboxClick}
              style={shouldFadeCheckbox ? { opacity: fadeValue } : null}
            />
          </span>
        }
        <span className={`${toggleHeaderStyles.title} ${styles.title} ${titleClass}`}>
          { title }
          { isHeightLayer && <MaterialIcon className={styles.heightLayerIcon} icon={"landscape"} /> }
          { isLayer && <SvgIcon className={styles.layerDraggableIcon}><DraggableIcon /></SvgIcon> }
        </span>
        <span className={styles.rightButtonContainer}>
          { focusAction && focusButton }
          { hasMoreButtons &&
            <TooltipMenu
              sourceObject={moreButtonsButton}
            >
              { popOutAction && popoutButton }
              { metaAction && metaButton }
              { trashAction && trashButton }
            </TooltipMenu>
           }
        </span>
      </Row>
    </header>
  );
};

const mapStateToProps = (state, ownProps) => {
  const { uri, title } = ownProps;

  const splitUri = uri.split('.');
  const isRenderable = splitUri.length > 1 && splitUri[splitUri.length - 1] === 'Renderable';

  const identifier = splitUri.length > 1 && splitUri[1];

  // Check for layers so we can change their visuals (e.g makes the titles of enabled
  // layers green and have different behavior on hover)
  const isLayer = isGlobeBrowsingLayer(uri);

  // Check if this property owner has an enabled property, or a renderable with the property
  let enabledUri = undefined;
  if (state.propertyTree.properties[`${uri}.Enabled`] && !isRenderable) {
    enabledUri = `${uri}.Enabled`;
  } else if (state.propertyTree.properties[`${uri}.Renderable.Enabled`]) {
    enabledUri = `${uri}.Renderable.Enabled`;
  }
  let enabled = enabledUri && state.propertyTree.properties[enabledUri].value;

  // Check if this property owner has a fade property, or a renderable with the property
  let fadeUri = undefined;
  if (state.propertyTree.properties[`${uri}.Fade`] && !isRenderable) {
    fadeUri = `${uri}.Fade`;
  } else if (state.propertyTree.properties[`${uri}.Renderable.Fade`]) {
    fadeUri = `${uri}.Renderable.Fade`;
  }
  let fadeValue = state.propertyTree.properties[fadeUri]?.value;

  // Make fade == 0 correspond to disabled, according to the checkbox
  if (fadeUri && state.propertyTree.properties[fadeUri].value === 0) {
    enabled = false;
  }

  const fadeDuration = state.propertyTree.properties[Engine_FadeDurationKey]?.value || 1.0;

  return {
    enabled,
    enabledUri,
    fadeDuration,
    fadeValue,
    fadeUri,
    identifier,
    isLayer,
    luaApi: state.luaApi,
    title: title || displayName(state, state.propertyTree.properties, uri),
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const { uri } = ownProps;
  const splitUri = uri.split('.');

  const identifier = splitUri[1];

  let focusAction = undefined;
  let shiftFocusAction = undefined;

  if (splitUri.length === 2 && splitUri[0] === 'Scene') {
    focusAction = () => {
      propertyDispatcher(dispatch, NavigationAnchorKey).set(identifier);
      propertyDispatcher(dispatch, NavigationAimKey).set('');
      propertyDispatcher(dispatch, RetargetAnchorKey).set(null);
    },
    shiftFocusAction = () => {
      propertyDispatcher(dispatch, NavigationAnchorKey).set(identifier);
      propertyDispatcher(dispatch, NavigationAimKey).set('');
    }
  }
  return {
    getPropertyDispatcher: (uri) => {
      return propertyDispatcher(dispatch, uri)
    },
    focusAction,
    shiftFocusAction
  };
};

PropertyOwnerHeader = connect(
  mapStateToProps,
  mapDispatchToProps,
)(PropertyOwnerHeader);


PropertyOwnerHeader.propTypes = {
  expanded: PropTypes.bool.isRequired,
  setExpanded: PropTypes.func.isRequired,
  uri: PropTypes.string.isRequired,
  offIcon: PropTypes.string,
  onIcon: PropTypes.string,
};

PropertyOwnerHeader.defaultProps = {
  properties: [],
  subowners: [],
  offIcon: 'chevron_right',
  onIcon: 'expand_more',
};

export default PropertyOwnerHeader;
