import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Pane from './Pane';
import LoadingBlocks from '../common/LoadingBlock/LoadingBlocks';
import FilterList from '../common/FilterList/FilterList';
import PropertyOwner from './Properties/PropertyOwner';

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

const mapStateToProps = (state) => {
  const sceneUri = 'Scene';

  if (!state.propertyTree) {
    return { entries: [] };
  }
  if (!state.propertyTree.propertyOwners) {
    return { entries: [] };
  }

  const allUris = Object.keys(state.propertyTree.propertyOwners || {});

  const propertyOwners = allUris.filter(uri => {
    return uri !== sceneUri && uri.indexOf('.') === -1
  });

  return {
    propertyOwners,
  };
};

SettingsPane = connect(
  mapStateToProps,
)(SettingsPane);

export default SettingsPane;
