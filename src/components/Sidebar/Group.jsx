import React from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import { setPropertyTreeExpansion } from '../../api/Actions';
import { sortGroups } from '../../api/keys';
import ToggleContent from '../common/ToggleContent/ToggleContent';

import PropertyOwner, {
  displayName as propertyOwnerName,
  nodeExpansionIdentifier as propertyOwnerNodeExpansionIdentifier
} from './Properties/PropertyOwner';

function isEnabled(properties, uri) {
  return properties[`${uri}.Renderable.Enabled`]?.value;
}

function enabledPropertyOwners(state, path) {
  const data = state.groups[path] || {};
  const propertyOwners = data.propertyOwners || [];
  const props = state.propertyTree.properties;

  // Filter PropertyOwners
  return propertyOwners.filter((propertyOwner) => isEnabled(props, propertyOwner));
}

function shouldShowGroup(state, path) {
  const data = state.groups[path] || {};
  const subGroups = data.subgroups || [];
  // If there are any enabled property owners in the result,
  // show the groups
  if (subGroups.length === 0) {
    return enabledPropertyOwners(state, path).length !== 0;
  }
  const initialValue = false;
  const result = subGroups.reduce(
    (accumulator, currentValue) => accumulator || shouldShowGroup(state, currentValue),
    initialValue
  );
  return result;
}

function displayName(path) {
  const splitPath = path.split('/');
  return (splitPath.length > 1) ? splitPath[splitPath.length - 1] : 'Untitled';
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

function Group({
  path, expansionIdentifier, autoExpand, showOnlyEnabled
}) {
  const isExpanded = useSelector((state) => {
    const expanded = state.local.propertyTreeExpansion[expansionIdentifier];
    return (expanded === undefined) ? autoExpand : expanded;
  }, shallowEqual);

  const propertyOwners = useSelector((state) => {
    let owners;
    if (showOnlyEnabled) {
      owners = enabledPropertyOwners(state, path);
    } else {
      const data = state.groups[path] || {};
      owners = data.propertyOwners || [];
    }
    const propOwners = state.propertyTree.propertyOwners;
    const props = state.propertyTree.properties;
    // Extract propertyOwners
    return owners.map((owner) => ({
      type: 'propertyOwner',
      payload: owner,
      name: propertyOwnerName(propOwners, props, owner)
    }));
  }, shallowEqual);

  const groups = useSelector((state) => {
    const data = state.groups[path] || {};
    const subGroups = data.subgroups || [];

    // Extract groups
    const result = subGroups.map((subGroup) => ({
      type: 'group',
      payload: subGroup,
      name: displayName(subGroup)
    }));
    // See if the groups contain any PropertyOwners
    if (showOnlyEnabled) {
      return result.filter((group) => shouldShowGroup(state, group.payload));
    }
    return result;
  });

  const entries = groups.concat(propertyOwners);
  const hasEntries = entries.length !== 0;
  const pathFragments = path.split('/');
  const groupName = pathFragments[pathFragments.length - 1];
  const sortOrdering = sortGroups[groupName];

  const dispatch = useDispatch();

  const setExpanded = (expanded) => {
    dispatch(setPropertyTreeExpansion({
      identifier: expansionIdentifier,
      expanded
    }));
  };

  const sortedEntries = entries.sort((a, b) => a.name.localeCompare(b.name, 'en'));

  if (sortOrdering && sortOrdering.value) {
    sortedEntries.sort((a, b) => {
      const result = sortOrdering.value.indexOf(a.name) < sortOrdering.value.indexOf(b.name);
      return result ? -1 : 1;
    });
  }

  return hasEntries && (
    <ToggleContent
      title={displayName(path)}
      expanded={isExpanded}
      setExpanded={setExpanded}
    >
      {
        sortedEntries.map((entry) => {
          const expandSingle = entries.length === 1;
          switch (entry.type) {
            case 'group': {
              const childNodeIdentifier = `${expansionIdentifier}/${
                nodeExpansionIdentifier(entry.payload)}`;

              return (
                <Group
                  autoExpand={autoExpand || expandSingle}
                  key={entry.payload}
                  path={entry.payload}
                  expansionIdentifier={childNodeIdentifier}
                  showOnlyEnabled={showOnlyEnabled}
                />
              );
            }
            case 'propertyOwner': {
              const childNodeIdentifier = `${expansionIdentifier}/${
                propertyOwnerNodeExpansionIdentifier(entry.payload)}`;

              return (
                <PropertyOwner
                  autoExpand={autoExpand || expandSingle}
                  key={entry.payload}
                  uri={entry.payload}
                  expansionIdentifier={childNodeIdentifier}
                />
              );
            }
            default:
              return null;
          }
        })
      }
    </ToggleContent>
  );
}

Group.propTypes = {
  path: PropTypes.string.isRequired,
  expansionIdentifier: PropTypes.string.isRequired,
  autoExpand: PropTypes.bool,
  showOnlyEnabled: PropTypes.bool
};

Group.defaultProps = {
  autoExpand: false,
  showOnlyEnabled: false
};

export default Group;
