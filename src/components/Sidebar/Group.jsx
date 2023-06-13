import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import shallowEqualArrays from 'shallow-equal/arrays';

import { setPropertyTreeExpansion } from '../../api/Actions';
import { sortGroups } from '../../api/keys';
import ToggleContent from '../common/ToggleContent/ToggleContent';

import PropertyOwner, {
  displayName as propertyOwnerName,
  nodeExpansionIdentifier as propertyOwnerNodeExpansionIdentifier
} from './Properties/PropertyOwner';
import SoftwareIntegrationSession from "./SoftwareIntegration/SoftwareIntegrationSession";

function isEnabled(properties, uri) {
  return properties[`${uri}.Renderable.Enabled`]?.value;
}

function shouldShowGroup(state, path) {
  const data = state.groups[path] || {};
  const subGroups = data.subgroups || [];
  // If there are any enabled property owners in the result,
  // show the groups
  if (subGroups.length === 0) {
    const propertyOwners = data.propertyOwners || [];
    const props = state.propertyTree.properties;

    // Filter PropertyOwners
    const visible = propertyOwners.filter((propertyOwner) => isEnabled(props, propertyOwner));
    return visible.length !== 0;
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
  path, expansionIdentifier, showOnlyEnabled
}) {
  const isExpanded = useSelector((state) => {
    const expanded = state.local.propertyTreeExpansion[expansionIdentifier];
    return Boolean(expanded);
  });
  const groupPaths = useSelector((state) => {
    const data = state.groups[path] || {};
    const result = data.subgroups || [];
    // See if the groups contain any PropertyOwners
    if (showOnlyEnabled) {
      return result.filter((group) => shouldShowGroup(state, group));
    }
    return result;
  }, shallowEqualArrays);

  const ownerUris = useSelector((state) => {
    const data = state.groups[path] || {};
    const groupPropOwners = data.propertyOwners || [];
    if (!showOnlyEnabled) {
      return groupPropOwners;
    }
    // Filter PropertyOwners
    const props = state.propertyTree.properties;
    return groupPropOwners.filter((propertyOwner) => isEnabled(props, propertyOwner));
  }, shallowEqualArrays);

  const ownerNames = useSelector((state) => {
    const props = state.propertyTree.properties;
    const propOwners = state.propertyTree.propertyOwners;
    return ownerUris.map((uri) => propertyOwnerName(propOwners, props, uri));
  }, shallowEqualArrays);

  const propertyOwners = ownerUris.map((uri, index) => ({
    type: 'propertyOwner',
    payload: uri,
    name: ownerNames[index]
  }));

  const groups = groupPaths.map((groupPath) => ({
    type: 'group',
    payload: groupPath,
    name: displayName(groupPath)
  }));

  const entries = groups.concat(propertyOwners);

  if (displayName(path) === "Software Integration") {
    /* A bit hacky...
        This won't affect any logic or GUI other than adding a new `ToggleContent`
        under "Scene/Software Integration" if there is at least one SGN there. */
    entries.unshift({
      type: "softwareIntegrationSessionHandlingUi"
    });
  }

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
          switch (entry.type) {
            case 'group': {
              const childNodeIdentifier = `${expansionIdentifier}/${
                nodeExpansionIdentifier(entry.payload)}`;

              return (
                <Group
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
                  key={entry.payload}
                  uri={entry.payload}
                  expansionIdentifier={childNodeIdentifier}
                />
              );
            }
            case 'softwareIntegrationSessionHandlingUi': {
              return <SoftwareIntegrationSession key={entry.type} />;
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
  showOnlyEnabled: PropTypes.bool
};

Group.defaultProps = {
  showOnlyEnabled: false
};

export default Group;
