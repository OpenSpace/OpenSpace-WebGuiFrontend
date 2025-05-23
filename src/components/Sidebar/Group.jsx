import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { shallowEqualArrays } from 'shallow-equal';

import { setPropertyTreeExpansion } from '../../api/Actions';
import {
  filterPropertyOwners,
  guiOrderingNumber,
  sortSceneMenuList
} from '../../utils/propertyTreeHelpers';
import ToggleContent from '../common/ToggleContent/ToggleContent';

import PropertyOwner, {
  displayName as propertyOwnerName,
  nodeExpansionIdentifier as propertyOwnerNodeExpansionIdentifier
} from './Properties/PropertyOwner';

function shouldShowGroup(state, path, showOnlyEnabled, showHidden) {
  const data = state.groups.groups[path] || {};
  const subGroups = data.subgroups || [];
  // If there are any enabled property owners in the result, show the groups
  if (subGroups.length === 0) {
    const propertyOwners = data.propertyOwners || [];
    const props = state.propertyTree.properties;
    const visible = filterPropertyOwners(propertyOwners, props, showOnlyEnabled, showHidden);
    return visible.length !== 0;
  }
  // Recursively check the subgroups
  const initialValue = false;
  const result = subGroups.reduce(
    (accumulator, currentValue) =>
      accumulator || shouldShowGroup(state, currentValue, showOnlyEnabled, showHidden),
    initialValue
  );
  return result;
}

function displayName(path) {
  const splitPath = path.split('/');
  return splitPath.length > 1 ? splitPath[splitPath.length - 1] : 'Untitled';
}

/**
 * Return an identifier for the tree expansion state.
 */
function nodeExpansionIdentifier(path) {
  const splitPath = path.split('/');
  if (splitPath.length > 1) {
    return `G:${splitPath[splitPath.length - 1]}`;
  }
  return '';
}

function Group({ path, expansionIdentifier, showOnlyEnabled, showHidden }) {
  const customGuiGroupOrdering = useSelector((state) => state.groups.customGroupOrdering);

  const isExpanded = useSelector((state) => {
    const expanded = state.local.propertyTreeExpansion[expansionIdentifier];
    return Boolean(expanded);
  });

  const shouldFilter = showOnlyEnabled || !showHidden;

  const groupContent = useSelector((state) => state.groups.groups[path] || {});

  const allPropertyOwners = useSelector((state) =>
    state.propertyTree.propertyOwners ? state.propertyTree.propertyOwners : []
  );
  const allProperties = useSelector((state) =>
    state.propertyTree.properties ? state.propertyTree.properties : []
  );

  // Sub-groups
  const subGroupPaths = useSelector((state) => {
    let result = groupContent.subgroups || [];
    if (shouldFilter) {
      result = result.filter((group) => shouldShowGroup(state, group, showOnlyEnabled, showHidden));
    }
    return result;
  }, shallowEqualArrays);

  // Property owners
  let propertyOwnerUris = groupContent?.propertyOwners || [];
  if (shouldFilter) {
    propertyOwnerUris = filterPropertyOwners(
      propertyOwnerUris,
      allProperties,
      showOnlyEnabled,
      showHidden
    );
  }

  const ownerDetails = propertyOwnerUris.map((uri) => ({
    name: propertyOwnerName(allPropertyOwners, allProperties, uri),
    guiOrder: guiOrderingNumber(allProperties, uri)
  }));

  const dispatch = useDispatch();

  const propertyOwners = propertyOwnerUris.map((uri, index) => ({
    type: 'propertyOwner',
    payload: uri,
    name: ownerDetails[index].name,
    guiOrder: ownerDetails[index].guiOrder
  }));

  const groups = subGroupPaths.map((groupPath) => ({
    type: 'group',
    payload: groupPath,
    name: displayName(groupPath),
    guiOrder: undefined
  }));

  const entries = groups.concat(propertyOwners);
  const hasEntries = entries.length !== 0;

  const setExpanded = (expanded) => {
    dispatch(
      setPropertyTreeExpansion({
        identifier: expansionIdentifier,
        expanded
      })
    );
  };

  const customSortOrdering = customGuiGroupOrdering[path];
  const sortedEntries = sortSceneMenuList(entries, customSortOrdering);

  return (
    hasEntries && (
      <ToggleContent title={displayName(path)} expanded={isExpanded} setExpanded={setExpanded}>
        {sortedEntries.map((entry) => {
          switch (entry.type) {
            case 'group': {
              const childNodeIdentifier = `${expansionIdentifier}/${nodeExpansionIdentifier(
                entry.payload
              )}`;

              return (
                <Group
                  key={entry.payload}
                  path={entry.payload}
                  expansionIdentifier={childNodeIdentifier}
                  showOnlyEnabled={showOnlyEnabled}
                  showHidden={showHidden}
                />
              );
            }
            case 'propertyOwner': {
              const childNodeIdentifier = `${expansionIdentifier}/${propertyOwnerNodeExpansionIdentifier(
                entry.payload
              )}`;

              return (
                <PropertyOwner
                  key={entry.payload}
                  uri={entry.payload}
                  expansionIdentifier={childNodeIdentifier}
                />
              );
            }
            default:
              return null;
          }
        })}
      </ToggleContent>
    )
  );
}

Group.propTypes = {
  path: PropTypes.string.isRequired,
  expansionIdentifier: PropTypes.string.isRequired,
  showOnlyEnabled: PropTypes.bool,
  showHidden: PropTypes.bool
};

Group.defaultProps = {
  showOnlyEnabled: false,
  showHidden: false
};

export default Group;
