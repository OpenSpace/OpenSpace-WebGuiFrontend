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

const createNode = (identifier, expansion, setExpansionFunction) => ({
  identifier,
  subowners: [],
  properties: [],
  expanded: expansion[identifier],
  setExpanded: setExpansionFunction(identifier)
});

const expandableNode = (node, expansion, setExpansionFunction, path) => {
  const newPath = path.slice();
  newPath.push(node.identifier);

  const stringifiedPath = newPath.join('/');
  return {
    ...node,
    subowners: node.subowners.map((child) =>
      expandableNode(child, expansion, setExpansionFunction, newPath)
    ),
    expanded: expansion[stringifiedPath],
    setExpanded: setExpansionFunction(stringifiedPath)
  }
}

const insertNode = (node, path, tree, expansion, setExpansionFunction) => {
  if (path.length === 0) {
    tree.subowners.push(expandableNode(node, expansion, setExpansionFunction, path))
    return;
  }

  const pathComponent = path.shift();

  let child = tree.subowners.find((subowner) => {
    return subowner.identifier == pathComponent;
  });

  if (!child) {
    child = createNode(pathComponent, expansion, setExpansionFunction);
    tree.subowners.push(child);
  }
  insertNode(node, path, child, expansion, setExpansionFunction);
};

const addPropertyOwnerToTree = (nodes, tree, expansion, setExpansionFunction) => {
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
      insertNode(node, path, tree, expansion, setExpansionFunction);
    }
  });
};

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
    const { nodes, shortcuts, expansion, setExpansionFunction } = this.props;

    const guiPathTree = createNode('Everything', expansion, setExpansionFunction)
    addPropertyOwnerToTree(nodes, guiPathTree, expansion, setExpansionFunction);

    const shortcutsAsTreeEntry = createNode('Shortcuts', expansion, setExpansionFunction);
    addShortcutsToTree(shortcuts, shortcutsAsTreeEntry, expansion, setExpansionFunction);

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
  const expansion = state.local.propertyTreeExpansion;

  const rootNodes = subowners.filter(element => element.identifier === sceneType);

  let nodes = [];

  rootNodes.forEach((node) => {
    nodes = [...nodes, ...node.subowners];
  });

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
