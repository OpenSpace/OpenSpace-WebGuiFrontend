import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Pane from './Pane';
import FilterList from '../common/FilterList/FilterList';
import LoadingBlocks from '../common/LoadingBlock/LoadingBlocks';
import PropertyOwner from './Properties/PropertyOwner';
import Shortcut from './Shortcut';
import styles from './ScenePane.scss';
import ScenePaneListItem from './ScenePaneListItem';

import { setPropertyTreeExpansion } from '../../api/Actions'

const addShortcutsToTree = (shortcuts, tree) => {
  shortcuts.forEach(shortcut => {
    if (shortcut.guiPath !== undefined) {
      const path = shortcut.guiPath.split('/');
      path.shift();
      shortcut.identifier = shortcut.name;
      shortcut.isSceneGraphNode = false;
      insertNode(shortcut, path, tree);
    }
  });
}

class ScenePane extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { nodes, shortcuts } = this.props;

    //const guiPathTree = createNode('Everything', expansion, setExpansionFunction)
    //addPropertyOwnerToTree(nodes, guiPathTree, expansion, setExpansionFunction);

    //const shortcutsAsTreeEntry = createNode('Shortcuts', expansion, setExpansionFunction);
    //addShortcutsToTree(shortcuts, shortcutsAsTreeEntry, expansion, setExpansionFunction);

    const list = [];
    list.push(shortcutsAsTreeEntry);

    return (
      <Pane title="Scene" closeCallback={this.props.closeCallback}>
        { (list.length === 0) && (
          <LoadingBlocks className={Pane.styles.loading} />
        )}

        { list.length > 0 && (
          <FilterList data={list} viewComponent={ScenePaneListItem} searchAutoFocus filterSubObjects />
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

const mapStateToProps = (state) => {
  const sceneType = 'Scene';
  const propertyOwners = state.propertyTree.propertyOwners || [];
  const expansion = state.local.propertyTreeExpansion;
  const scene = propertyOwners['Scene'];
  let nodes = scene.subowners || [];

  return {
    nodes: nodes,
    shortcuts: state.shortcuts.data.shortcuts || [],
    expansion,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setExpansionFunction: identifier => expanded => {
      dispatch(setPropertyTreeExpansion({
        identifier: identifier,
        expanded: expanded
      }))
    }
  }
}

ScenePane = connect(
  mapStateToProps,
  mapDispatchToProps
)(ScenePane);

export default ScenePane;
