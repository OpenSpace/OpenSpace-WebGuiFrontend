import React from 'react';

import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { closeDrawer } from '../../../../api/Actions';

import styles from './SceneDrawer.scss';
import { Drawer } from '../Drawer';
import ScenePane from '../../../../components/Sidebar/ScenePane';
import ContextSection from '../../../../components/Sidebar/ContextSection';

import PropertyOwner from '../../../../components/Sidebar/Properties/PropertyOwner';
import Group from '../../../../components/Sidebar/Group';
import Pane from '../../../../components/Sidebar/Pane';

import { useLocalStorageState } from '../../../../utils/customHooks';

import { checkIfVisible, isPropertyOwnerHidden } from '../../../../utils/propertyTreeHelpers';
import {
  ObjectWordBeginningSubstring,
  ObjectSimpleSubstring
} from '../../../../utils/StringMatchers';

// import { FilterList, FilterListFavorites, FilterListData } from './FilterList/FilterList';
import { FilterButtons } from './FilterButtons';

import { FilterList } from './FilterList/FilterList';

export interface Entry {
  key: string;
  expansionIdentifier: string;
  uri: string;
}

export interface Favorite {
  key: string;
  path: string;
  expansionIdentifier: string;
}

export const SceneDrawer = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector((state: any) => state.local.drawersReducer.SceneDrawer.isOpen);

  // Ignore ts error for now
  // @ts-ignore
  const [showOnlyEnabled, setShowOnlyEnabled] = useLocalStorageState('showOnlyEnabled', false);

  const [isLoading, setIsLoading] = React.useState(false);

  const closeSceneDrawer = () => {
    dispatch(closeDrawer('SceneDrawer'));
  };

  const groups = useSelector((state: any) => {
    const topLevelGroupsPaths = Object.keys(state.groups)
      .filter((path) => {
        // Get the number of slashes in the path
        const depth = (path.match(/\//g) || []).length;
        return depth <= 1;
      })
      .map((path) => path.slice(1)); // Remove first slash

    // Convert back to object
    const topLevelGroups: { [key: string]: boolean } = topLevelGroupsPaths.reduce(
      (obj, key) => ({ ...obj, [key]: true }),
      {}
    );

    // Reorder properties based on SceneProperties ordering property
    let sortedGroups: string[] = [];
    const ordering = state.propertyTree.properties['Modules.ImGUI.Main.SceneProperties.Ordering'];
    if (ordering && ordering.value) {
      ordering.value.forEach((item: string) => {
        if (topLevelGroups[item]) {
          sortedGroups.push(item);
          delete topLevelGroups[item];
        }
      });
    }
    // Add the remaining items to the end.
    Object.keys(topLevelGroups).forEach((item) => {
      sortedGroups.push(item);
    });

    // Add back the leading slash
    sortedGroups = sortedGroups.map((path) => `/${path}`);
    return sortedGroups;
  }, shallowEqual);

  const propertyOwners = useSelector(
    (state: any) => state.propertyTree.propertyOwners,
    shallowEqual
  );

  const properties = useSelector((state: any) => state.propertyTree.properties, shallowEqual);
  const propertyOwnersScene = propertyOwners.Scene?.subowners ?? [];

  function matcher(test: Entry, search: string) {
    const node = propertyOwners[test.uri] || {};
    const guiHidden = isPropertyOwnerHidden(properties, test.uri);
    return ObjectWordBeginningSubstring(node, search) && !guiHidden;
  }

  function keywordMatcher(entry: Entry, keyword: string) {
    const node = propertyOwners[entry.uri] || {};

    const guiHidden = isPropertyOwnerHidden(properties, entry.uri);

    const valuesAsStrings: string[] = Object.values(node)
      .filter((t) => ['number', 'string'].includes(typeof t))
      .map((t: any) => t.toString())
      .map((t: any) => t.toLowerCase());

    return valuesAsStrings.some((value) => value.includes(keyword.toLowerCase())) && !guiHidden;
  }

  function onlyEnabledMatcher(test: Entry, search: string) {
    const isVisible = checkIfVisible(properties, test.uri);
    return isVisible && matcher(test, search);
  }

  const entries: Entry[] = propertyOwnersScene.map((uri: string) => ({
    key: uri,
    uri,
    expansionIdentifier: `scene-search/${uri}`
  }));

  const favorites: Favorite[] = groups.map((item: string) => ({
    key: item,
    path: item,
    expansionIdentifier: `scene/${item}`
  }));

  console.log('favorites', favorites);
  console.log('entries', entries);

  const bodyContent = (
    <div className={styles.bodyContainer}>
      <FilterList
        favorites={favorites}
        entries={entries}
        showOnlyEnabled={showOnlyEnabled}
        matcher={showOnlyEnabled ? onlyEnabledMatcher : matcher || keywordMatcher}
        ignorePropsFilter={['active', 'onSelect']}
      />
    </div>
  );

  return (
    <Drawer
      disabled={isLoading}
      isOpen={isOpen}
      title='Scene'
      actionLabel='Continue'
      onClose={closeSceneDrawer}
      onSubmit={() => {}}
      body={bodyContent}
    />
  );
};
