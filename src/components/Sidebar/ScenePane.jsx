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

class ScenePane extends Component {


  constructor(props) {
    super(props);
  }

  render() {

    var { nodes, shortcuts } = this.props;

    const guiPathTree = [{subowners:[], identifier:"everything",properties:[]}];

    const insertNode = (node, pathTree, index) => {

      var pathLevel = guiPathTree[0];
      var gotoIndex = 0;

      if (index == 0) {
        var exists = false;

        for (var i = 0; i < pathLevel.subowners.length; ++i) {
          if (pathLevel.subowners[i].identifier == pathTree[index]) {
            pathLevel = pathLevel.subowners[i];
            exists = true;
          }
        }

        if (!exists) {
            pathLevel.subowners.push({identifier: pathTree[index], subowners: [], properties: []});
            pathLevel = pathLevel.subowners[pathLevel.subowners.length-1];
        }
      } else {
        while(gotoIndex <= index) {
          var exists = -1;
          for (var i = 0; i < pathLevel.subowners.length; ++i) {
            if (pathLevel.subowners[i].identifier == pathTree[gotoIndex]) {
              exists = i;
              i = pathLevel.length;
            }
          }

          if (exists == -1) {
            pathLevel.subowners.push({identifier:pathTree[gotoIndex], subowners: [], properties: []});            
            pathLevel = pathLevel.subowners[pathLevel.subowners.length-1];
          } else {
             pathLevel = pathLevel.subowners[exists];
          }
          gotoIndex++;
        }
      }
      
      if ( (pathTree.length - 1) == index) {
        pathLevel.subowners.push(node);
      } else {
        insertNode(node, pathTree, index + 1);
      }
    };

    const addGuiPathsToPropertyTree = (nodes) => {

      for(var i = 0; i < nodes.length; ++i) {
        for(var j = 0; j < nodes[i].properties.length; ++j) {
          
          var nodeHidden = false;
          for(var k = 0; k < nodes[i].properties.length; ++k) {
             var prop = nodes[i].properties[k];
             if (prop.id == "GuiHidden") {
                nodeHidden = true;
             }
          }

          var prop = nodes[i].properties[j];
          if ( prop.id == "GuiPath" && (!nodeHidden) ) {
            var path = prop.Value;
            var pathTree = path.split('/');
            pathTree.shift();
            nodes[i].isSceneGraphNode = true
            insertNode(nodes[i], pathTree, 0);
          }
        }
      }
    };

    addGuiPathsToPropertyTree(nodes);
    nodes = guiPathTree[0].subowners;
    var shortCutsAsTreeEntry = {subowners:shortcuts, identifier: "Shortcuts", properties:[]};
    nodes.push(shortCutsAsTreeEntry);

    var filterSubObjects = true;

    return (
      <Pane title="Scene" closeCallback={this.props.closeCallback}>
        { (nodes.length === 0) && (
          <LoadingBlocks className={Pane.styles.loading} />
        )}

        { nodes.length > 0 && (
          <FilterList data={nodes} viewComponent={ScenePaneListItem} searchAutoFocus filterSubObjects />
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
    shortcuts: state.shortcuts.data.shortcuts
  };
};

ScenePane = connect(
  mapStateToProps,
)(ScenePane);

export default ScenePane;
