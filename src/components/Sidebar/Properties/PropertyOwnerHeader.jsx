import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Checkbox from '../../common/Input/Checkbox/Checkbox';
import Focus from 'svg-react-loader?name=Focus!../../../icons/focus.svg';
import Button from '../../common/Input/Button/Button';
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
  title, identifier, expanded, getPropertyDispatcher, setExpanded, onIcon, offIcon,
  enabledUri, enabled, fadeDuration, fadeUri, fadeValue, isLayer, focusAction,
  shiftFocusAction, popOutAction, metaAction, trashAction, luaApi
}) {
  useEffect(() => {
    // Subscribe to the enabled property
    if (enabledUri) {
      getPropertyDispatcher(enabledUri).subscribe();
    }

    if (fadeUri) {
      getPropertyDispatcher(fadeUri).subscribe();
    }

    // returned function will be called on component unmount
    return () => {
      if (enabledUri) {
        getPropertyDispatcher(enabledUri).unsubscribe();
      }
      if (fadeUri) {
        getPropertyDispatcher(fadeUri).unsubscribe();
      }
    }
  });

  const onClick = (evt) => {
    setExpanded(!expanded);
  };

  const onClickFocus = (evt) => {
    if (evt.shiftKey && shiftFocusAction) {
      shiftFocusAction();
    } else if (focusAction) {
      focusAction();
    }
    evt.stopPropagation();
  };

  const onToggleCheckboxClick = (shouldBeChecked, event) => {
    if (!enabledUri) return;

    const holdingShift = event.getModifierState('Shift');
    const shouldNotFade = !fadeUri || (fadeDuration < 0.001) || holdingShift;

    if (shouldNotFade) {
      getPropertyDispatcher(enabledUri).set(shouldBeChecked);
      return;
    }

    const shouldFadeIn = shouldBeChecked;

    // If fade in, first set fade value to 0 to make sure it's fully hidden
    if (shouldFadeIn) {
      luaApi.setPropertyValueSingle(fadeUri, 0.0);
      luaApi.setPropertyValueSingle(fadeUri, 1.0, fadeDuration);
      getPropertyDispatcher(enabledUri).set(shouldBeChecked);
    }
    else { // fade out
      luaApi.setPropertyValueSingle(fadeUri, 0.0, fadeDuration);
      setTimeout(
        () => { getPropertyDispatcher(enabledUri).set(shouldBeChecked); },
        fadeDuration * 1000
      );
    }
  };

  const popoutClick = (evt) => {
    popOutAction();
    evt.stopPropagation();
  };

  const metaClick = (evt) => {
    metaAction();
    evt.stopPropagation();
  };

  const trashClick = (evt) => {
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

  let checkBoxFadeStyle = {}
  if (fadeUri && fadeValue > 0) {
    checkBoxFadeStyle = {opacity: fadeValue};
  }

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
              style={checkBoxFadeStyle}
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
    title: title || displayName(state, state.propertyTree.properties, uri),
    enabledUri,
    fadeUri,
    fadeValue,
    fadeDuration,
    enabled,
    isLayer,
    identifier,
    luaApi: state.luaApi,
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
