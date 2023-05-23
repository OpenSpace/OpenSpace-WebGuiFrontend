import React from 'react';
import { connect } from 'react-redux';

import { removeNodeMetaPopover, setPopoverActiveTab, setPopoverVisibility } from '../../api/Actions';
import Picker from '../BottomBar/Picker';
import Button from '../common/Input/Button/Button';
import Popover from '../common/Popover/Popover';
import Row from '../common/Row/Row';
import { openUrl } from '../../utils/helpers';
import styles from './NodeMetaPanel.scss';

function NodeMetaPanel({
  removeNodeMetaPopoverAction, node, setPopoverActiveTabAction, showPopover,
  documentation, activeTab, attached, nodeName, description
}) {
  function togglePopover() {
    removeNodeMetaPopoverAction(node);
  }

  function contentForTab() {
    // Description tag
    if (activeTab === 0) {
      return (
        <Row>
          <div className={styles.description_container}>
            {description}
          </div>
        </Row>
      );
    }
    // Asset meta info tab
    if (!documentation) {
      return (
        <Row>
          <div className={styles.description_container}>No meta info found.</div>
        </Row>
      );
    }

    return (
      <div>
        <Row>
          {`Author: ${documentation.author}`}
        </Row>
        <Row>
          {`Version: ${documentation.version}`}
        </Row>
        <Row>
          {`License: ${documentation.license.replace(/\\n/g, '')}`}
        </Row>
        <Button
          onClick={() => openUrl(documentation.url)}
          style={{ width: '100%' }}>
          Open URL
        </Button>
      </div>
    );
  }

  function popover() {
    const windowTitle = `${nodeName}- Asset Infomation`;
    return (
      <Popover
        className={`${Picker.Popover} && ${styles.nodePopover}`}
        title={windowTitle}
        closeCallback={togglePopover}
        attached={attached}
        detachable
      >
        <div className={`${Popover.styles.content} ${styles.contentContainer}`}>
          { contentForTab() }
        </div>
        <hr className={Popover.styles.delimiter} />

        <div className={`${Popover.styles.row} ${Popover.styles.content}`}>
          <Button
            block
            largetext={activeTab === 0}
            smalltext={activeTab !== 0}
            key={0}
            onClick={() => setPopoverActiveTabAction(0)}
          >
            Description
          </Button>
          <Button
            block
            largetext={activeTab === 1}
            smalltext={activeTab !== 0}
            key={1}
            onClick={() => setPopoverActiveTabAction(1)}
          >
            Info
          </Button>
        </div>
      </Popover>
    );
  }

  return (
    <div className={Picker.Wrapper}>
      { showPopover && popover() }
    </div>
  );
}

const mapStateToProps = (state, ownProps) => {
  const nodeURI = ownProps.uri;

  const myPopover = state.local.popovers.activeNodeMetaPanels[ownProps.uri];
  const popoverVisible = myPopover ? myPopover.visible : false;
  const popoverAttached = myPopover ? myPopover.attached : false;
  const popoverActiveTab = myPopover && myPopover.activeTab ? myPopover.activeTab : 0;

  let node = {};
  if (state.propertyTree.propertyOwners[nodeURI]) {
    node = state.propertyTree.propertyOwners[nodeURI];
  }
  const nodeName = node.name;

  let guiDescription = null;
  if (state.propertyTree.properties[`${nodeURI}.GuiDescription`]) {
    guiDescription = state.propertyTree.properties[`${nodeURI}.GuiDescription`].value;
    guiDescription = guiDescription.replace(/\\n/g, '');
    guiDescription = guiDescription.replace(/<br>/g, '');
  }
  if (!guiDescription) {
    guiDescription = 'No description found';
  }

  // Find documentation
  const identifier = nodeURI.split('.').pop(); // Get last word in uri
  const foundDoc = state.documentation.data.find((doc) => {
    if (doc?.identifiers && doc.identifiers.includes(identifier)) {
      return true;
    }
    return false;
  });

  return {
    nodeName,
    activeTab: popoverActiveTab,
    showPopover: popoverVisible,
    attached: popoverAttached,
    documentation: foundDoc,
    description: guiDescription
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const setPopoverVisibilityAction = (visible, uri) => {
    dispatch(setPopoverVisibility({
      popover: uri,
      visible
    }));
  };

  const removeNodeMetaPopoverAction = () => {
    dispatch(removeNodeMetaPopover({
      identifier: ownProps.uri
    }));
  };

  const setPopoverActiveTabAction = (index) => {
    dispatch(setPopoverActiveTab({
      identifier: ownProps.uri,
      activeTab: index,
      isMeta: true
    }));
  };

  return {
    setPopoverVisibilityAction,
    removeNodeMetaPopoverAction,
    setPopoverActiveTabAction
  };
};

NodeMetaPanel = connect(
  mapStateToProps,
  mapDispatchToProps,
)(NodeMetaPanel);

export default NodeMetaPanel;
