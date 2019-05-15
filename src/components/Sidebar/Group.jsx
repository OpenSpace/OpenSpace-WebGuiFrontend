import React from 'react';
import PropTypes from 'prop-types';
import ToggleContent from '../common/ToggleContent/ToggleContent';
import PropertyOwner,
       { displayName as propertyOwnerName,
         nodeExpansionIdentifier as propertyOwnerNodeExpansionIdentifier }  from './Properties/PropertyOwner'

import { setPropertyTreeExpansion } from '../../api/Actions';

import { connect } from 'react-redux';



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

let Group = ({ path, expansionIdentifier, entries, isExpanded, setExpanded}) => {
  return <ToggleContent
    title={displayName(path)}
    expanded={isExpanded}
    setExpanded={setExpanded}
  >
    {
      entries.map(entry => {
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


const mapStateToProps = (state, ownProps) => {
  const { path } = ownProps;
  const data = state.groups[path] || {};
  const groups = data.subgroups || []
  const owners = data.propertyOwners || [];
  let isExpanded = state.local.propertyTreeExpansion[ownProps.expansionIdentifier];

  if (isExpanded === undefined) {
    isExpanded = ownProps.autoExpand;
  }

  const entries = groups.map(g => ({
    type: 'group',
    payload: g
  })).concat(owners.map(o => ({
    type: 'propertyOwner',
    payload: o
  }))).sort((a, b) => {
    const aName = a.type === 'group' ?
      displayName(a.payload) :
      propertyOwnerName(state, a.payload);

    const bName = b.type === 'group' ?
      displayName(b.payload) :
      propertyOwnerName(state, b.payload);

    return aName.localeCompare(bName, 'en');
  });

  return {
    entries,
    isExpanded
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

Group = connect(
  mapStateToProps,
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
