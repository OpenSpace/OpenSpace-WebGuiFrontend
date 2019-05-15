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

/*
<Button className={styles.globeButton} identifier={identifier} onClick={gotoThis} >
        <MaterialIcon icon="language" />
      </Button>
      */

let PropertyOwnerHeader = ({ title, expanded, setExpanded, onIcon, offIcon, quickToggleUri, focusAction, popOutAction }) => {
  const onClick = (evt) => {
    setExpanded(!expanded)
  }

  return <header className={toggleHeaderStyles.toggle} onClick={onClick} role="button" tabIndex={0}>
    <MaterialIcon
      icon={expanded ? onIcon : offIcon}
      className={toggleHeaderStyles.icon}
    />
    <span className={toggleHeaderStyles.title} >
      { title }
    </span>
    <span className={styles.buttonContainer}>
    { quickToggleUri && <Property uri={quickToggleUri} checkBoxOnly={true} /> }
    { focusAction && <MaterialIcon icon="check_box" /> }
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
    quickToggleUri
  };
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
  };
}

PropertyOwnerHeader = connect(
  mapStateToProps,
  mapDispatchToProps
)(PropertyOwnerHeader);


PropertyOwnerHeader.propTypes = {
  expanded: PropTypes.bool.isRequired,
  setExpanded: PropTypes.func.isRequired,
  isSceneGraphNode: PropTypes.bool.isRequired,
  uri: PropTypes.string.isRequired,
  offIcon: PropTypes.string,
  onIcon: PropTypes.string,
};

PropertyOwnerHeader.defaultProps = {
  isSceneGraphNode: false,
  properties: [],
  subowners: [],
  offIcon: 'chevron_right',
  onIcon: 'expand_more',
};

export default PropertyOwnerHeader;


