import actionTypes from '../Actions/actionTypes';

const emptyGroup = () => ({
  subgroups: [],
  propertyOwners: []
});

const computeGroups = (propertyTree) => {
  const { propertyOwners, properties } = propertyTree;
  const groups = {};

  // Create links to property owners
  Object.keys(propertyOwners).forEach((uri) => {
    const guiPathProp = properties[`${uri}.GuiPath`];
    const guiPath = guiPathProp ? guiPathProp.value : '';

    // Only scene graph nodes can use the group feature.
    // Match children (but not grandchildren) of Scene:
    if (!uri.match(/^Scene\.[^.]+$/)) {
      return;
    }
    groups[guiPath] = groups[guiPath] || emptyGroup();
    const group = groups[guiPath];
    group.propertyOwners.push(uri);
  });

  // Create links from parent groups to subgroups
  Object.keys(groups).forEach((group) => {
    const path = group.split('/');
    for (let i = 1; i < path.length; ++i) {
      const parentPath = path.slice(0, i).join('/');
      const childPath = path.slice(0, i + 1).join('/');
      groups[parentPath] = groups[parentPath] || emptyGroup();
      const parentGroup = groups[parentPath];
      if (parentGroup.subgroups.indexOf(childPath) === -1) {
        parentGroup.subgroups.push(childPath);
      }
    }
  });

  return groups;
};

const groups = (state = {}, action = {}, propertyTree = {}) => {
  switch (action.type) {
    case actionTypes.refreshGroups:
      return computeGroups(propertyTree);
    default:
      return state;
  }
};

export default groups;
