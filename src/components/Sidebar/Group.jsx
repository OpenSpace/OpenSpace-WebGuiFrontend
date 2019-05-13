import React from 'react';
import PropTypes from 'prop-types';
import ToggleContent from '../common/ToggleContent/ToggleContent';
import PropertyOwner from './Properties/PropertyOwner'

import { setPropertyTreeExpansion } from '../../api/Actions';

import { connect } from 'react-redux';

const title = path => {
  const splitPath = path.split('/');
  if (splitPath.length > 1) {
    return splitPath[splitPath.length - 1];
  } else {
    return "Untitled";
  }
}

let Group = ({ path, propertyOwners, subgroups, expanded, setExpanded }) => (

  <ToggleContent
    title={title(path)}
    expanded={expanded}
    setExpanded={setExpanded}
  >
    { subgroups.map(path => <Group key={path} path={path} />) }
    { propertyOwners.map(uri => <PropertyOwner key={uri} uri={uri} />) }
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
  const expanded = state.local.propertyTreeExpansion[path];

  return {
    subgroups,
    propertyOwners,
    expanded
  };
}

const mapDispatchToProps = (dispatch, ownProps) => {
  const setExpanded = (expanded) => {
    dispatch(setPropertyTreeExpansion({
      identifier: ownProps.path,
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
