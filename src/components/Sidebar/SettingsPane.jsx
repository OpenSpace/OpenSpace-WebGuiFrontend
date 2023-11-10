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

function collectUrisRecursively(owners, allPropertyOwners, collectedOwners, collectedProperties) {
  owners.forEach((uri) => {
    const subowners = allPropertyOwners[uri].subowners || [];
    const propertiesUri = allPropertyOwners[uri].properties || [];
    // Parameter assignment necessary for recursion
    // eslint-disable-next-line no-param-reassign
    collectedOwners = collectedOwners.concat(subowners);
    // eslint-disable-next-line no-param-reassign
    collectedProperties = collectedProperties.concat(propertiesUri);
    // eslint-disable-next-line no-param-reassign
    [collectedOwners, collectedProperties] = collectUrisRecursively(
      subowners,
      allPropertyOwners,
      collectedOwners,
      collectedProperties
    );
  });

  // Stops when owners are empty
  return [collectedOwners, collectedProperties];
}

function SettingsPane({ closeCallback }) {
  const topPropertyOwners = useSelector((state) => {
    if (!state?.propertyTree?.propertyOwners) {
      return [];
    }
    const allOwnerUris = Object.keys(state.propertyTree.propertyOwners || []);
    // Remove owners that are in the Scene
    return allOwnerUris.filter((uri) => uri !== SceneKey && uri.indexOf('.') === -1);
  });

  const topPropertyOwnersInfo = topPropertyOwners.map((uri) => ({
    uri, name: getLastWordOfUri(uri)
  }));

  // Find all subpropertyowners and propeties that we want to search among
  const [subPropertyOwners, properties] = useSelector((state) => {
    if (!state?.propertyTree?.propertyOwners || !state?.propertyTree?.properties) {
      return [[], []];
    }
    let searchableSubOwners = [];
    let searchableProperties = [];
    [searchableSubOwners, searchableProperties] = collectUrisRecursively(
      topPropertyOwners,
      state.propertyTree.propertyOwners,
      searchableSubOwners,
      searchableProperties
    );


    // Remove any hidden owners/properties
    searchableSubOwners = searchableSubOwners.filter(
      (uri) => (
        !isPropertyOwnerHidden(state.propertyTree.properties, uri) &&
        !isDeadEnd(state.propertyTree.propertyOwners, state.propertyTree.properties, uri)
      )
    );

    searchableProperties = searchableProperties.filter(
      (uri) => isPropertyVisible(state.propertyTree.properties, uri)
    );

    // Compose the information we need for the search
    const subPropertyOwnersInfo = searchableSubOwners.map((uri) => ({
      uri, name: getLastWordOfUri(uri)
    }));

    const propertiesInfo = searchableProperties.map((uri) => ({
      uri, names: [getLastWordOfUri(uri), state.propertyTree.properties[uri].description.Name]
    }));

    return [subPropertyOwnersInfo, propertiesInfo];
  });

  const defaultEntries = topPropertyOwnersInfo.map((p) => ({
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
      {(defaultEntries.length === 0) && (
        <LoadingBlocks className={Pane.styles.loading} />
      )}

      {(defaultEntries.length > 0) && (
        <FilterList matcher={matcher}>
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
