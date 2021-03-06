import React, { Component, PureComponent } from 'react';
import PropTypes from 'prop-types';
import ToggleContent from '../../common/ToggleContent/ToggleContent';
import Property from './Property';
import { LayerGroupKeys } from '../../../api/keys';
import PropertyOwnerHeader from './PropertyOwnerHeader';
import { setPropertyTreeExpansion, addNodePropertyPopover, addNodeMetaPopover } from '../../../api/Actions';
import subStateToProps from '../../../utils/subStateToProps';
import { isPropertyVisible, isPropertyOwnerHidden, isDeadEnd } from './../../../utils/propertyTreeHelpers'

import { connect } from 'react-redux';
import shallowEqualObjects from 'shallow-equal/objects';
import shallowEqualArrays from 'shallow-equal/arrays';

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

class PropertyOwnerComponent extends Component {

  shouldComponentUpdate(nextProps) {
    return !(
      this.props.uri === nextProps.uri &&
      this.props.name === nextProps.name &&
      shallowEqualArrays(this.props.properties, nextProps.properties) &&
      shallowEqualArrays(this.props.subowners, nextProps.subowners) &&
      shallowEqualObjects(this.props.subownerNames, nextProps.subownerNames) &&
      this.props.isExpanded === nextProps.isExpanded &&
      this.props.setExpanded === nextProps.setExpanded &&
      this.props.autoExpand === nextProps.autoExpand &&
      this.props.expansionIdentifier === nextProps.expansionIdentifier &&
      this.props.sort === nextProps.sort);
  }

  render() {
    const {
      uri,
      name,
      properties,
      subowners,
      subownerNames,
      isExpanded,
      setExpanded,
      expansionIdentifier,
      sort,
      popOut,
      metaAction,
      trashAction,
      isRenderable,
      isSceneGraphNodeOrLayer
    } = this.props;

    const sortedSubowners =
      sort ?
        (subowners.slice(0).sort((a, b) => subownerNames[a].localeCompare(subownerNames[b], 'en'))) :
        subowners;

    const popOutAction = isRenderable ? popOut : undefined;
    const hasMetaAction = isSceneGraphNodeOrLayer ? metaAction : undefined;

    const header = <PropertyOwnerHeader uri={uri}
                                        expanded={isExpanded}
                                        title={name}
                                        setExpanded={setExpanded}
                                        popOutAction={popOutAction}
                                        trashAction={trashAction}
                                        metaAction={hasMetaAction} />

    return <ToggleContent
      header={header}
      expanded={isExpanded}
      setExpanded={setExpanded}
    >
      {
        sortedSubowners.map(uri => {
          let autoExpand = sortedSubowners.length + properties.length === 1 ? true : undefined;
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
}

const shouldSortAlphabetically = uri => {
  const splitUri = uri.split('.');
  // The only case when property owners should not be sorted
  // alphabetically is when they are globe browsing layers.
  // Layer groups have the format *.Layers.[ColorLayers|HeightLayers|...]
  if (splitUri.length < 2) {
    return true;
  }
  return splitUri.indexOf('Layers') !== (splitUri.length - 2);
}

const isSceneGraphNode = (uri) => {
   if (uri == undefined) {
      return false;
    }
    const splitUri = uri.split('.');
    return (splitUri.length == 2);
}

const isGlobeBrowsingLayer = (uri) => {
    if (uri == undefined) {
      return false;
    }
    const splitUri = uri.split('.');

    var found = false;
    LayerGroupKeys.forEach( (layerGroup) => {
      if ( (uri.indexOf(layerGroup) > -1) && !(uri.endsWith(layerGroup)) ) {
        found = true;
      }
    });

    return found && (splitUri.length == 6);
}

const displayName = (propertyOwners, properties, uri) => {

  var property = properties[uri + ".GuiName"];
  if (!property && isGlobeBrowsingLayer(uri) && propertyOwners[uri] && propertyOwners[uri].name) {
    property = {value: propertyOwners[uri].name};
  }

  return property ?
    property.value :
    propertyOwners[uri].identifier;
}

const mapSubStateToProps = (
  {propertyOwners, properties, propertyTreeExpansion},
  {uri, name, autoExpand, expansionIdentifier}
) => {
  const data = propertyOwners[uri];
  let subowners = data ? data.subowners : [];
  let subProperties = data ? data.properties : [];

  subowners = subowners.filter(uri => (
    !isPropertyOwnerHidden(properties, uri) && !isDeadEnd(propertyOwners, properties, uri)
  ));

  const subownerNames = {};
  subowners.forEach(uri => {
    subownerNames[uri] = displayName(propertyOwners, properties, uri)
  });
  subProperties = subProperties.filter(uri => isPropertyVisible(properties, uri));

  const sort = shouldSortAlphabetically(uri);

  name = name || displayName(propertyOwners, properties, uri);
  let isExpanded = propertyTreeExpansion[expansionIdentifier];
  if (isExpanded === undefined) {
    isExpanded = autoExpand || false;
  }

  let renderableTypeProp = properties[uri + ".Renderable.Type"];
  var property = properties[uri + ".GuiName"];
  var hasDescription = properties[uri + ".GuiDescription"];
  var showMeta = false;
  if ( (isSceneGraphNode(uri) || isGlobeBrowsingLayer(uri)) && hasDescription) {
    showMeta = hasDescription;
  }

  return {
    name,
    subowners,
    subownerNames,
    properties: subProperties,
    isExpanded,
    sort,
    isRenderable: (renderableTypeProp != undefined),
    isSceneGraphNodeOrLayer: showMeta
  };
}

const mapStateToSubState = state => ({
  propertyOwners: state.propertyTree.propertyOwners,
  properties: state.propertyTree.properties,
  propertyTreeExpansion: state.local.propertyTreeExpansion
})

const mapDispatchToProps = (dispatch, ownProps) => {
  const setExpanded = (expanded) => {
    dispatch(setPropertyTreeExpansion({
      identifier: ownProps.expansionIdentifier,
      expanded
    }));
  }

  const isFocus = ownProps.name && (ownProps.name.lastIndexOf('Current') > -1);
  const popOut = () => {
    dispatch(addNodePropertyPopover({
      identifier: ownProps.uri,
      focus: isFocus
    }));
  };

  const metaAction = () => {
    dispatch(addNodeMetaPopover({
      identifier: ownProps.uri,
    }));
  };

  return {
    setExpanded,
    popOut,
    metaAction
  };
}

const PropertyOwner = connect(
  subStateToProps(mapSubStateToProps, mapStateToSubState),
  mapDispatchToProps
)(PropertyOwnerComponent);


PropertyOwner.propTypes = {
  uri: PropTypes.string.isRequired,
  autoExpand: PropTypes.bool
};

PropertyOwner.defaultProps = {
  properties: [],
  subowners: [],
};

export default PropertyOwner;
export {
  displayName,
  nodeExpansionIdentifier
};
