import React from 'react';
import PropTypes from 'prop-types';
import ToggleContent from '../../common/ToggleContent/ToggleContent';
import Property from './Property';
import BoolProperty from './BoolProperty';
import NumericProperty from './NumericProperty';
import OptionProperty from './OptionProperty';
import TriggerProperty from './TriggerProperty';
import VecProperty from './VectorProperty';
import MatrixProperty from './MatrixProperty';
import styles from './../SceneGraphNode.scss';
import Button from '../../common/Input/Button/Button';
import { NavigationAnchorKey, NavigationAimKey, RetargetAnchorKey } from '../../../api/keys';
import MaterialIcon from '../../common/MaterialIcon/MaterialIcon';
import SvgIcon from '../../common/SvgIcon/SvgIcon';
import FocusIcon from 'svg-react-loader?name=Focus!../../../icons/focus.svg';
import Shortcut from './../Shortcut';

const types = {
  BoolProperty,
  OptionProperty,
  TriggerProperty,
  StringProperty: Property,
  NumericProperty,
  FloatProperty: NumericProperty,
  IntProperty: NumericProperty,
  Vec2Property: VecProperty,
  Vec3Property: VecProperty,
  Vec4Property: VecProperty,
  MatrixProperty,
  DMat4Property: MatrixProperty,
  defaultProperty: Property,
};

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
    if (isGlobeBrowsingLayer(identifier, properties)) {
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
  }
}

const gotoThis = (e) => {
  e.stopPropagation();
  //DataManager.setValue(NavigationAnchorKey, '"' + e.currentTarget.getAttribute("identifier") + '"');
  //DataManager.setValue(NavigationAimKey, '"' + e.currentTarget.getAttribute("identifier") + '"');
  const GotoGeoScript = 'openspace.globebrowsing.goToGeo(0, 0, 20000000)';
  //DataManager.runScript(GotoGeoScript);
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

const shouldAutoExpand = (subowner) => subowner.identifier === 'Renderable';

const hasVisibleProperties = (properties) => {
  const visibleProps = properties.filter(prop => {return ( prop.Description.MetaData &&  (prop.Description.MetaData.Visibility != "Hidden")) });
  return visibleProps.length > 0;
}

const getSubOwnerMarkup = (subowner) => {
  if (!subowner.script) {
    if ( (subowner.subowners && subowner.subowners.length > 0) ||
         (subowner.properties && hasVisibleProperties(subowner.properties) && subowner.properties.length > 0) )  {
      return <PropertyOwner {...subowner} key={subowner.identifier} expand={shouldAutoExpand(subowner)}/>
    } else {
      return "";
    }
  } else {
    return <Shortcut {...subowner} key={subowner.name} />
  }
};


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


const PropertyOwner = ({ identifier, guiName, properties, subowners, isSceneGraphNode, expand }) => (

  <ToggleContent
    headerChildren={getHeaderChildren(isSceneGraphNode, identifier, subowners, properties)}
    title={getTitle(identifier, guiName, properties)}
    showEnabled = {showEnabled(identifier, properties)}
    show={expand}
  >
    { subowners.map(subowner => (
      getSubOwnerMarkup(subowner)
    )) }
    
    { properties.map((prop) => {
      const { Description } = prop;

      if ( Description.MetaData &&  (Description.MetaData.Visibility == "Hidden") ) {
        return;
      }
        
      const Type = types[Description.Type] || types.defaultProperty;
        return (
          <Type key={Description.Identifier} {...prop} subscribe />
        );
    }) }
  </ToggleContent>
);

PropertyOwner.propTypes = {
  isSceneGraphNode: PropTypes.bool.isRequired,
  identifier: PropTypes.string.isRequired,
  properties: PropTypes.arrayOf(PropTypes.object),
  subowners: PropTypes.arrayOf(PropTypes.shape({
    identifier: PropTypes.string,
    subowners: PropTypes.array,
    properties: PropTypes.array,
  })),
};

PropertyOwner.defaultProps = {
  isSceneGraphNode: false,
  properties: [],
  subowners: [],
};

export default PropertyOwner;
export const Types = types;
export const GetType = type => types[type] || types.defaultProperty;
