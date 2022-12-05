import PropTypes from 'prop-types';
import React from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { setPropertyTreeExpansion } from '../../api/Actions';
import { sortGroups } from '../../api/keys';
import ToggleContent from '../common/ToggleContent/ToggleContent';
import PropertyOwner, { 
  displayName as propertyOwnerName, 
  nodeExpansionIdentifier as propertyOwnerNodeExpansionIdentifier 
} from './Properties/PropertyOwner';

function isEnabled(properties, uri) {
  return properties[`${uri}.Renderable.Enabled`]?.value;
};

function enabledPropertyOwners(state, path) {
  const data = state.groups[path] || {};
  const propertyOwners = data.propertyOwners || [];
  
  // Filter PropertyOwners
  return propertyOwners.filter((propertyOwner) =>
    isEnabled(state.propertyTree.properties, propertyOwner)
  );
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
    (accumulator, currentValue) => {
      return accumulator || shouldShowGroup(state, currentValue);
    },
    initialValue
  );
  return result;
}

function displayName(path) {
  const splitPath = path.split('/');
  if (splitPath.length > 1) {
    return splitPath[splitPath.length - 1];
  } else {
    return 'Untitled';
  }
}

/**
 * Return an identifier for the tree expansion state.
 */
function nodeExpansionIdentifier(path) {
  const splitPath = path.split('/');
  if (splitPath.length > 1) {
    return 'G:' + splitPath[splitPath.length - 1];
  } else {
    return '';
  }
}

function Group({ path, expansionIdentifier, autoExpand, showOnlyEnabled }) {
  const isExpanded = useSelector((state) => {
    let isExpanded = state.local.propertyTreeExpansion[expansionIdentifier];
    return (isExpanded === undefined) ? isExpanded : autoExpand;
  }, shallowEqual);

  const propertyOwners = useSelector((state) => {
    let owners;
    if (showOnlyEnabled) {
      owners = enabledPropertyOwners(state, path);
    }
    else {
      const data = state.groups[path] || {};
      owners = data.propertyOwners || [];
    }
    // Extract propertyOwners
    return owners.map(owner => ({
        type: 'propertyOwner',
        payload: owner,
        name: propertyOwnerName(state.propertyTree.propertyOwners, state.propertyTree.properties, owner)
    }));
  }, shallowEqual);

  const groups = useSelector((state) => {
    const data = state.groups[path] || {};
    const subGroups = data.subgroups || [];

    // Extract groups
    let groups = subGroups.map(subGroup => ({
      type: 'group',
      payload: subGroup,
      name: displayName(subGroup)
    }));
    // See if the groups contain any PropertyOwners
    if (showOnlyEnabled) {
      return groups.filter((group) => {
        return shouldShowGroup(state, group.payload);
      });
    }
    return groups;
  })
  
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

  let sortedEntries = entries.sort((a, b) =>
    a.name.localeCompare(b.name, 'en')
  );

  if (sortOrdering && sortOrdering.value) {
      sortedEntries.sort((a,b) => {
        if (sortOrdering.value.indexOf(a.name) < sortOrdering.value.indexOf(b.name)) {
          return -1;
        } else {
          return 1;
        }
      });
  }

  return hasEntries && <ToggleContent
    title={displayName(path)}
    expanded={isExpanded}
    setExpanded={setExpanded}
  >
    {
      sortedEntries.map(entry => {
        const autoExpand = entries.length === 1;
        switch (entry.type) {
          case 'group': {
            const childNodeIdentifier = expansionIdentifier + '/' +
              nodeExpansionIdentifier(entry.payload);

            return <Group autoExpand={autoExpand}
                          key={entry.payload}
                          path={entry.payload}
                          expansionIdentifier={childNodeIdentifier}
                          showOnlyEnabled={showOnlyEnabled} />
            }
          case 'propertyOwner': {
            const childNodeIdentifier = expansionIdentifier + '/' +
              propertyOwnerNodeExpansionIdentifier(entry.payload);

            return <PropertyOwner autoExpand={autoExpand}
                                  key={entry.payload}
                                  uri={entry.payload}
                                  expansionIdentifier={childNodeIdentifier} />
            }
          default:
            return null;
        }
      })
    }
  </ToggleContent>
}

Group.propTypes = {
  path: PropTypes.string.isRequired,
  autoExpand: PropTypes.bool,
  expansionIdentifier: PropTypes.string.isRequired
};

Group.defaultProps = {
};

export default Group;
