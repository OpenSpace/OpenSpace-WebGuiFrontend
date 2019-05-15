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



/**
 * Return an identifier for the tree expansion state.
 */
const nodeExpansionIdentifier = uri => {
  const splitUri = uri.split('.');
  if (splitUri.length > 1) {
    return 'O:' + splitUri[splitUri.length - 1];
  } else {
    return '';
  }
}


let PropertyOwner = (props) => {
  const {
    identifier,
    name,
    properties,
    subowners,
    isExpanded,
    setExpanded,
    expansionIdentifier,
    isSceneGraphNode,
    isGlobeBrowsingLayer
  } = props;


  return <ToggleContent
    headerChildren={getHeaderChildren(isSceneGraphNode, identifier, subowners, properties)}
    title={name}
    showEnabled = {false}
    expanded={isExpanded}
    setExpanded={setExpanded}
  >
    {
      subowners.map(uri => {
        let autoExpand = subowners.length + properties.length === 1 ? true : undefined;
        const splitUri = uri.split('.');
        if (splitUri.length > 0 && splitUri[splitUri.length - 1] === "Renderable") {
          autoExpand = true;
        }
        return <PropertyOwner key={uri}
                     uri={uri}
                     expansionIdentifier={expansionIdentifier + '/' + nodeExpansionIdentifier(uri)}
                     autoExpand={autoExpand}/>;
      })
    }
    {
      properties.map(uri => <Property key={uri} uri={uri} />)
    }
  </ToggleContent>
};

const isPropertyOwnerHidden = (state, uri) => {
  const prop = state.propertyTree.properties[uri + '.GuiHidden'];
  return prop && prop.value;
}

const isPropertyVisible = (state, uri) => {
  const property = state.propertyTree.properties[uri];
  return property &&
         property.description &&
         property.description.MetaData &&
         property.description.MetaData.Visibility !== 'Hidden';
}

const isDeadEnd = (state, uri) => {
  const node = state.propertyTree.propertyOwners[uri];
  const subowners = node.subowners || [];
  const properties = node.properties || [];

  const visibleProperties = properties.filter(
    childUri => isPropertyVisible(state, childUri)
  );
  if (visibleProperties.length > 0) {
    return false;
  }

  const nonDeadEndSubowners = subowners.filter(childUri => {
    return !isPropertyOwnerHidden(state, childUri) && !isDeadEnd(state, childUri);
  });
  return nonDeadEndSubowners.length === 0;
}

const isGlobeBrowsingLayer = (state, uri) => {
  return false;
}

const shouldSortAlphabetically = (state, uri) => {
  const splitUri = uri.split('.');
  // The only case when property owners should not be sorted
  // alphabetically is when they are globe browsing layers.
  // Layer groups have the format *.Layers.[ColorLayers|HeightLayers|...]
  if (splitUri.length < 2) {
    return true;
  }
  return splitUri.indexOf('Layers') !== (splitUri.length - 2);
}

const displayName = (state, uri) => {
  const property = state.propertyTree.properties[uri + ".GuiName"];
  return property ?
    property.value :
    state.propertyTree.propertyOwners[uri].identifier;
}

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


  subowners = subowners.filter(uri => (
    !isPropertyOwnerHidden(state, uri) && !isDeadEnd(state, uri)
  ));

  properties = properties.filter(uri => isPropertyVisible(state, uri));

  if (shouldSortAlphabetically(state, uri)) {
    subowners = subowners.slice(0).sort((a, b) => {
      const aName = displayName(state, a);
      const bName = displayName(state, b);
      return aName.localeCompare(bName, 'en');
    });
  }

  const nameProp = state.propertyTree.properties[uri + ".GuiName"];
  const name = ownProps.name || displayName(state, uri);

  let isExpanded = state.local.propertyTreeExpansion[ownProps.expansionIdentifier];
  if (isExpanded === undefined) {
    isExpanded = ownProps.autoExpand;
  }

  return {
    identifier,
    name,
    subowners,
    properties,
    isExpanded,
  };
}

const mapDispatchToProps = (dispatch, ownProps) => {
  const setExpanded = (expanded) => {
    dispatch(setPropertyTreeExpansion({
      identifier: ownProps.expansionIdentifier,
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
export { displayName, nodeExpansionIdentifier };