import React from 'react';
import PropTypes from 'prop-types';
import ToggleContent from '../../common/ToggleContent/ToggleContent';
import Property from './Property';
import styles from './../SceneGraphNode.scss';
import Button from '../../common/Input/Button/Button';
import { NavigationAnchorKey, NavigationAimKey, RetargetAnchorKey } from '../../../api/keys';
import MaterialIcon from '../../common/MaterialIcon/MaterialIcon';
import SvgIcon from '../../common/SvgIcon/SvgIcon';
import FocusIcon from 'svg-react-loader?name=Focus!../../../icons/focus.svg';
import Shortcut from './../Shortcut';

import { setPropertyTreeExpansion } from '../../../api/Actions';

import { connect } from 'react-redux';

const getHeaderChildren = (isSceneGraphNode, identifier, subowners, properties) => {
  if (isSceneGraphNode) {
    const focusButton = <div className={styles.buttonContainer}>
      <Button className={styles.shybutton} identifier={identifier} transparent onClick={focusOnThis} >
        <SvgIcon><FocusIcon/></SvgIcon>
      </Button>
    </div>

    const bothButtons = <div className={styles.buttonContainer}>
      <Button className={styles.globeButton} identifier={identifier} onClick={gotoThis} >
        <MaterialIcon icon="language" />
      </Button>
       <Button className={styles.shybutton} identifier={identifier} onClick={focusOnThis} >
        <SvgIcon><FocusIcon/></SvgIcon>
      </Button>
    </div>

    //todo replace with isGlobe once we have a goto geo function that includes geo radius
    if (false) {
      return bothButtons;
    } else {
      return focusButton;
    }
  } else {
    /*if (isGlobeBrowsingLayer(identifier, properties)) {
      var layerEnabled = false;
      var enabledProp = null;
      for (var i = 0; i < properties.length; i++) {
          var prop = properties[i];
          if ( (prop.id  == "Enabled") ) {
            layerEnabled = prop.Value
            enabledProp = prop;
            i = properties.length; //just exit early for performance
          }
      }
      if (enabledProp == null) {
        return null;
      } else {
        const enableBox = <div className={styles.buttonContainer}>
          <BoolProperty Value={layerEnabled} checkBoxOnly={true} {...enabledProp} />
        </div>
        return enableBox;
      }
    } else {

      return null
    }
    */
    return null;
  }
}

const focusOnThis = (e) => {
  e.stopPropagation();
  //DataManager.setValue(NavigationAnchorKey, e.currentTarget.getAttribute("identifier"));
  //DataManager.setValue(NavigationAimKey, e.currentTarget.getAttribute("identifier"));
  if (!e.shiftKey) {
    //DataManager.trigger(RetargetAnchorKey);
  }
}

const getTitle = (identifier, guiName, properties) => {
  var title = guiName || identifier;
  for (var i = 0; i < properties.length; i++) {
    if (properties[i].id  == "GuiName") {
        title = properties[i].Value;
    }
  }
  return title;
};

/*
const shouldAutoExpand = (subowner) => subowner.identifier === 'Renderable';

const hasVisibleProperties = (properties) => {
  const visibleProps = properties.filter(prop => {return ( prop.Description.MetaData &&  (prop.Description.MetaData.Visibility != "Hidden")) });
  return visibleProps.length > 0;
}

const isGlobeBrowsingLayer = (identifier, properties) => {
  if ( (identifier == "ColorLayers") || (identifier == "HeightLayers") || (properties.length < 2) ) {
    //in this case, property identifiers will match but this is the group of layers not actual layers
    //or a property of a globebrowsing layer who's first property is also a Type
    return false;
  }
  var prop = properties[0];
  //todo there must be a better way to determin if this property owner is a globebrowsing layer.....
  //open to ANY sugestions
  if ( (prop != undefined) && (prop.id == "Type") && (prop.Description.Identifier.lastIndexOf("ColorLayers") > 0) || (prop.Description.Identifier.lastIndexOf("HeightLayers") > 0) ) {
    return true;
  }
  return false;
}


const showEnabled = (identifier, properties) => {
  for (var i = 0; i < properties.length; i++) {
    var prop = properties[i];
    if ( (prop.id  == "Enabled") && (prop.Value == true) && isGlobeBrowsingLayer(identifier, properties) ) {
      return true;
    }
  }
  return false;
}
*/


//showEnabled(identifier, properties)

let PropertyOwner = ({ identifier, name, properties, subowners, isSceneGraphNode, expanded, setExpanded }) => (

  <ToggleContent
    headerChildren={getHeaderChildren(isSceneGraphNode, identifier, subowners, properties)}
    title={getTitle(identifier, name, properties)}
    showEnabled = {false}
    expanded={expanded}
    setExpanded={setExpanded}
  >
    { subowners.map(uri => <PropertyOwner key={uri} uri={uri} />) }
    { properties.map(uri => <Property key={uri} uri={uri} />) }
  </ToggleContent>
);

const mapStateToProps = (state, ownProps) => {
  const { uri } = ownProps;
  const splitUri = uri.split('.');
  
  let identifier = '';
  if (splitUri.length > 0) {
    identifier = splitUri[splitUri.length - 1];
  }

  const data = state.propertyTree.propertyOwners[uri];
  let subowners = data ? data.subowners : [];
  let properties = data ? data.properties : [];  

  const expanded = state.local.propertyTreeExpansion[uri];

  return {
    identifier,
    name,
    subowners,
    properties,
    expanded
  };
}

const mapDispatchToProps = (dispatch, ownProps) => {
  const setExpanded = (expanded) => {
    dispatch(setPropertyTreeExpansion({
      identifier: ownProps.uri, 
      expanded
    }));
  }
  return {
    setExpanded
  };
}

PropertyOwner = connect(
  mapStateToProps,
  mapDispatchToProps
)(PropertyOwner);


PropertyOwner.propTypes = {
  isSceneGraphNode: PropTypes.bool.isRequired,
  uri: PropTypes.string.isRequired,
  expanded: PropTypes.bool
};

PropertyOwner.defaultProps = {
  isSceneGraphNode: false,
  properties: [],
  subowners: [],
};

export default PropertyOwner;
