import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { SceneKey } from '../../api/keys';
import {
  getLastWordOfUri, isDeadEnd, isPropertyOwnerHidden, isPropertyVisible
} from '../../utils/propertyTreeHelpers';
import { CaseInsensitiveSubstring, ListCaseInsensitiveSubstring } from '../../utils/StringMatchers';
import subStateToProps from '../../utils/subStateToProps';
import { FilterList, FilterListData, FilterListFavorites } from '../common/FilterList/FilterList';
import LoadingBlocks from '../common/LoadingBlock/LoadingBlocks';

import Pane from './Pane';
import SettingsPaneListItem from './SettingsPaneListItem';

function SettingsPane({
  topPropertyOwners, subPropertyOwners, properties, closeCallback
}) {
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

const mapStateToSubState = (state) => ({
  properties: state.propertyTree.properties,
  propertyOwners: state.propertyTree.propertyOwners,
  propertyTree: state.propertyTree
});

const mapSubStateToProps = ({ properties, propertyOwners, propertyTree }) => {
  if (!propertyTree || !propertyOwners || !properties) {
    return { };
  }

  const allOwnerUris = Object.keys(propertyOwners || {});
  const nonSceneTopPropertyOwners = allOwnerUris.filter((uri) => uri !== SceneKey && uri.indexOf('.') === -1);

  function collectUrisRecursively(owners, allOwners, allProperties) {
    owners.forEach((uri) => {
      const subowners = propertyOwners[uri].subowners || {};
      const propertiesUri = propertyOwners[uri].properties || {};
      // Parameter assignment necessary for recursion
      // eslint-disable-next-line no-param-reassign
      allOwners = allOwners.concat(subowners);
      // eslint-disable-next-line no-param-reassign
      allProperties = allProperties.concat(propertiesUri);
      // eslint-disable-next-line no-param-reassign
      [allOwners, allProperties] = collectUrisRecursively(subowners, allOwners, allProperties);
    });

    // Stops when owners are empty
    return [allOwners, allProperties];
  }

  // Collect uris of all sub property owners and properties
  let subPropertyOwners = [];
  let searchableProperties = [];
  [subPropertyOwners, searchableProperties] = collectUrisRecursively(
    nonSceneTopPropertyOwners,
    subPropertyOwners,
    searchableProperties
  );

  // Remove any hidden owners/properties
  subPropertyOwners = subPropertyOwners.filter((uri) => (!isPropertyOwnerHidden(properties, uri) &&
      !isDeadEnd(propertyOwners, properties, uri)));
  searchableProperties = searchableProperties.filter((uri) => isPropertyVisible(properties, uri));

  // Compose the information we need for the search
  const topOwnersInfo = nonSceneTopPropertyOwners.map((uri) => ({
    uri, name: getLastWordOfUri(uri)
  }));

  const subPropertyOwnersInfo = subPropertyOwners.map((uri) => ({
    uri, name: getLastWordOfUri(uri)
  }));

  const propertiesInfo = searchableProperties.map((uri) => ({
    uri, names: [getLastWordOfUri(uri), properties[uri].description.Name]
  }));

  return {
    topPropertyOwners: topOwnersInfo,
    subPropertyOwners: subPropertyOwnersInfo,
    properties: propertiesInfo
  };
};

SettingsPane.propTypes = {
  topPropertyOwners: PropTypes.array.isRequired,
  subPropertyOwners: PropTypes.array.isRequired,
  properties: PropTypes.array.isRequired
};

export default connect(
  subStateToProps(mapSubStateToProps, mapStateToSubState)
)(SettingsPane);
