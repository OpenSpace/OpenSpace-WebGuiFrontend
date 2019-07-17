import React from 'react';
import PropTypes from 'prop-types';
import styles from './PropertyOwnerHeader.scss';
import toggleHeaderStyles from './../../common/ToggleContent/ToggleHeader.scss';
import Button from '../../common/Input/Button/Button';
import MaterialIcon from '../../common/MaterialIcon/MaterialIcon';
import SvgIcon from '../../common/SvgIcon/SvgIcon';
import FocusIcon from 'svg-react-loader?name=Focus!../../../icons/focus.svg';
import { LayerGroupKeys, ScenePrefixKey } from '../../../api/keys';
import { displayName } from './PropertyOwner';
import Property from './Property';

import { connect } from 'react-redux';

import propertyDispatcher from '../../../api/propertyDispatcher';

import Focus from 'svg-react-loader?name=Focus!../../../icons/focus.svg';


import {
  NavigationAnchorKey,
  NavigationAimKey,
  RetargetAnchorKey,
} from '../../../api/keys';

let PropertyOwnerHeader = ({title, expanded, setExpanded, onIcon, offIcon, quickToggleUri, focusAction, shiftFocusAction, popOutAction, titleClass }) => {
  const onClick = (evt) => {
    setExpanded(!expanded)
  }

  const onClickFocus = (evt) => {
    if (evt.shiftKey && shiftFocusAction) {
      shiftFocusAction();
    } else if (focusAction) {
      focusAction();
    }
    evt.stopPropagation();
  }

  const popoutClick = (evt) => {
    popOutAction()
    evt.stopPropagation()
  }

  const popoutButton = (
      <div className={styles.rightButton} onClick={popoutClick}>
         <MaterialIcon icon="build"/>
      </div>
  )

  return <header className={toggleHeaderStyles.toggle} onClick={onClick} role="button" tabIndex={0}>
    <MaterialIcon
      icon={expanded ? onIcon : offIcon}
      className={toggleHeaderStyles.icon}
    />
    { quickToggleUri &&
        <span className={styles.leftButtonContainer}>
          <Property uri={quickToggleUri} checkBoxOnly={true} />
        </span>
    }
    <span className={`${toggleHeaderStyles.title} ${titleClass}`} >
      { title }
    </span>
    <span className={styles.rightButtonContainer}>
      { focusAction &&
        <div className={styles.rightButton} onClick={onClickFocus}>
        <SvgIcon><Focus/></SvgIcon>
        </div>
      }
      {
        popOutAction && popoutButton
      } 
    </span>
  </header>
}

const mapStateToProps = (state, ownProps) => {
  const { uri, title } = ownProps;

  let quickToggleUri = undefined;

  const splitUri = uri.split('.');
  const isRenderable = splitUri.length > 1 && splitUri[splitUri.length - 1] === 'Renderable';

  if (state.propertyTree.properties[uri + '.Enabled'] && !isRenderable) {
    quickToggleUri = uri + '.Enabled';
  } else if (state.propertyTree.properties[uri + '.Renderable.Enabled']) {
    quickToggleUri = uri + '.Renderable.Enabled';
  }
  //check for layers so we can make the titles green
  var isLayer = false;
  LayerGroupKeys.forEach( (layerGroup) => {
    if ( (uri.indexOf(layerGroup) > -1) && !(uri.endsWith(layerGroup)) ) {
      isLayer = true;
    }
  });
  let isHeightLayer = quickToggleUri && (quickToggleUri.lastIndexOf('HeightLayers') > 0);
  var titleClass = "";
  var enabled = quickToggleUri && state.propertyTree.properties[quickToggleUri].value;
  if (isLayer) {
      if (enabled) {
        titleClass = styles.greenTitle;
      } else if (isHeightLayer) {
        //make height layers visually distinguishable from other layers
        //specificlly color layers where they might have the same name
        titleClass = styles.grayTitle;
      }
  }

  return {
    title: title || displayName(state, uri),
    quickToggleUri,
    titleClass,
  };
}

const mapDispatchToProps = (dispatch, ownProps) => {
  const { uri } = ownProps;
  const splitUri = uri.split('.');
  if (splitUri.length === 2 && splitUri[0] === ScenePrefixKey) {
    return {
      focusAction: () => {
        propertyDispatcher(dispatch, NavigationAnchorKey).set(splitUri[1]);
        propertyDispatcher(dispatch, NavigationAimKey).set('');
        propertyDispatcher(dispatch, RetargetAnchorKey).set(null);
      },
      shiftFocusAction: () => {
        propertyDispatcher(dispatch, NavigationAnchorKey).set(splitUri[1]);
        propertyDispatcher(dispatch, NavigationAimKey).set('');
      }
    }
  } else {
    return {};
  }
};

PropertyOwnerHeader = connect(
  mapStateToProps,
  mapDispatchToProps
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
