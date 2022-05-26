import React, { Component } from 'react';
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

class PropertyOwnerHeader extends Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
    this.onClickFocus = this.onClickFocus.bind(this);
    this.popoutClick = this.popoutClick.bind(this);
    this.metaClick = this.metaClick.bind(this);
    this.trashClick = this.trashClick.bind(this);
    this.onToggleCheckboxClick = this.onToggleCheckboxClick.bind(this);
  }

  componentDidMount() {
    const { quickToggleUri } = this.props;
    if (quickToggleUri) {
      this.props.getPropertyDispatcher(quickToggleUri).subscribe();
    }
  }

  componentWillUnmount() {
    const { quickToggleUri } = this.props;
    if (quickToggleUri) {
      this.props.getPropertyDispatcher(quickToggleUri).unsubscribe();
    }
  }

  onClick = (evt) => {
    this.props.setExpanded(!this.props.expanded);
  };

  onClickFocus = (evt) => {
    if (evt.shiftKey && this.props.shiftFocusAction) {
      this.props.shiftFocusAction();
    } else if (this.props.focusAction) {
      this.props.focusAction();
    }
    evt.stopPropagation();
  };

  popoutClick = (evt) => {
    this.props.popOutAction();
    evt.stopPropagation();
  };

  metaClick = (evt) => {
    this.props.metaAction();
    evt.stopPropagation();
  };

  trashClick = (evt) => {
    this.props.trashAction(this.props.identifier);
    evt.stopPropagation();
  };

  onToggleCheckboxClick = (shouldBeChecked) => {
    const { fadeUri, luaApi, quickToggleUri } = this.props;
    if (!quickToggleUri) return;

    // Should not fade
    if (!fadeUri) {
      this.props.getPropertyDispatcher(quickToggleUri).set(shouldBeChecked);
      return;
    }

    // TODO: make this a property in the Engine
    const FadeDuration = 0.5; //seconds
    const shouldFadeIn = shouldBeChecked;

    // If fade in, first set fade value to 0 to make sure it's fully hidden
    if (shouldFadeIn) {
      luaApi.setPropertyValueSingle(fadeUri, 0.0);
      luaApi.setPropertyValueSingle(fadeUri, 1.0, FadeDuration);
      this.props.getPropertyDispatcher(quickToggleUri).set(shouldBeChecked);
    }
    else {
      luaApi.setPropertyValueSingle(fadeUri, 0.0, FadeDuration);
      setTimeout(() => {
        this.props.getPropertyDispatcher(quickToggleUri).set(shouldBeChecked);
      }, FadeDuration * 1000);
    }
  };

  render() {
    const {
      enabled,
      expanded,
      isLayer,
      onIcon,
      offIcon,
      title,
      quickToggleUri
    } = this.props;

    const popoutButton = (
      <div className={styles.rightButton} onClick={this.popoutClick}>
        <MaterialIcon icon="build" />
      </div>
    );
  
    const metaButton = (
      <div className={styles.rightButton} onClick={this.metaClick}>
        <MaterialIcon icon="help_outline" />
      </div>
    );
  
    const trashButton = (
      <div className={styles.rightButton} onClick={this.trashClick}>
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

    return (
      <header
        className={`${toggleHeaderStyles.toggle} ${isLayer && styles.layerHeader}`}
        onClick={this.onClick}
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
              checked={enabled}
              label={null}
              setChecked={this.onToggleCheckboxClick}
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
          { this.props.focusAction && (
            <div className={styles.rightButton} onClick={this.onClickFocus}>
              <SvgIcon><Focus /></SvgIcon>
            </div>
            )
          }
          {
            this.props.popOutAction && popoutButton
          }
          {
            this.props.metaAction && metaButton
          }
          {
            this.props.trashAction && trashButton
          }
        </span>
      </header>
    );
  }
};

const mapStateToProps = (state, ownProps) => {
  const { uri, title } = ownProps;

  const splitUri = uri.split('.');
  
  const identifier = splitUri.length > 1 && splitUri[1];

  // Check for layers so we can change their visuals (e.g makes the titles of enabled
  // layers green and have different behavior on hover)
  const isLayer = isGlobeBrowsingLayer(uri);

  let quickToggleUri;
  let fadeUri = undefined;
  const isRenderable = splitUri.length > 1 && splitUri[splitUri.length - 1] === 'Renderable';
  if (state.propertyTree.properties[`${uri}.Enabled`] && !isRenderable) {
    quickToggleUri = `${uri}.Enabled`;
  } else if (state.propertyTree.properties[`${uri}.Renderable.Enabled`]) {
    quickToggleUri = `${uri}.Renderable.Enabled`;
  }

  // Check if this property owner has a renderable that can be faded
  if (state.propertyTree.properties[`${uri}.Renderable.Fade`] !== undefined)  {
    fadeUri = `${uri}.Renderable.Fade`;
  }

  const enabled = quickToggleUri && state.propertyTree.properties[quickToggleUri].value;

  return {
    title: title || displayName(state, uri),
    quickToggleUri,
    fadeUri,
    enabled,
    isLayer,
    identifier,
    luaApi: state.luaApi,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const { uri } = ownProps;
  const splitUri = uri.split('.');

  let focusAction = undefined;
  let shiftFocusAction = undefined;

  if (splitUri.length === 2 && splitUri[0] === 'Scene') {
    focusAction = () => {
      propertyDispatcher(dispatch, NavigationAnchorKey).set(splitUri[1]);
      propertyDispatcher(dispatch, NavigationAimKey).set('');
      propertyDispatcher(dispatch, RetargetAnchorKey).set(null);
    };
    shiftFocusAction = () => {
      propertyDispatcher(dispatch, NavigationAnchorKey).set(splitUri[1]);
      propertyDispatcher(dispatch, NavigationAimKey).set('');
    };
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
