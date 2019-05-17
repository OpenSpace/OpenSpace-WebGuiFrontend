import { actionTypes } from '../Actions/actionTypes';

const emptyGroup = () => ({
  subgroups: [],
  propertyOwners: [],
  shortcuts: []
})

const computeGroups = (propertyTree, shortcuts) => {
  const { propertyOwners, properties } = propertyTree;
  const groups = {};

  // Create links to property owners.
  Object.keys(propertyOwners).forEach(uri => {
    const guiPathProp = properties[uri + '.GuiPath'];
    let guiPath = guiPathProp ? guiPathProp.value : '';

    // Only scene graph nodes can use the group feature.
    // Match children (but not grandchildren) of Scene:
    if (!uri.match(/^Scene\.[^\.]+$/)) {
      return;
    }

    const group = groups[guiPath] = groups[guiPath] || emptyGroup()
    group.propertyOwners.push(uri);
  });

  const shortcutList = shortcuts.data.shortcuts || [];
  shortcutList.forEach((shortcut, index) => {
    const guiPath = '/Shortcuts' + shortcut.guiPath;
    const group = groups[guiPath] = groups[guiPath] || emptyGroup();
    group.shortcuts.push(index);
  });

  // Create links from parent groups to subgroups.
  Object.keys(groups).forEach(group => {
    const path = group.split('/');
    for (let i = 1; i < path.length; ++i) {
      const parentPath = path.slice(0, i).join('/');
      const childPath = path.slice(0, i + 1).join('/');
      const group = groups[parentPath] = groups[parentPath] || emptyGroup();
      if (group.subgroups.indexOf(childPath) === -1) {
        group.subgroups.push(childPath);
      }
    }
  });

  return groups;
}

export const groups = (state = {}, action, propertyTree, shortcuts) => {
  switch (action.type) {
    case actionTypes.refreshGroups:
      return computeGroups(propertyTree, shortcuts);
    default:
      return state;
  }
};


