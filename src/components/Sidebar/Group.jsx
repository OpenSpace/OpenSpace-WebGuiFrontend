import React from 'react';
import PropTypes from 'prop-types';
import ToggleContent from '../common/ToggleContent/ToggleContent';
import PropertyOwner from './Properties/PropertyOwner'

import { setPropertyTreeExpansion } from '../../api/Actions';

import { connect } from 'react-redux';

const treeIdentifier = (props) => {
  return props.treeId ? props.treeId + '$' + props.uri : props.uri;
}

const title = path => {
  const splitPath = path.split('/');
  if (splitPath.length > 1) {
    return splitPath[splitPath.length - 1];
  } else {
    return "Untitled";
  }
}

let Group = ({ path, treeId, propertyOwners, subgroups, expanded, setExpanded }) => (

  <ToggleContent
    title={title(path)}
    expanded={expanded}
    setExpanded={setExpanded}
  >
    { subgroups.map(path => <Group key={path} path={path} treeId={treeId} />) }
    { propertyOwners.map(uri => <PropertyOwner key={uri} uri={uri} treeId={treeId} />) }
  </ToggleContent>
);

Group.propTypes = {
  path: PropTypes.string.isRequired,
};

Group.defaultProps = {
};

const mapStateToProps = (state, ownProps) => {
  const { path } = ownProps;
  const data = state.groups[path] || {};
  const subgroups = data.subgroups || []
  const propertyOwners = data.propertyOwners || [];
  const expanded = state.local.propertyTreeExpansion[treeIdentifier(ownProps)];

  return {
    subgroups,
    propertyOwners,
    expanded
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

export default Group;
