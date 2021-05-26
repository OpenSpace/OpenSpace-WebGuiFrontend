import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Pane from './Pane';
import LoadingBlocks from '../common/LoadingBlock/LoadingBlocks';
import FilterList from '../common/FilterList/FilterList';
import PropertyOwner from './Properties/PropertyOwner';
import { SceneKey } from '../../api/keys';
import subStateToProps from '../../utils/subStateToProps';

import styles from './SettingsPane.scss';

class SettingsPane extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const entries = this.props.propertyOwners.map(uri => ({
      key: uri,
      uri: uri,
      expansionIdentifier: uri
    }));

    return (
      <Pane title="Settings" closeCallback={this.props.closeCallback}>
        { (entries.length === 0) && (
          <LoadingBlocks className={Pane.styles.loading} />
        )}

        {(entries.length > 0) && (
          <FilterList data={entries} viewComponent={PropertyOwner} searchAutoFocus />
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
  propertyOwners: state.propertyTree.propertyOwners
});

const mapSubStateToProps = ({ properties, propertyOwners }) => {
  if (!propertyOwners || !properties) {
    return { entries: [] };
  }

  const allUris = Object.keys(propertyOwners || {});

  const propertyOwnerUris = allUris.filter(uri => {
    return uri !== SceneKey && uri.indexOf('.') === -1;
  });

  return {
    propertyOwners: propertyOwnerUris,
  };
};

SettingsPane = connect(
  subStateToProps(mapSubStateToProps, mapStateToSubState)
)(SettingsPane);

export default SettingsPane;
