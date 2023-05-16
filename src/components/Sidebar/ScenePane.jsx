import PropTypes from 'prop-types';
import React from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { ObjectWordBeginningSubstring } from '../../utils/StringMatchers';
import {FilterList, FilterListData, FilterListFavorites } from '../common/FilterList/FilterList';
import LoadingBlocks from '../common/LoadingBlock/LoadingBlocks';
import Pane from './Pane';
import ContextSection from './ContextSection';
import PropertyOwner from './Properties/PropertyOwner';
import Group from './Group';
import { isPropertyOwnerHidden } from '../../utils/propertyTreeHelpers';
import Checkbox from '../common/Input/Checkbox/Checkbox';
import { useLocalStorageState } from '../../utils/customHooks';
import SettingsPopup from '../common/SettingsPopup/SettingsPopup';

function ScenePane({ closeCallback }) {
  const [showOnlyEnabled, setShowOnlyEnabled] = useLocalStorageState("showOnlyEnabled", false);

  const groups = useSelector((state) => {
    const topLevelGroups = Object.keys(state.groups).filter(path => {
        // Get the number of slashes in the path
        const depth = (path.match(/\//g) || []).length;
        return depth <= 1;
      }).map(path =>
        path.slice(1) // Remove leading slash
      ).reduce((obj, key) => ({ // Convert back to object
        ...obj,
        [key]: true
      }), {}
    );

    // Reorder properties based on SceneProperties ordering property
    let sortedGroups = [];
    const ordering = state.propertyTree.properties['Modules.ImGUI.Main.SceneProperties.Ordering'];
    if (ordering && ordering.value) {
      ordering.value.forEach(item => {
        if (topLevelGroups[item]) {
          sortedGroups.push(item);
          delete topLevelGroups[item];
        }
      })
    }
    // Add the remaining items to the end.
    Object.keys(topLevelGroups).forEach(item => {
      sortedGroups.push(item);
    });

    // Add back the leading slash
    sortedGroups = sortedGroups.map(path => '/' + path);
    return sortedGroups;
  }, shallowEqual);

  const propertyOwners = useSelector((state) => state.propertyTree.propertyOwners, shallowEqual);
  const properties = useSelector((state) => state.propertyTree.properties, shallowEqual);
  const propertyOwnersScene = propertyOwners.Scene?.subowners ?? [];

  function matcher(test, search) {
    const node = propertyOwners[test.uri] || {};
    const guiHidden = isPropertyOwnerHidden(properties, test.uri);
    return ObjectWordBeginningSubstring(node, search) && !guiHidden;
  };

  function onlyEnabledMatcher(test, search) {
    const property = properties[`${test.uri}.Renderable.Enabled`];
    const isEnabled = property?.value;
    return isEnabled && matcher(test, search);
  };

  const entries = propertyOwnersScene.map(uri => ({
    key: uri,
    uri: uri,
    expansionIdentifier: 'scene-search/' + uri
  }));

  const favorites = groups.map(item => ({
    key: item,
    path: item,
    expansionIdentifier: 'scene/' + item
  }));

  const settingsButton = (
    <SettingsPopup>
      <Checkbox
        label="Show Only Enabled"
        checked={showOnlyEnabled}
        left={false}
        disabled={false}
        setChecked={() => setShowOnlyEnabled(current => !current)}
        wide
        style={{ padding : '2px'}}
      />
    </SettingsPopup>
  );

  return (
    <Pane title="Scene" closeCallback={closeCallback} headerButton={settingsButton}>
      {(entries.length === 0) &&
        <LoadingBlocks className={Pane.styles.loading} />
      }
      {entries.length > 0 &&
        <FilterList matcher={showOnlyEnabled ? onlyEnabledMatcher : matcher}>
          <FilterListFavorites>
            <ContextSection expansionIdentifier="context" />
            {favorites.map(favorite => <Group {...favorite} showOnlyEnabled={showOnlyEnabled} />)}
          </FilterListFavorites>
          <FilterListData>
            {entries.map(entry => <PropertyOwner {...entry} />)}
          </FilterListData>
        </FilterList>
      }
    </Pane>
  );
}

ScenePane.propTypes = {
  closeCallback: PropTypes.func,
};

ScenePane.defaultProps = {
  closeCallback: null,
};

export default ScenePane;
