import React from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import shallowEqualArrays from 'shallow-equal/arrays';

import { useLocalStorageState } from '../../utils/customHooks';
import { checkIfVisible, isPropertyOwnerHidden } from '../../utils/propertyTreeHelpers';
import { ObjectWordBeginningSubstring } from '../../utils/StringMatchers';
import { FilterList, FilterListData, FilterListFavorites } from '../common/FilterList/FilterList';
import InfoBox from '../common/InfoBox/InfoBox';
import Checkbox from '../common/Input/Checkbox/Checkbox';
import LoadingBlocks from '../common/LoadingBlock/LoadingBlocks';
import SettingsPopup from '../common/SettingsPopup/SettingsPopup';

import PropertyOwner from './Properties/PropertyOwner';
import ContextSection from './ContextSection';
import Group from './Group';
import Pane from './Pane';

function ScenePane({ closeCallback }) {
  const [showOnlyEnabled, setShowOnlyEnabled] = useLocalStorageState('showOnlyEnabled', false);
  const [showHiddenNodes, setShowHiddenNodes] = useLocalStorageState('showHiddenNodes', false);

  const groups = useSelector((state) => {
    const topLevelGroupsPaths = Object.keys(state.groups).filter((path) => {
      // Get the number of slashes in the path
      const depth = (path.match(/\//g) || []).length;
      return depth === 1;
    });
    // @TODO: Handle things that are outside of any group (depth === 0)?
    return topLevelGroupsPaths;
  }, shallowEqual);

  const propertyOwners = useSelector((state) => state.propertyTree.propertyOwners, shallowEqual);
  const propertyOwnersScene = propertyOwners.Scene?.subowners ?? [];

  const filteredPropertyOwnersScene = useSelector((state) => {
    const props = state.propertyTree.properties;
    let owners = propertyOwnersScene;
    // Filter based on show enabled/hidden
    if (showOnlyEnabled) {
      owners = owners.filter((uri) => checkIfVisible(props, uri));
    }
    if (!showHiddenNodes) {
      owners = owners.filter((uri) => !isPropertyOwnerHidden(props, uri));
    }
    return owners;
  }, shallowEqualArrays);

  function matcher(test, search) {
    const node = propertyOwners[test.uri] || {};
    return ObjectWordBeginningSubstring(node, search);
  }

  const entries = filteredPropertyOwnersScene.map((uri) => ({
    key: uri,
    uri,
    expansionIdentifier: `scene-search/${uri}`
  }));

  const favorites = groups.map((item) => ({
    key: item,
    path: item,
    expansionIdentifier: `scene/${item}`
  }));

  const settingsButton = (
    <SettingsPopup>
      <Checkbox
        checked={showOnlyEnabled}
        left={false}
        disabled={false}
        setChecked={() => setShowOnlyEnabled((current) => !current)}
        wide
        style={{ padding: '2px' }}
      >
        <p>
          Show only visible
          <InfoBox
            style={{ paddingLeft: '4px' }}
            text="Visible = Enabled and not faded out"
          />
        </p>
      </Checkbox>
      <Checkbox
        checked={showHiddenNodes}
        left={false}
        disabled={false}
        setChecked={() => setShowHiddenNodes((current) => !current)}
        wide
        style={{ padding: '2px' }}
      >
        <p>
          Show hidden scene graph nodes
          <InfoBox
            style={{ paddingLeft: '4px' }}
            text="Scene graph nodes that are not marked as hidden in the asset"
          />
        </p>
      </Checkbox>
    </SettingsPopup>
  );

  return (
    <Pane title="Scene" closeCallback={closeCallback} headerButton={settingsButton}>
      {(entries.length === 0) &&
        <LoadingBlocks className={Pane.styles.loading} />}
      {entries.length > 0 && (
        <FilterList matcher={matcher}>
          <FilterListFavorites>
            <ContextSection expansionIdentifier="context" />
            {favorites.map((favorite) => (
              <Group {...favorite} showOnlyEnabled={showOnlyEnabled} showHidden={showHiddenNodes} />
            ))}
          </FilterListFavorites>
          <FilterListData>
            {entries.map((entry) => <PropertyOwner {...entry} />)}
          </FilterListData>
        </FilterList>
      )}
    </Pane>
  );
}

ScenePane.propTypes = {
  closeCallback: PropTypes.func
};

ScenePane.defaultProps = {
  closeCallback: null
};

export default ScenePane;
