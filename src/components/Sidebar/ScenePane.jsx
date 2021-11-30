import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Pane from './Pane';
import FilterList from '../common/FilterList/FilterList';
import LoadingBlocks from '../common/LoadingBlock/LoadingBlocks';
import ScenePaneListItem from './ScenePaneListItem';
import { ObjectWordBeginningSubstring } from '../../utils/StringMatchers';
import subStateToProps from '../../utils/subStateToProps';

class ScenePane extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let favorites = [];
    const entries = this.props.propertyOwners.map(uri => ({
      key: uri,
      type: 'propertyOwner',
      uri: uri
    }));

    favorites.push({
      key: 'context',
      type: 'context',
    });

    favorites = favorites.concat(this.props.groups.map(item => ({
      key: item,
      path: item,
      type: 'group'
    })));

    return (
      <Pane title="Scene" closeCallback={this.props.closeCallback}>
        { (entries.length === 0) && (
          <LoadingBlocks className={Pane.styles.loading} />
        )}

        { entries.length > 0 && (
          <FilterList favorites={favorites}
                      matcher={this.props.matcher}
                      data={entries}
                      viewComponent={ScenePaneListItem}
                      searchAutoFocus />
        )}
      </Pane>
    );
  }
}

ScenePane.propTypes = {
  closeCallback: PropTypes.func,
};

ScenePane.defaultProps = {
  closeCallback: null,
};

const mapStateToSubState = (state) => ({
  properties: state.propertyTree.properties,
  propertyOwners: state.propertyTree.propertyOwners,
  groups: state.groups,
});

const mapSubStateToProps = ({ groups, properties, propertyOwners }) => {
  const topLevelGroups = Object.keys(groups).filter(path => {
    // Get the number of slashes in the path
    const depth = (path.match(/\//g) || []).length;
    return depth <= 1;
  }).map(path =>
    path.slice(1) // Remove leading slash.
  ).reduce((obj, key) => ({ // Convert back to object
      ...obj,
      [key]: true
  }), {});

  // Reorder properties based on SceneProperties ordering property.
  let sortedGroups = [];
  const ordering = properties['Modules.ImGUI.Main.SceneProperties.Ordering'];
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

  const matcher = (test, search) => {
    if (test.type === 'propertyOwner') {
      const node = propertyOwners[test.uri] || {};
      const guiHidden = properties[test.uri + ".GuiHidden"];
      return ObjectWordBeginningSubstring(node, search) && !guiHidden;
    }
    return false;
  };

  const sceneOwner = propertyOwners.Scene || {};

  return {
    groups: sortedGroups,
    propertyOwners: sceneOwner.subowners || [],
    matcher
  };
};


ScenePane = connect(
  subStateToProps(mapSubStateToProps, mapStateToSubState)
)(ScenePane);

export default ScenePane;
