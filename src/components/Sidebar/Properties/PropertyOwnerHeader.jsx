import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
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
  NavigationAnchorKey,
  NavigationAimKey,
  RetargetAnchorKey,
} from '../../../api/keys';
import { isGlobeBrowsingLayer } from '../../../utils/propertyTreeHelpers';

function PropertyOwnerHeader({
  title, identifier, expanded, setExpanded, onIcon, offIcon,
  quickToggleUri, enabled, isLayer, focusAction, shiftFocusAction,
  popOutAction, metaAction, trashAction
}) {

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

  const popoutButton = (
    <div className={styles.rightButton} onClick={popoutClick}>
      <MaterialIcon icon="build" />
    </div>
  );

  const metaButton = (
    <div className={styles.rightButton} onClick={metaClick}>
      <MaterialIcon icon="help_outline" />
    </div>
  );

  const trashButton = (
    <div className={styles.rightButton} onClick={trashClick}>
      <MaterialIcon icon="delete" />
    </div>
  );

  // Headers look slightly different for globe browsing layers
  let titleClass = '';
  if (isLayer) {
    titleClass = enabled ? styles.enabledLayerTitle : styles.disabledLayerTitle;
  }
  // And additionally for height layers
  const isHeightLayer = isLayer && quickToggleUri.includes('Layers.HeightLayers.');

  const onToggleCheckboxClick = () => {
    console.log('changed the checkbox');
    // if (!canFade) return;
    this.props.dispatcher.set(value);
  };

  return (
    <header
      className={`${toggleHeaderStyles.toggle} ${isLayer && styles.layerHeader}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <MaterialIcon
        icon={expanded ? onIcon : offIcon}
        className={toggleHeaderStyles.icon}
      />
      { quickToggleUri && (
        <span className={styles.leftButtonContainer}>
          <Checkbox
            wide={false}
            checked={true} // TODO: should control the property value
            label={null}
            setChecked={onToggleCheckboxClick}
          />
        </span>
        )
      }
      <span className={`${toggleHeaderStyles.title} ${titleClass}`}>
        { title }
        { isHeightLayer && <MaterialIcon className={styles.heightLayerIcon} icon="landscape" /> }
        { isLayer && <SvgIcon className={styles.layerDraggableIcon}><DraggableIcon /></SvgIcon> }
      </span>
      <span className={styles.rightButtonContainer}>
        { focusAction && (
          <div className={styles.rightButton} onClick={onClickFocus}>
            <SvgIcon><Focus /></SvgIcon>
          </div>
          )
        }
        {
          popOutAction && popoutButton
        }
        {
          metaAction && metaButton
        }
        {
          trashAction && trashButton
        }
      </span>
    </header>
  );
};

const mapStateToProps = (state, ownProps) => {
  const { uri, title } = ownProps;

  const splitUri = uri.split('.');
  const isRenderable = splitUri.length > 1 && splitUri[splitUri.length - 1] === 'Renderable';

  const identifier = splitUri.length > 1 && splitUri[1];

  let quickToggleUri;
  let canFade = false;
  if (state.propertyTree.properties[`${uri}.Enabled`] && !isRenderable) {
    quickToggleUri = `${uri}.Enabled`;
  } else if (state.propertyTree.properties[`${uri}.Renderable.Enabled`]) {
    quickToggleUri = `${uri}.Renderable.Enabled`;
    // Check if this property can be faded
    canFade = state.propertyTree.properties[`${uri}.Renderable.Fade`] !== undefined;
  }

  const enabled = quickToggleUri && state.propertyTree.properties[quickToggleUri].value;

  // Check for layers so we can change their visuals (e.g makes the titles of enabled
  // layers green and have different behavior on hover)
  const isLayer = isGlobeBrowsingLayer(uri);

  return {
    title: title || displayName(state, uri),
    quickToggleUri,
    enabled,
    isLayer,
    identifier,
    canFade,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const { uri } = ownProps;
  const splitUri = uri.split('.');
  if (splitUri.length === 2 && splitUri[0] === 'Scene') {
    return {
      focusAction: () => {
        propertyDispatcher(dispatch, NavigationAnchorKey).set(splitUri[1]);
        propertyDispatcher(dispatch, NavigationAimKey).set('');
        propertyDispatcher(dispatch, RetargetAnchorKey).set(null);
      },
      shiftFocusAction: () => {
        propertyDispatcher(dispatch, NavigationAnchorKey).set(splitUri[1]);
        propertyDispatcher(dispatch, NavigationAimKey).set('');
      },
    };
  }
  return {};
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
