import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import { removeNodeMetaPopover, setPopoverActiveTab } from '../../api/Actions';
import { openUrl } from '../../utils/helpers';
import Picker from '../BottomBar/Picker';
import Button from '../common/Input/Button/Button';
import Popover from '../common/Popover/Popover';
import Row from '../common/Row/Row';

import styles from './NodeMetaPanel.scss';

function NodeMetaPanel({ uri }) {
  const myPopover = useSelector((state) => state.local.popovers.activeNodeMetaPanels[uri]);
  const showPopover = myPopover ? myPopover.visible : false;
  const attached = myPopover ? myPopover.attached : false;
  const activeTab = myPopover && myPopover.activeTab ? myPopover.activeTab : 0;

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
    const foundDoc = state.documentation.data.find((doc) => {
      if (doc?.identifiers && doc.identifiers.includes(identifier)) {
        return true;
      }
      return false;
    });
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
          style={{ width: '100%' }}
        >
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
        closeCallback={closePopover}
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
            onClick={() => setActiveTab(0)}
          >
            Description
          </Button>
          <Button
            block
            largetext={activeTab === 1}
            smalltext={activeTab !== 0}
            key={1}
            onClick={() => setActiveTab(1)}
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

NodeMetaPanel.propTypes = {
  uri: PropTypes.string.isRequired
};

export default NodeMetaPanel;
