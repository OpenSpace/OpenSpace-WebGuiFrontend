import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Pane from './Pane';
import LoadingBlocks from '../common/LoadingBlock/LoadingBlocks';
import FilterList from '../common/FilterList/FilterList';
import PropertyOwner from './Properties/PropertyOwner';
import { ScenePrefixKey } from '../../api/keys';
import Setting from './Setting'
import { setEventTimelineVisibility } from '../../api/Actions'

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
    const { eventTimelineVisible, setTimelineVisible } = this.props;

    return (
      <Pane className={`${styles.pane}`} title="Settings" closeCallback={this.props.closeCallback}>
        <h2>Properties</h2>
        <div className={styles.SettingGroupWrapper}>
          {(entries.length === 0) && (
            <LoadingBlocks className={Pane.styles.loading} />
          )}
          {(entries.length > 0) && (
            <FilterList data={entries} viewComponent={PropertyOwner} searchAutoFocus showSearch={false} />
          )}
        </div>

        <h2>Interface Options</h2>

        <div className={styles.SettingGroupWrapper}>
          <Setting title="Event Timeline" checked={eventTimelineVisible} onChange={setTimelineVisible} />
        </div>

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
  var propertyOwners = [];

  if (state.propertyTree && state.propertyTree.propertyOwners) {

    const allUris = Object.keys(state.propertyTree.propertyOwners || {});

    propertyOwners = allUris.filter(uri => {
      return uri !== ScenePrefixKey && uri.indexOf('.') === -1
    });

  }

  return {
    propertyOwners,
    eventTimelineVisible: state.missions.showTimeline,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setTimelineVisible: event => {
      dispatch(setEventTimelineVisibility(event.target.checked))
    }
  }
}

SettingsPane = connect(
  mapStateToProps,
  mapDispatchToProps,
)(SettingsPane);

export default SettingsPane;
