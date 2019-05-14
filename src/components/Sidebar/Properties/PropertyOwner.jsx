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

const treeIdentifier = (props) => {
  return props.treeId ? props.treeId + '$' + props.uri : props.uri;
}

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
            layerEnabled = prop.value
            enabledProp = prop;
            i = properties.length; //just exit early for performance
          }
      }
      if (enabledProp == null) {
        return null;
      } else {
        const enableBox = <div className={styles.buttonContainer}>
          <BoolProperty value={layerEnabled} checkBoxOnly={true} {...enabledProp} />
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
        title = properties[i].value;
    }
  }
  return title;
};

/*


const hasVisibleProperties = (properties) => {
  const visibleProps = properties.filter(prop => {return ( prop.description.MetaData &&  (prop.description.MetaData.Visibility != "Hidden")) });
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
  if ( (prop != undefined) && (prop.id == "Type") && (prop.description.Identifier.lastIndexOf("ColorLayers") > 0) || (prop.description.Identifier.lastIndexOf("HeightLayers") > 0) ) {
    return true;
  }
  return false;
}


const showEnabled = (identifier, properties) => {
  for (var i = 0; i < properties.length; i++) {
    var prop = properties[i];
    if ( (prop.id  == "Enabled") && (prop.value == true) && isGlobeBrowsingLayer(identifier, properties) ) {
      return true;
    }
  }
  return false;
}
*/


//showEnabled(identifier, properties)


let PropertyOwner = (props) => {
  const {
    identifier,
    name,
    properties,
    subowners,
    isExpanded,
    setExpanded,
    treeId,
    isSceneGraphNode,
    isHidden,
    isGlobeBrowsingLayer
  } = props;

  if (isHidden) {
    return null;
  }

  const autoExpand = subowners.length === 1 ? true : undefined;

  return <ToggleContent
    headerChildren={getHeaderChildren(isSceneGraphNode, identifier, subowners, properties)}
    title={getTitle(identifier, name, properties)}
    showEnabled = {false}
    expanded={isExpanded}
    setExpanded={setExpanded}
  >
    { subowners.map(uri => <PropertyOwner key={uri} uri={uri} treeId={treeId} autoExpand={autoExpand}/>) }
    { properties.map(uri => <Property key={uri} uri={uri} />) }
  </ToggleContent>
};


const shouldAutoExpand = (state, uri) => {
  // Auto expand renderables
  const splitUri = uri.split('.');
  if (splitUri.length > 0 && splitUri[splitUri.length - 1] === "Renderable") {
    return true;
  }
  return false;
}

const isHidden = (state, uri) => {
  const prop = state.propertyTree.properties[uri + '.GuiHidden'];
  return prop && prop.value;
}

const isDeadEnd = (state, uri) => {
  const node = state.propertyTree.propertyOwners[uri];
  const subowners = node.subowners || [];
  const properties = node.properties || [];

  const visibleProperties = properties.filter(childUri => {
    const property = state.propertyTree.properties[childUri];
    return property &&
           property.description &&
           property.description.MetaData &&
           property.description.MetaData.Visibility !== 'Hidden';
  });

  if (visibleProperties.length > 0) {
    return false;
  }

  const nonDeadEndSubowners = subowners.filter(childUri => {
    return !isHidden(state, childUri) && !isDeadEnd(state, childUri);
  });

  return nonDeadEndSubowners.length === 0;
}

const isGlobeBrowsingLayer = (state, uri) => {
  return false;
}

const mapStateToProps = (state, ownProps) => {
  const { uri } = ownProps;
  const splitUri = uri.split('.');
  
  let identifier = '';
  if (splitUri.length > 0) {
    identifier = splitUri[splitUri.length - 1];
  }

  const data = state.propertyTree.propertyOwners[uri];
  const subowners = data ? data.subowners : [];
  const properties = data ? data.properties : [];
  const nameProp = state.propertyTree.properties[uri + ".GuiName"];
  const name = ownProps.name || nameProp && nameProp.value;

  let isExpanded = state.local.propertyTreeExpansion[treeIdentifier(ownProps)];
  if (isExpanded === undefined) {
    isExpanded = ownProps.autoExpand || shouldAutoExpand(state, uri);
  }

  const hidden = isHidden(state, uri) || isDeadEnd(state, uri);

  return {
    identifier,
    name,
    subowners,
    properties,
    isExpanded,
    isHidden: hidden
  };
}

const mapDispatchToProps = (dispatch, ownProps) => {
  const setExpanded = (expanded) => {
    dispatch(setPropertyTreeExpansion({
      identifier: treeIdentifier(ownProps),
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
  autoExpand: PropTypes.bool
};

PropertyOwner.defaultProps = {
  isSceneGraphNode: false,
  properties: [],
  subowners: [],
};

export default PropertyOwner;
