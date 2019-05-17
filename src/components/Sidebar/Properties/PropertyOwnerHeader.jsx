import React from 'react';
import PropTypes from 'prop-types';
import styles from './PropertyOwnerHeader.scss';
import toggleHeaderStyles from './../../common/ToggleContent/ToggleHeader.scss';
import Button from '../../common/Input/Button/Button';
import MaterialIcon from '../../common/MaterialIcon/MaterialIcon';
import SvgIcon from '../../common/SvgIcon/SvgIcon';
import FocusIcon from 'svg-react-loader?name=Focus!../../../icons/focus.svg';

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

let PropertyOwnerHeader = ({title, expanded, setExpanded, onIcon, offIcon, quickToggleUri, focusAction, shiftFocusAction, popOutAction }) => {
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
    <span className={toggleHeaderStyles.title} >
      { title }
    </span>
    <span className={styles.rightButtonContainer}>
      { focusAction &&
        <div className={styles.rightButton} onClick={onClickFocus}>
        <SvgIcon><Focus/></SvgIcon>
        </div>
      }
      {
        popOutAction && null // TODO: Add popout action here. 
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

  return {
    title: title || displayName(state, uri),
    quickToggleUri,

  };
}

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


