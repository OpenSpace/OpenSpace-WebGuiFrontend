import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SceneKey } from '../../api/keys';
import { CaseInsensitiveSubstring, ListCaseInsensitiveSubstring } from '../../utils/StringMatchers';
import subStateToProps from '../../utils/subStateToProps';
import FilterList from '../common/FilterList/FilterList';
import LoadingBlocks from '../common/LoadingBlock/LoadingBlocks';
import {
  getLastWordOfUri, isDeadEnd, isPropertyOwnerHidden, isPropertyVisible,
} from '../../utils/propertyTreeHelpers';
import Pane from './Pane';
import SettingsPaneListItem from './SettingsPaneListItem';
import styles from './SettingsPane.scss'; // OBS! Unused

class SettingsPane extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const defaultEntries = this.props.topPropertyOwners.map((p) => ({
      key: p.uri,
      uri: p.uri,
      name: p.name,
      type: 'propertyOwner',
      expansionIdentifier: p.uri,
    }));

    const searchEntries = defaultEntries
      .concat(this.props.subPropertyOwners.map((p) => ({
        key: p.uri,
        uri: p.uri,
        name: p.name,
        type: 'subPropertyOwner',
        expansionIdentifier: p.uri,
      }))
        .concat(this.props.properties.map((p) => ({
          key: p.uri,
          uri: p.uri,
          names: p.names,
          type: 'property',
        }))));

    const matcher = (entry, searchString) => {
      searchString = searchString.trim();

      if (!searchString) {
        return false; // guard against empty strings
      }

      if (entry.type === 'propertyOwner') {
        return CaseInsensitiveSubstring(entry.uri, searchString);
      }
      if (entry.type === 'subPropertyOwner') {
        return CaseInsensitiveSubstring(entry.name, searchString);
      }
      if (entry.type === 'property') {
        return ListCaseInsensitiveSubstring(entry.names, searchString);
      }
    };

    return (
      <Pane title="Settings" closeCallback={this.props.closeCallback}>
        { (defaultEntries.length === 0) && (
          <LoadingBlocks className={Pane.styles.loading} />
        )}

        {(defaultEntries.length > 0) && (
          <FilterList
            favorites={defaultEntries}
            data={searchEntries}
            viewComponent={SettingsPaneListItem}
            matcher={matcher}
            searchAutoFocus
          />
        )}
      </Pane>
    );
  }
}

SettingsPane.propTypes = {
  closeCallback: PropTypes.func,
};

SettingsPane.defaultProps = {
  closeCallback: null,
};

const mapStateToSubState = (state) => ({
  properties: state.propertyTree.properties,
  propertyOwners: state.propertyTree.propertyOwners,
  propertyTree: state.propertyTree,
});

const mapSubStateToProps = ({ properties, propertyOwners, propertyTree }) => {
  if (!propertyTree || !propertyOwners || !properties) {
    return { };
  }

  const allOwnerUris = Object.keys(propertyOwners || {});
  const nonSceneTopPropertyOwners = allOwnerUris.filter((uri) => uri !== SceneKey && uri.indexOf('.') === -1);

  const collectUrisRecursively = (owners, collectedOwners, collectedProperties) => {
    owners.forEach((uri) => {
      const subowners = propertyOwners[uri].subowners || {};
      const properties = propertyOwners[uri].properties || {};
      collectedOwners = collectedOwners.concat(subowners);
      collectedProperties = collectedProperties.concat(properties);

      [collectedOwners, collectedProperties] = collectUrisRecursively(subowners, collectedOwners, collectedProperties);
    });

    // Stops when owners are empty
    return [collectedOwners, collectedProperties];
  };

  // Collect uris of all sub property owners and properties
  let subPropertyOwners = [];
  let searchableProperties = [];
  [subPropertyOwners, searchableProperties] = collectUrisRecursively(
    nonSceneTopPropertyOwners,
    subPropertyOwners,
    searchableProperties,
  );

  // Remove any hidden owners/properties
  subPropertyOwners = subPropertyOwners.filter((uri) => (!isPropertyOwnerHidden(properties, uri)
      && !isDeadEnd(propertyOwners, properties, uri)));
  searchableProperties = searchableProperties.filter((uri) => isPropertyVisible(properties, uri));

  // Compose the information we need for the search
  const topOwnersInfo = nonSceneTopPropertyOwners.map((uri) => ({ uri, name: getLastWordOfUri(uri) }));

  const subPropertyOwnersInfo = subPropertyOwners.map((uri) => ({ uri, name: getLastWordOfUri(uri) }));

  const propertiesInfo = searchableProperties.map((uri) => ({ uri, names: [getLastWordOfUri(uri), properties[uri].description.Name] }));

  return {
    topPropertyOwners: topOwnersInfo,
    subPropertyOwners: subPropertyOwnersInfo,
    properties: propertiesInfo,
  };
};

SettingsPane = connect(
  subStateToProps(mapSubStateToProps, mapStateToSubState),
)(SettingsPane);

export default SettingsPane;
