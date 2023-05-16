import React, { Component } from 'react';
import { connect } from 'react-redux';
import { removeNodeMetaPopover, setPopoverActiveTab, setPopoverVisibility } from '../../api/Actions';
import { RenderableTypes } from '../../api/keys';
import Picker from '../BottomBar/Picker';
import Button from '../common/Input/Button/Button';
import MaterialIcon from '../common/MaterialIcon/MaterialIcon';
import Popover from '../common/Popover/Popover';
import Row from '../common/Row/Row';
import PropertyOwner from '../Sidebar/Properties/PropertyOwner';
import styles from './NodeMetaPanel.scss';

class NodeMetaPanel extends Component {
  constructor(props) {
    super(props);
    this.togglePopover = this.togglePopover.bind(this);
    this.copyURL = this.copyURL.bind(this);
  }

  togglePopover() {
    this.props.removeNodeMetaPopoverAction(this.props.node);
  }

  propertiesForRenderableType() {
    switch (this.props.renderableType) {
    case RenderableTypes.RenderableGlobe:
      return ['Enabled', 'PerformShading', 'TargetLodScaleFactor'];
    case RenderableTypes.RenderableBillboardsCloud:
      return ['Enabled', 'DrawElements', 'RenderOption', 'Opacity', 'DrawLabels'];
    case RenderableTypes.RenderablePlaneImageLocal:
      return ['Enabled', 'Opacity', 'Billboard'];
    case RenderableTypes.RenderableStars:
      return ['Enabled', 'ColorOption', 'Transparency', 'ScaleFactor'];
    }
  }

  propertyOwnerForUri(activeTab, uri) {
    return (
      <PropertyOwner
        autoExpand
        key={activeTab}
        uri={uri}
        expansionIdentifier={`P:${uri}`}
      />
    );
  }

  copyURL() {
    const url = document.getElementById('docurl').innerHTML;
    const el = document.createElement('textarea');
    el.value = url;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }

  contentForTab(activeTab) {
    const uriSplit = this.props.nodeURI.split('.');
    const identifier = uriSplit[uriSplit.length - 1];
    let description = '';
    const docs = this.props.documentation;

    let foundDoc = null;
    for (let i = 0; i < docs.length; ++i) {
      const doc = docs[i];
      if (doc?.identifiers && doc.identifiers.includes(identifier)) {
        foundDoc = doc;
      }
    }
    if (!foundDoc && !this.props.description) {
      return (
        <Row>
          <div className={styles.description_container}>No meta info found.</div>
        </Row>
      );
    }

    let rawDescription = '';
    if (this.props.description) {
      rawDescription = this.props.description;
    } else {
      rawDescription = 'No description found';
    }
    description = rawDescription.replace(/\\n/g, '');

    if (foundDoc) {
      foundDoc.license = foundDoc.license.replace(/\\n/g, '');
    }

    if (activeTab == 0) {
      return (
        <Row>
          <div className={styles.description_container} dangerouslySetInnerHTML={{ __html: description }} />
        </Row>
      );
    }
    if (foundDoc) {
      return (
        <div>
          <Row>
            Author:
            {foundDoc.author}
          </Row>
          <Row>
            Version:
            {foundDoc.version}
          </Row>
          <Row>
            License:
            <span className={styles.pad_span} dangerouslySetInnerHTML={{ __html: foundDoc.license }} />
          </Row>
          <Row>
            URL:
            {' '}
            <span className={styles.pad_span} id="docurl">{foundDoc.url}</span>
            <span className={styles.copyButton} onClick={this.copyURL}>
              <MaterialIcon icon="content_cut" />
            </span>
          </Row>
        </div>
      );
    }

    return (
      <Row>
        <div className={styles.description_container}>No meta info found.</div>
      </Row>
    );
  }

  get popover() {
    const { activeTab, attached, nodeName } = this.props;
    const windowTitle = `${nodeName}- Asset Infomation`;
    return (
      <Popover
        className={`${Picker.Popover} && ${styles.nodePopover}`}
        title={windowTitle}
        closeCallback={this.togglePopover}
        attached={attached}
        detachable
      >
        <div className={`${Popover.styles.content} ${styles.contentContainer}`}>
          { this.contentForTab(activeTab) }
        </div>
        <hr className={Popover.styles.delimiter} />

        <div className={`${Popover.styles.row} ${Popover.styles.content}`}>
          <Button
            block
            largetext={activeTab == 0}
            smalltext={activeTab != 0}
            key={0}
            onClick={() => this.props.setPopoverActiveTabAction(0)}
          >
            Description
          </Button>
          <Button
            block
            largetext={activeTab == 1}
            smalltext={activeTab != 0}
            key={1}
            onClick={() => this.props.setPopoverActiveTabAction(1)}
          >
            Info
          </Button>
        </div>
      </Popover>
    );
  }

  render() {
    const { showPopover } = this.props;
    return (
      <div className={Picker.Wrapper}>
        { showPopover && this.popover }
      </div>
    );
  }
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
  }

  return {
    nodeURI,
    nodeName,
    activeTab: popoverActiveTab,
    showPopover: popoverVisible,
    attached: popoverAttached,
    documentation: state.documentation.data,
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
