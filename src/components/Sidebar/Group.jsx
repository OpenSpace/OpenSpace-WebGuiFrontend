import PropTypes from 'prop-types';
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setPropertyTreeExpansion } from '../../api/Actions';
import { sortGroups } from '../../api/keys';
import ToggleContent from '../common/ToggleContent/ToggleContent';
import PropertyOwner, { 
  displayName as propertyOwnerName, 
  nodeExpansionIdentifier as propertyOwnerNodeExpansionIdentifier 
} from './Properties/PropertyOwner';

const displayName = path => {
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
const nodeExpansionIdentifier = path => {
  const splitPath = path.split('/');
  if (splitPath.length > 1) {
    return 'G:' + splitPath[splitPath.length - 1];
  } else {
    return '';
  }
}

const Group = ({ path, expansionIdentifier, autoExpand }) => {
  const isExpanded = useSelector((state) => {
    let isExpanded = state.local.propertyTreeExpansion[expansionIdentifier];

    if (isExpanded === undefined) {
      isExpanded = autoExpand;
    }
    return isExpanded;
  });

  const entries = useSelector((state) => {
    const data = state.groups[path] || {};
    const owners = data.propertyOwners || [];
    const subGroups = data.subgroups || [];
    const result = subGroups.map(g => ({
      type: 'group',
      payload: g,
      name: displayName(g)
    })).concat(owners.map(o => ({
      type: 'propertyOwner',
      payload: o,
      name: propertyOwnerName(state.propertyTree.propertyOwners, state.propertyTree.properties, o)
    })));
    return result;
  });

  const pathFragments = path.split('/');
  const groupName = pathFragments[pathFragments.length - 1];
  const result = sortGroups[groupName];
  const sortOrdering = result;

  const dispatch = useDispatch();

  const setExpanded = (expanded) => {
    dispatch(setPropertyTreeExpansion({
      identifier: expansionIdentifier,
      expanded
    }));
  };

  var sortedEntries = entries.sort((a, b) =>
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

  return <ToggleContent
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
                          expansionIdentifier={childNodeIdentifier} />
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
