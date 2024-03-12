import actionTypes from '../Actions/actionTypes';
import { InterestingTag } from '../keys';

const FeaturedGroupKey = '/Featured';

const emptyGroup = () => ({
  subgroups: [],
  propertyOwners: []
});

const computeGroups = (propertyTree) => {
  const { propertyOwners, properties } = propertyTree;
  const groups = {};

  function hasInterestingTag(uri) {
    return propertyOwners[uri].tags.some((tag) => tag.includes(InterestingTag));
  }

  // Add featured/interesting nodes as a separate group
  groups[FeaturedGroupKey] = emptyGroup();

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

    // Also keep track of "Interesting" property owners
    if (hasInterestingTag(uri)) {
      groups[FeaturedGroupKey].propertyOwners.push(uri);
    }
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
