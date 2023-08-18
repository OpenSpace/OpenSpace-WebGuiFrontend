import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import { removeNodeMetaPopover, setPopoverActiveTab } from '../../api/Actions';
import { copyTextToClipboard, openUrl } from '../../utils/helpers';
import Picker from '../BottomBar/Picker';
import InfoBox from '../common/InfoBox/InfoBox';
import Button from '../common/Input/Button/Button';
import Popover from '../common/Popover/Popover';
import Row from '../common/Row/Row';

import styles from './NodeMetaPanel.scss';

function NodeMetaPanel({ uri }) {
  const myPopover = useSelector((state) => state.local.popovers.activeNodeMetaPanels[uri]);
  const showPopover = myPopover ? myPopover.visible : false;
  const attached = myPopover ? myPopover.attached : false;
  const activeTab = myPopover && myPopover.activeTab ? myPopover.activeTab : 0;
  const isShowingFirstTab = activeTab === 0;

  // Find name, gui description and documentation
  const nodeName = useSelector((state) => state.propertyTree.propertyOwners[uri]?.name);

  const description = useSelector((state) => {
    let guiDescription = null;
    if (state.propertyTree.properties[`${uri}.GuiDescription`]) {
      guiDescription = state.propertyTree.properties[`${uri}.GuiDescription`].value;
      guiDescription = guiDescription.replace(/\\n/g, '');
      guiDescription = guiDescription.replace(/<br>/g, '');
    }
    return guiDescription || 'No description found';
  });

  const documentation = useSelector((state) => {
    const identifier = uri.split('.').pop(); // Get last word in uri
    const foundDoc = state.documentation.data.find(
      (doc) => doc?.identifiers && doc.identifiers.includes(identifier)
    );
    return foundDoc;
  });

  const dispatch = useDispatch();

  function closePopover() {
    dispatch(removeNodeMetaPopover({
      identifier: uri
    }));
  }

  function setActiveTab(index) {
    dispatch(setPopoverActiveTab({
      identifier: uri,
      activeTab: index,
      isMeta: true
    }));
  }

  function contentForTab() {
    // GUI Description tag
    if (isShowingFirstTab) {
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
      <div className={styles.description_container}>
        <Row>
          {`Author: ${documentation.author}`}
        </Row>
        <Row>
          {`Version: ${documentation.version}`}
        </Row>
        <Row>
          {`License: ${documentation.license.replace(/\\n/g, '')}`}
        </Row>
        <Row>
          {`Description: ${documentation.description}`}
        </Row>
        <Row className={styles.assetInfoLastRow}>
          <Button
            onClick={() => openUrl(documentation.url)}
            style={{ width: '30%' }}
          >
            Open URL
            {' '}
            <InfoBox text={`${documentation.url}`} />
          </Button>
          <Button
            onClick={() => copyTextToClipboard(documentation.path)}
            style={{ width: '30%', marginLeft: '0.5em' }}
          >
            Copy Asset File Path
            {' '}
            <InfoBox text={`${documentation.path}`} />
          </Button>
        </Row>
      </div>
    );
  }

  function popover() {
    const titleAddition = isShowingFirstTab ? 'Description' : 'Asset Information';
    const windowTitle = `${nodeName} - ${titleAddition}`;
    return (
      <Popover
        className={`${Picker.Popover} && ${styles.nodePopover}`}
        title={windowTitle}
        closeCallback={closePopover}
        attached={attached}
        detachable
      >
        <div className={`${Popover.styles.content} ${styles.contentContainer}`}>
          {contentForTab()}
        </div>
        <hr className={Popover.styles.delimiter} />

        <div className={`${Popover.styles.row} ${Popover.styles.content}`}>
          <Button
            block
            key={0}
            onClick={() => setActiveTab(0)}
            style={!isShowingFirstTab ? { opacity: 0.5 } : {}}
          >
            Description
          </Button>
          <Button
            block
            key={1}
            onClick={() => setActiveTab(1)}
            style={isShowingFirstTab ? { opacity: 0.5 } : {}}
          >
            Asset Info
          </Button>
        </div>
      </Popover>
    );
  }

  return (
    <div className={Picker.Wrapper}>
      {showPopover && popover()}
    </div>
  );
}

NodeMetaPanel.propTypes = {
  uri: PropTypes.string.isRequired
};

export default NodeMetaPanel;
