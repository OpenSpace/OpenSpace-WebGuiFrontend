import React from 'react';
import PropTypes from 'prop-types';
import ToggleContent from '../../common/ToggleContent/ToggleContent';
import Property from './Property';
import Button from '../../common/Input/Button/Button';
import { NavigationAnchorKey, NavigationAimKey, RetargetAnchorKey } from '../../../api/keys';
import MaterialIcon from '../../common/MaterialIcon/MaterialIcon';
import SvgIcon from '../../common/SvgIcon/SvgIcon';
import FocusIcon from 'svg-react-loader?name=Focus!../../../icons/focus.svg';
import Shortcut from './../Shortcut';
import PropertyOwnerHeader from './PropertyOwnerHeader';
import { setPropertyTreeExpansion } from '../../../api/Actions';
import subStateToProps from '../../../utils/subStateToProps';

import { connect } from 'react-redux';

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
    uri,
    identifier,
    name,
    properties,
    subowners,
    isExpanded,
    setExpanded,
    expansionIdentifier,
    sort
  } = props;

  const sortedSubowners = (
    sort ?
      (subowners.sort((a, b) => a.name.localeCompare(b.name, 'en'))) :
      subowners
    ).map(data => data.uri)

  const header = <PropertyOwnerHeader uri={uri}
                                      expanded={isExpanded}
                                      title={name}
                                      setExpanded={setExpanded} />

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

const isPropertyOwnerHidden = (properties, uri) => {
  const prop = properties[uri + '.GuiHidden'];
  return prop && prop.value;
}

const isPropertyVisible = (properties, uri) => {
  const property = properties[uri];

  const splitUri = uri.split('.');
  if (splitUri.length > 1) {
    if (splitUri[splitUri.length - 1] === 'Enabled')
      return false;
  }

  return property &&
         property.description &&
         property.description.MetaData &&
         property.description.MetaData.Visibility !== 'Hidden';
}

const isDeadEnd = (propertyOwners, properties, uri) => {
  const node = propertyOwners[uri];
  const subowners = node.subowners || [];
  const subproperties = node.properties || [];

  const visibleProperties = subproperties.filter(
    childUri => isPropertyVisible(properties, childUri)
  );
  if (visibleProperties.length > 0) {
    return false;
  }

  const nonDeadEndSubowners = subowners.filter(childUri => {
    return !isPropertyOwnerHidden(properties, childUri) && !isDeadEnd(propertyOwners, properties, childUri);
  });
  return nonDeadEndSubowners.length === 0;
}

const isGlobeBrowsingLayer = (state, uri) => {
  return false;
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

const displayName = (propertyOwners, properties, uri) => {
  const property = properties[uri + ".GuiName"];
  return property ?
    property.value :
    propertyOwners[uri].identifier;
}

const mapSubStateToProps = (
  {propertyOwners, properties, propertyTreeExpansion},
  {uri, name, autoExpand, expansionIdentifier}
) => {
  const splitUri = uri.split('.');
  
  let identifier = '';
  if (splitUri.length > 0) {
    identifier = splitUri[splitUri.length - 1];
  }

  const data = propertyOwners[uri];
  let subowners = data ? data.subowners : [];
  let subProperties = data ? data.properties : [];

  subowners = subowners.filter(uri => (
    !isPropertyOwnerHidden(properties, uri) && !isDeadEnd(propertyOwners, properties, uri)
  )).map(uri => ({
    uri,
    name: displayName(propertyOwners, properties, uri)
  }));

  subProperties = subProperties.filter(uri => isPropertyVisible(properties, uri));

  const sort = shouldSortAlphabetically(uri);

  const nameProp = properties[uri + ".GuiName"];
  name = name || displayName(propertyOwners, properties, uri);

  let isExpanded = propertyTreeExpansion[expansionIdentifier];
  if (isExpanded === undefined) {
    isExpanded = autoExpand || false;
  }

  return {
    identifier,
    name,
    subowners,
    properties: subProperties,
    isExpanded,
    sort
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
  return {
    setExpanded
  };
}

PropertyOwner = connect(
  subStateToProps(mapSubStateToProps, mapStateToSubState),
  mapDispatchToProps
)(PropertyOwner);


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