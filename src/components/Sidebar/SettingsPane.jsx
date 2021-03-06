import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Pane from './Pane';
import LoadingBlocks from '../common/LoadingBlock/LoadingBlocks';
import FilterList from '../common/FilterList/FilterList';
import { SceneKey } from '../../api/keys';
import subStateToProps from '../../utils/subStateToProps';
import { CaseInsensitiveSubstring, ListCaseInsensitiveSubstring } from '../../utils/StringMatchers';
import SettingsPaneListItem from './SettingsPaneListItem';
import { getLastWordOfUri, isPropertyVisible, isPropertyOwnerHidden, isDeadEnd } from './../../utils/propertyTreeHelpers'

import styles from './SettingsPane.scss';

class SettingsPane extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const defaultEntries = this.props.topPropertyOwners.map(p => ({
      key: p.uri,
      uri: p.uri,
      name: p.name,
      type: 'propertyOwner',
      expansionIdentifier: p.uri
    }));

    const searchEntries = defaultEntries
      .concat(this.props.subPropertyOwners.map(p => ({
        key: p.uri,
        uri: p.uri,
        name: p.name,
        type: 'subPropertyOwner',
        expansionIdentifier: p.uri
      }))
      .concat(this.props.properties.map(p => ({
        key: p.uri,
        uri: p.uri,
        names: p.names,
        type: 'property'
      }))
    ));

    const matcher = (entry, searchString) => {
      searchString = searchString.trim();

      if(!searchString) {
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
  propertyTree: state.propertyTree
});

const mapSubStateToProps = ({ properties, propertyOwners, propertyTree }) => {
  if (!propertyTree || !propertyOwners || !properties ) {
    return { };
  }

  const allOwnerUris = Object.keys(propertyOwners || {});
  const nonSceneTopPropertyOwners = allOwnerUris.filter(uri => {
    return uri !== SceneKey && uri.indexOf('.') === -1;
  });

  const collectUrisRecursively = (owners, collectedOwners, collectedProperties) => {
    owners.forEach(uri => {
      let subowners = propertyOwners[uri].subowners || {};
      let properties = propertyOwners[uri].properties || {};
      collectedOwners = collectedOwners.concat(subowners);
      collectedProperties = collectedProperties.concat(properties);

      [collectedOwners, collectedProperties] = collectUrisRecursively(
        subowners, collectedOwners, collectedProperties);
    });

    // Stops when owners are empty
    return [ collectedOwners, collectedProperties ];
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
  subPropertyOwners = subPropertyOwners.filter(uri => {
    return (!isPropertyOwnerHidden(properties, uri) && 
      !isDeadEnd(propertyOwners, properties, uri));
  });
  searchableProperties = searchableProperties.filter(uri => {
    return isPropertyVisible(properties, uri);
  });

  // Compose the information we need for the search
  const topOwnersInfo = nonSceneTopPropertyOwners.map(uri => {
    return { uri: uri, name: getLastWordOfUri(uri) };
  });

  const subPropertyOwnersInfo = subPropertyOwners.map(uri => {
    return { uri: uri, name: getLastWordOfUri(uri) };
  });

  const propertiesInfo = searchableProperties.map(uri => {
    return { uri: uri, names:[getLastWordOfUri(uri), properties[uri].description.Name] };
  });

  return {
    topPropertyOwners: topOwnersInfo,
    subPropertyOwners: subPropertyOwnersInfo,
    properties: propertiesInfo
  };
};

SettingsPane = connect(
  subStateToProps(mapSubStateToProps, mapStateToSubState)
)(SettingsPane);

export default SettingsPane;
