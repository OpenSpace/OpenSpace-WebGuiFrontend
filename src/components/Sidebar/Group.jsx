import React from 'react';
import PropTypes from 'prop-types';
import ToggleContent from '../common/ToggleContent/ToggleContent';
import PropertyOwner, { displayName as propertyOwnerName} from './Properties/PropertyOwner'

import { setPropertyTreeExpansion } from '../../api/Actions';

import { connect } from 'react-redux';

const treeIdentifier = (props) => {
  return props.treeId ? props.treeId + '$' + props.path : props.path;
}

const displayName = path => {
  const splitPath = path.split('/');
  if (splitPath.length > 1) {
    return splitPath[splitPath.length - 1];
  } else {
    return "Untitled";
  }
}

let Group = ({ path, treeId, entries, isExpanded, setExpanded}) => {
  return <ToggleContent
    title={displayName(path)}
    expanded={isExpanded}
    setExpanded={setExpanded}
  >
    {
      entries.map(entry => {
        switch (entry.type) {
          case 'group':
            return <Group key={entry.payload} path={entry.payload} treeId={treeId} />
          case 'propertyOwner':
            return <PropertyOwner key={entry.payload} uri={entry.payload} treeId={treeId} />
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
  const isExpanded = state.local.propertyTreeExpansion[treeIdentifier(ownProps)];

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
      identifier: treeIdentifier(ownProps),
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
};

Group.defaultProps = {
};



export default Group;
