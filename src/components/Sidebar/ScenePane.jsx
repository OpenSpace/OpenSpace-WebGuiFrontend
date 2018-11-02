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


const createNode = identifier => ({
  identifier,
  subowners: [],
  properties: []
});

const insertNode = (node, path, tree) => {
  if (path.length === 0) {
    tree.subowners.push(node);
    return;
  }

  const pathComponent = path.shift();

  let child = tree.subowners.find((subowner) => {
    return subowner.identifier == pathComponent;
  });

  if (!child) {
    child = createNode(pathComponent);
    tree.subowners.push(child);
  }
  insertNode(node, path, child);
};

const addPropertyOwnerToTree = (nodes, tree) => {
  nodes.forEach(node => {
    const nodeHidden = node.properties.find(property => {
      return property.id === "GuiHidden";
    });

    const guiPath = node.properties.find(property => {
      return property.id === "GuiPath";
    });

    if (guiPath && guiPath.Value && !nodeHidden) {
      const path = guiPath.Value.split('/');
      path.shift();
      node.isSceneGraphNode = true;
      insertNode(node, path, tree);
    }
  });
};

const addShortcutsToTree = (shortcuts, tree) => {
  shortcuts.forEach(shortcut => {
    if (shortcut.guiPath !== undefined) {
      const path = shortcut.guiPath.split('/');
      path.shift();
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

    const guiPathTree = createNode('Everything')
    addPropertyOwnerToTree(nodes, guiPathTree);

    const shortcutsAsTreeEntry = createNode('Shortcuts');
    addShortcutsToTree(shortcuts, shortcutsAsTreeEntry);

    const list = guiPathTree.subowners;
    list.push(shortcutsAsTreeEntry);

    var filterSubObjects = true;

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
  const subowners = state.propertyTree.subowners || [];

  const rootNodes = subowners.filter(element => element.identifier === sceneType);

  let nodes = [];

  rootNodes.forEach((node) => {
    nodes = [...nodes, ...node.subowners];
  });

  return {
    nodes: nodes,
    shortcuts: state.shortcuts.data.shortcuts || []
  };
};

ScenePane = connect(
  mapStateToProps,
)(ScenePane);

export default ScenePane;
