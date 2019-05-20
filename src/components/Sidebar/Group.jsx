import React from 'react';
import PropTypes from 'prop-types';
import ToggleContent from '../common/ToggleContent/ToggleContent';
import PropertyOwner,
       { displayName as propertyOwnerName,
         nodeExpansionIdentifier as propertyOwnerNodeExpansionIdentifier }  from './Properties/PropertyOwner'
import Shortcut from './Shortcut';

import { setPropertyTreeExpansion } from '../../api/Actions';
import { sortGroups } from '../../api/keys';

import { connect } from 'react-redux';

import subStateToProps from '../../utils/subStateToProps';


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

let Group = ({ path, expansionIdentifier, entries, isExpanded, setExpanded, sortOrdering}) => {

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
          case 'shortcut': {
            return <Shortcut key={entry.payload}
                             index={entry.payload} />
          }
          default:
            return null;
        }
      })
    }
  </ToggleContent>
}


const mapSubStateToProps = (
  { groups, propertyOwners, properties, propertyTreeExpansion, shortcuts },
  { path, expansionIdentifier, autoExpand }
) => {
  const data = groups[path] || {};
  const subGroups = data.subgroups || [];
  const owners = data.propertyOwners || [];
  const subShortcuts = data.shortcuts || [];
  let isExpanded = propertyTreeExpansion[expansionIdentifier];

  if (isExpanded === undefined) {
    isExpanded = autoExpand;
  }

  const entries = subGroups.map(g => ({
    type: 'group',
    payload: g,
    name: displayName(g)
  })).concat(owners.map(o => ({
    type: 'propertyOwner',
    payload: o,
    name: propertyOwnerName(propertyOwners, properties, o)
  }))).concat(subShortcuts.map(i => ({
    type: 'shortcut',
    payload: i,
    name: shortcuts[i].name || ''
  })));

  const pathFragments = path.split('/');
  const groupName = pathFragments[pathFragments.length - 1];
  const sortOrdering = sortGroups[groupName];

  return {
    entries,
    isExpanded,
    sortOrdering
  };
}

const mapStateToSubState = state => ({
  groups: state.groups,
  propertyOwners: state.propertyTree.propertyOwners,
  properties: state.propertyTree.properties,
  propertyTreeExpansion: state.local.propertyTreeExpansion,
  shortcuts: state.shortcuts.data.shortcuts || []
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

Group = connect(
  subStateToProps(mapSubStateToProps, mapStateToSubState),
  mapDispatchToProps
)(Group);

Group.propTypes = {
  path: PropTypes.string.isRequired,
  autoExpand: PropTypes.bool,
  expansionIdentifier: PropTypes.string.isRequired
};

Group.defaultProps = {
};



export default Group;
export { nodeExpansionIdentifier };
