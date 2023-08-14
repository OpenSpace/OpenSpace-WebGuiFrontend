import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import { SceneKey } from '../../api/keys';
import {
  getLastWordOfUri, isDeadEnd, isPropertyOwnerHidden, isPropertyVisible
} from '../../utils/propertyTreeHelpers';
import { CaseInsensitiveSubstring, ListCaseInsensitiveSubstring } from '../../utils/StringMatchers';
import { FilterList, FilterListData, FilterListFavorites } from '../common/FilterList/FilterList';
import LoadingBlocks from '../common/LoadingBlock/LoadingBlocks';

import Pane from './Pane';
import SettingsPaneListItem from './SettingsPaneListItem';

function collectOwnersRecursively(propertyOwners, owners, allOwners) {
  owners.forEach((uri) => {
    const subowners = propertyOwners[uri]?.subowners || [];
    // Parameter assignment necessary for recursion
    // eslint-disable-next-line no-param-reassign
    allOwners = allOwners.concat(subowners);
    // eslint-disable-next-line no-param-reassign
    allOwners = collectOwnersRecursively(propertyOwners, subowners, allOwners);
  });

  // Stops when owners are empty
  return allOwners;
}

function collectPropertiesRecursively(propertyOwners, owners, allProperties) {
  owners.forEach((uri) => {
    const subowners = propertyOwners[uri]?.subowners || [];
    const propertiesUri = propertyOwners[uri]?.properties || [];
    // Parameter assignment necessary for recursion
    // eslint-disable-next-line no-param-reassign
    allProperties = allProperties.concat(propertiesUri);
    // eslint-disable-next-line no-param-reassign
    allProperties = collectPropertiesRecursively(propertyOwners, subowners, allProperties);
  });

  // Stops when owners are empty
  return allProperties;
}

function SettingsPane({
  closeCallback
}) {
  const topPropertyOwners = useSelector((state) => {
    if (!state?.propertyTree?.propertyOwners) {
      return [];
    }
    const allOwnerUris = Object.keys(state.propertyTree.propertyOwners || []);
    // Remove owners that are in the Scene
    const nonSceneTopPropertyOwners = allOwnerUris.filter((uri) => uri !== SceneKey && uri.indexOf('.') === -1);
    return nonSceneTopPropertyOwners.map((uri) => ({
      uri, name: getLastWordOfUri(uri)
    }));
  });
  const subPropertyOwners = useSelector((state) => {
    if (!state?.propertyTree?.propertyOwners || !state?.propertyTree?.properties) {
      return [];
    }
    const allOwners = state.propertyTree.propertyOwners;
    const allProps = state.propertyTree.properties;
    const found = collectOwnersRecursively(allOwners, topPropertyOwners, []);
    const visibleSubPropertyOwners = found.filter((uri) => (
      !isPropertyOwnerHidden(allProps, uri) && !isDeadEnd(allOwners, allProps, uri)
    ));
    return visibleSubPropertyOwners.map((uri) => ({
      uri, name: getLastWordOfUri(uri)
    }));
  });

  const properties = useSelector((state) => {
    if (!state?.propertyTree?.propertyOwners || !state?.propertyTree?.properties) {
      return [];
    }
    const allOwners = state.propertyTree.propertyOwners;
    const allProps = state.propertyTree.properties;
    const found = collectPropertiesRecursively(allOwners, topPropertyOwners, []);
    const visible = found.filter((uri) => isPropertyVisible(allOwners, uri));

    return visible.map((uri) => ({
      uri, names: [getLastWordOfUri(uri), allProps[uri].description.Name]
    }));
  });

  const defaultEntries = topPropertyOwners.map((p) => ({
    key: p.uri,
    uri: p.uri,
    name: p.name,
    type: 'propertyOwner',
    expansionIdentifier: p.uri
  }));

  const searchEntries = defaultEntries
    .concat(subPropertyOwners.map((p) => ({
      key: p.uri,
      uri: p.uri,
      name: p.name,
      type: 'subPropertyOwner',
      expansionIdentifier: p.uri
    }))
      .concat(properties.map((p) => ({
        key: p.uri,
        uri: p.uri,
        names: p.names,
        type: 'property'
      }))));

  const matcher = (entry, searchString) => {
    const trimmedSearchString = searchString.trim();

    if (!trimmedSearchString) {
      return false; // guard against empty strings
    }

    if (entry.type === 'propertyOwner') {
      return CaseInsensitiveSubstring(entry.uri, trimmedSearchString);
    }
    if (entry.type === 'subPropertyOwner') {
      return CaseInsensitiveSubstring(entry.name, trimmedSearchString);
    }
    if (entry.type === 'property') {
      return ListCaseInsensitiveSubstring(entry.names, trimmedSearchString);
    }
    return null;
  };

  return (
    <Pane title="Settings" closeCallback={closeCallback}>
      { (defaultEntries.length === 0) && (
        <LoadingBlocks className={Pane.styles.loading} />
      )}

      {(defaultEntries.length > 0) && (
        <FilterList
          matcher={matcher}
        >
          <FilterListFavorites>
            {defaultEntries.map((entry) => <SettingsPaneListItem {...entry} />)}
          </FilterListFavorites>
          <FilterListData>
            {searchEntries.map((entry) => <SettingsPaneListItem {...entry} />)}
          </FilterListData>
        </FilterList>
      )}
    </Pane>
  );
}

SettingsPane.propTypes = {
  closeCallback: PropTypes.func
};

SettingsPane.defaultProps = {
  closeCallback: null
};

export default SettingsPane;
