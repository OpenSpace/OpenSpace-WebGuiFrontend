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
  } = props;

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

const alphabeticalComparison = state => (a, b) => {
  const aName = displayName(state, a);
  const bName = displayName(state, b);
  return aName.localeCompare(bName, 'en');
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
    subowners = subowners.slice(0).sort(alphabeticalComparison(state));
  }

  const nameProp = state.propertyTree.properties[uri + ".GuiName"];
  const name = ownProps.name || displayName(state, uri);

  let isExpanded = state.local.propertyTreeExpansion[ownProps.expansionIdentifier];
  if (isExpanded === undefined) {
    isExpanded = ownProps.autoExpand || false;
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
  nodeExpansionIdentifier,
  alphabeticalComparison
};