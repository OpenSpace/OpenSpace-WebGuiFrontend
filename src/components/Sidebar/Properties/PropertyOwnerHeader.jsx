import React, { useEffect, useRef, useState } from 'react';
import {
  MdBuild, MdChevronRight, MdDelete, MdExpandMore, MdHelpOutline, MdLandscape, MdMoreVert
} from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
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
import {
  checkIfVisible,
  displayName,
  findEnabledPropertyUri,
  findFadePropertyUri,
  identifierFromUri,
  isGlobeBrowsingLayer,
  isSceneGraphNode
} from '../../../utils/propertyTreeHelpers';
import Button from '../../common/Input/Button/Button';
import Checkbox from '../../common/Input/Checkbox/Checkbox';
import Row from '../../common/Row/Row';
import SvgIcon from '../../common/SvgIcon/SvgIcon';
import TooltipMenu from '../../common/Tooltip/TooltipMenu';
import { useContextRefs } from '../../GettingStartedTour/GettingStartedContext';

import toggleHeaderStyles from '../../common/ToggleContent/ToggleHeader.scss';
import styles from './PropertyOwnerHeader.scss';

function PropertyOwnerHeader({
  expanded, metaAction, popOutAction, setExpanded, title, trashAction, uri
}) {
  const identifier = identifierFromUri(uri);
  const isSceneObject = isSceneGraphNode(uri);

  // Check for layers so we can change their visuals (e.g makes the titles of enabled
  // layers green and have different behavior on hover)
  const isLayer = isGlobeBrowsingLayer(uri);

  // 1 is positive => fading in, -1 negative => fading out. Undefined or 0 means no fading
  const [fadeDirection, setFadeDirection] = useState(0);
  // After checkbox click, check this value to keep track of whether the property owner
  // should be disabled once the fading
  const [shouldDisableAtFadeZero, setShouldDisableAtFadeZero] = useState(false);

  const luaApi = useSelector((state) => state.luaApi);

  const renderedTitle = useSelector((state) => (
    title || displayName(state, state.propertyTree.properties, uri)
  ));

  const fadeDuration = useSelector((state) => (
    state.propertyTree.properties[EngineFadeDurationKey]?.value || 1.0
  ));

  // Check if this property owner has a fade property, or a renderable with the property
  const fadeUri = useSelector((state) => findFadePropertyUri(state.propertyTree.properties, uri));
  const fadeValue = useSelector((state) => state.propertyTree.properties[fadeUri]?.value);
  const prevFadeValueRef = useRef(fadeValue);

  // Check if this property owner has an enabled property, or a renderable with the property
  const enabledUri = useSelector(
    (state) => findEnabledPropertyUri(state.propertyTree.properties, uri)
  );

  // Get the state for the rendered checkbox. Note that this does not exactly correspond to
  // the enabled property value, but may also include the fade
  const isVisible = useSelector((state) => checkIfVisible(state.propertyTree.properties, uri));

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
    if (shouldDisableAtFadeZero && isFadingOut && enabledUri && fadeValue < 0.0001) {
      property(enabledUri).set(false);
      setShouldDisableAtFadeZero(false);
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
    evt.stopPropagation();
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
      setShouldDisableAtFadeZero(true);
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
      <MdBuild />
      {' '}
      Quick access settings
    </Button>
  );

  const metaButton = (
    <Button className={styles.menuButton} onClick={metaClick}>
      <MdHelpOutline />
      {' '}
      Show object details
    </Button>
  );

  const trashButton = (
    <Button className={styles.menuButton} onClick={trashClick}>
      <MdDelete />
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
    <Button
      className={`${toggleHeaderStyles.toggle} ${isLayer && styles.layerHeader}`}
      onClick={onClick}
      ref={(el) => { refs.current[refName] = el; }}
      noChangeOnActive
    >
      <Row>
        {expanded ?
          <MdExpandMore className={toggleHeaderStyles.icon} /> :
          <MdChevronRight className={toggleHeaderStyles.icon} />}
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
          { isHeightLayer && <MdLandscape className={styles.heightLayerIcon} /> }
          { isLayer && <SvgIcon className={styles.layerDraggableIcon}><DraggableIcon /></SvgIcon> }
        </span>
        <span className={styles.rightButtonContainer}>
          { isSceneObject && focusButton }
          { hasMoreButtons && (
            <TooltipMenu
              className={styles.moreButton}
              sourceObject={<MdMoreVert />}
            >
              { popOutAction && popoutButton }
              { metaAction && metaButton }
              { trashAction && trashButton }
            </TooltipMenu>
          )}
        </span>
      </Row>
    </Button>
  );
}

PropertyOwnerHeader.propTypes = {
  expanded: PropTypes.bool.isRequired,
  setExpanded: PropTypes.func.isRequired,
  metaAction: PropTypes.func,
  popOutAction: PropTypes.func,
  title: PropTypes.string,
  trashAction: PropTypes.func,
  uri: PropTypes.string.isRequired
};

PropertyOwnerHeader.defaultProps = {
  metaAction: undefined,
  popOutAction: undefined,
  title: undefined,
  trashAction: undefined
};

export default PropertyOwnerHeader;
