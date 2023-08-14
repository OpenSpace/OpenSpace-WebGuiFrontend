import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Icon } from '@iconify/react';
import PropTypes from 'prop-types';
/* eslint-disable import/no-webpack-loader-syntax */
import DraggableIcon from 'svg-react-loader?name=Aim!../../../icons/draggable_list.svg';
import Focus from 'svg-react-loader?name=Focus!../../../icons/focus.svg';

import {
  EngineFadeDurationKey,
  NavigationAimKey,
  NavigationAnchorKey,
  RetargetAnchorKey
} from '../../../api/keys';
import propertyDispatcher from '../../../api/propertyDispatcher';
import { displayName, isGlobeBrowsingLayer } from '../../../utils/propertyTreeHelpers';
import Button from '../../common/Input/Button/Button';
import Checkbox from '../../common/Input/Checkbox/Checkbox';
import Row from '../../common/Row/Row';
import SvgIcon from '../../common/SvgIcon/SvgIcon';
import TooltipMenu from '../../common/Tooltip/TooltipMenu';
import { useContextRefs } from '../../GettingStartedTour/GettingStartedContext';

import toggleHeaderStyles from '../../common/ToggleContent/ToggleHeader.scss';
import styles from './PropertyOwnerHeader.scss';

function PropertyOwnerHeader({
  expanded, metaAction, offIcon, onIcon, popOutAction, setExpanded, title, trashAction, uri
}) {
  const splitUri = uri.split('.');
  const identifier = splitUri.length > 1 && splitUri[1];
  const isRenderable = (splitUri.length > 1 && splitUri[splitUri.length - 1] === 'Renderable');
  const isSceneObject = (splitUri.length === 2 && splitUri[0] === 'Scene');

  // Check for layers so we can change their visuals (e.g makes the titles of enabled
  // layers green and have different behavior on hover)
  const isLayer = isGlobeBrowsingLayer(uri);

  // 1 is positive => fading in, -1 negative => fading out. Undefined or 0 means no fading
  const [fadeDirection, setFadeDirection] = useState(0);

  const luaApi = useSelector((state) => state.luaApi);

  const renderedTitle = useSelector((state) => (
    title || displayName(state, state.propertyTree.properties, uri)
  ));

  const fadeDuration = useSelector((state) => (
    state.propertyTree.properties[EngineFadeDurationKey]?.value || 1.0
  ));

  // Check if this property owner has a fade property, or a renderable with the property
  const fadeUri = useSelector((state) => {
    if (state.propertyTree.properties[`${uri}.Fade`] && !isRenderable) {
      return `${uri}.Fade`;
    }
    if (state.propertyTree.properties[`${uri}.Renderable.Fade`]) {
      return `${uri}.Renderable.Fade`;
    }
    return undefined;
  });

  const fadeValue = useSelector((state) => state.propertyTree.properties[fadeUri]?.value);
  const prevFadeValueRef = useRef(fadeValue);

  // Check if this property owner has an enabled property, or a renderable with the property
  const enabledUri = useSelector((state) => {
    if (state.propertyTree.properties[`${uri}.Enabled`] && !isRenderable) {
      return `${uri}.Enabled`;
    }
    if (state.propertyTree.properties[`${uri}.Renderable.Enabled`]) {
      return `${uri}.Renderable.Enabled`;
    }
    return undefined;
  });

  // Get the state for the rendered checkbox. Note that this does not exactly correspond to
  // the enabled property value
  const isVisible = useSelector((state) => {
    let enabled = state.propertyTree.properties[enabledUri]?.value;
    // Make fade == 0 correspond to disabled, according to the checkbox
    if (fadeUri && state.propertyTree.properties[fadeUri].value === 0) {
      enabled = false;
    }
    return enabled;
  });

  const dispatch = useDispatch();

  // Return the dispatcher object for the given property URI
  function property(propertyUri) {
    return propertyDispatcher(dispatch, propertyUri);
  }

  function focusAction() {
    propertyDispatcher(dispatch, NavigationAnchorKey).set(identifier);
    propertyDispatcher(dispatch, NavigationAimKey).set('');
    propertyDispatcher(dispatch, RetargetAnchorKey).set(null);
  }

  function shiftFocusAction() {
    propertyDispatcher(dispatch, NavigationAnchorKey).set(identifier);
    propertyDispatcher(dispatch, NavigationAimKey).set('');
  }

  useEffect(() => {
    if (fadeUri) {
      property(fadeUri).subscribe();
    }

    return () => {
      // unsubscribe on component unmount
      if (fadeUri) {
        property(fadeUri).unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    if (enabledUri) {
      property(enabledUri).subscribe();
    }

    return () => {
      // unsubscribe on component unmount
      if (enabledUri) {
        property(enabledUri).unsubscribe();
      }
    };
  }, []);

  // When fade value changes
  useEffect(() => {
    const prevFade = prevFadeValueRef.current;
    prevFadeValueRef.current = fadeValue;

    if (fadeValue && prevFade && prevFade !== fadeValue) {
      if (fadeValue > prevFade) {
        setFadeDirection(1); // fading in
      } else {
        setFadeDirection(-1); // fading out
      }
    } else {
      setFadeDirection(0);
    }

    // Disable after finished fading out
    const isFadingOut = fadeDirection < 0;
    if (fadeValue < 0.0001 && isFadingOut) {
    if (enabledUri && fadeValue < 0.0001 && isFadingOut) {
      property(enabledUri).set(false);
    }
  }, [fadeValue]);

  function onClick(e) {
    setExpanded(!expanded);
    e.currentTarget.blur();
  }

  function onClickFocus(evt) {
    evt.stopPropagation();
    if (!isSceneObject) { return; }

    if (evt.shiftKey) {
      shiftFocusAction();
    } else {
      focusAction();
    }
  }

  function onToggleCheckboxClick(shouldBeEnabled, event) {
    if (!enabledUri) return;

    const holdingShift = event.getModifierState('Shift');
    const shouldNotFade = !fadeUri || (fadeDuration < 0.001) || holdingShift;

    if (shouldNotFade) {
      property(enabledUri).set(shouldBeEnabled);
      if (fadeUri) {
        // Also set the fade value to 1
        property(fadeUri).set(1.0);
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
      property(enabledUri).set(true);
      luaApi.setPropertyValueSingle(fadeUri, 1.0, fadeDuration);
    } else { // fade out
      luaApi.setPropertyValueSingle(fadeUri, 0.0, fadeDuration);
    }
  }

  function popoutClick(evt) {
    popOutAction();
    evt.stopPropagation();
  }

  function metaClick(evt) {
    metaAction();
    evt.stopPropagation();
  }

  function trashClick(evt) {
    trashAction(identifier);
    evt.stopPropagation();
  }

  const focusButton = (
    <Button className={styles.rightButton} onClick={onClickFocus} small>
      <SvgIcon><Focus /></SvgIcon>
    </Button>
  );

  const popoutButton = (
    <Button className={styles.menuButton} onClick={popoutClick}>
      <Icon icon="material-symbols:build" />
      {' '}
      Quick access settings
    </Button>
  );

  const metaButton = (
    <Button className={styles.menuButton} onClick={metaClick}>
      <Icon icon="material-symbols:help-outline" />
      {' '}
      Show asset information
    </Button>
  );

  const trashButton = (
    <Button className={styles.menuButton} onClick={trashClick}>
      <Icon icon="material-symbols:delete" />
      {' '}
      Delete
    </Button>
  );

  // Headers look slightly different for globe browsing layers
  let titleClass = '';
  if (isLayer) {
    titleClass = isVisible ? styles.enabledLayerTitle : styles.disabledLayerTitle;
  }
  // And additionally for height layers
  const isHeightLayer = isLayer && enabledUri.includes('Layers.HeightLayers.');
  const refs = useContextRefs();

  let refName = `PropertyOwner ${renderedTitle}`;
  const titleNoSpaces = renderedTitle.replace(/\s/g, '');
  if (titleNoSpaces !== identifier) {
    refName += ` ${identifier}`;
  }

  const hasMoreButtons = (popOutAction || metaAction);
  const shouldFadeCheckbox = (fadeUri && fadeValue > 0.0);

  return (
    <header
      className={`${toggleHeaderStyles.toggle} ${isLayer && styles.layerHeader}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      ref={(el) => { refs.current[refName] = el; }}
    >
      <Row>
        <Icon
          icon={expanded ? onIcon : offIcon}
          className={toggleHeaderStyles.icon}
        />
        { enabledUri && (
          <span className={styles.leftButtonContainer}>
            <Checkbox
              className={styles.enabledCheckbox}
              wide={false}
              checked={isVisible}
              setChecked={onToggleCheckboxClick}
              style={shouldFadeCheckbox ? { opacity: fadeValue } : null}
            />
          </span>
        )}
        <span className={`${toggleHeaderStyles.title} ${styles.title} ${titleClass}`}>
          { renderedTitle }
          { isHeightLayer && <Icon className={styles.heightLayerIcon} icon="material-symbols:landscape" /> }
          { isLayer && <SvgIcon className={styles.layerDraggableIcon}><DraggableIcon /></SvgIcon> }
        </span>
        <span className={styles.rightButtonContainer}>
          { isSceneObject && focusButton }
          { hasMoreButtons && (
            <TooltipMenu
              sourceObject={<Icon icon="material-symbols:more-vert" />}
            >
              { popOutAction && popoutButton }
              { metaAction && metaButton }
              { trashAction && trashButton }
            </TooltipMenu>
          )}
        </span>
      </Row>
    </header>
  );
}

PropertyOwnerHeader.propTypes = {
  expanded: PropTypes.bool.isRequired,
  setExpanded: PropTypes.func.isRequired,
  metaAction: PropTypes.func,
  offIcon: PropTypes.string,
  onIcon: PropTypes.string,
  popOutAction: PropTypes.func,
  title: PropTypes.string,
  trashAction: PropTypes.func,
  uri: PropTypes.string.isRequired
};

PropertyOwnerHeader.defaultProps = {
  metaAction: undefined,
  offIcon: 'material-symbols:chevron-right',
  onIcon: 'material-symbols:expand-more',
  popOutAction: undefined,
  title: undefined,
  trashAction: undefined
};

export default PropertyOwnerHeader;
