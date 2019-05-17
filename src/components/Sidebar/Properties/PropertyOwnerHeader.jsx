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


import {
  NavigationAnchorKey,
  NavigationAimKey,
  RetargetAnchorKey,
} from '../../../api/keys';

/*
<Button className={styles.globeButton} identifier={identifier} onClick={gotoThis} >
        <MaterialIcon icon="language" />
      </Button>
      */

let PropertyOwnerHeader = ({ title, expanded, setExpanded, onIcon, offIcon, quickToggleUri, focusAction, shiftFocusAction, popOutAction }) => {
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
        <span className={styles.buttonContainer}>
          <Property uri={quickToggleUri} checkBoxOnly={true} />
        </span>
    }
    <span className={toggleHeaderStyles.title} >
      { title }
    </span>
    <span className={styles.buttonContainer}>
      { focusAction && <MaterialIcon onClick={onClickFocus} icon="check_box" /> }
      { popOutAction && null }
    </span>
  </header>
}

/*const focusOnThis = (e) => {
  e.stopPropagation();
  //DataManager.setValue(NavigationAnchorKey, e.currentTarget.getAttribute("identifier"));
  //DataManager.setValue(NavigationAimKey, e.currentTarget.getAttribute("identifier"));
  if (!e.shiftKey) {
    //DataManager.trigger(RetargetAnchorKey);
  }
}*/

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


