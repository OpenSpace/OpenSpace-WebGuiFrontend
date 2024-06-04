import React from 'react';
import { MdWeb } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';

import {
  addUserPanel, loadUserPanelData, setPopoverVisibility
} from '../../../api/Actions';
import HorizontalDelimiter from '../../common/HorizontalDelimiter/HorizontalDelimiter';
import Button from '../../common/Input/Button/Button';
import Input from '../../common/Input/Input/Input';
import Select from '../../common/Input/Select/Select';
import Popover from '../../common/Popover/Popover';
import Row from '../../common/Row/Row';
import Picker from '../Picker';

function UserControlPanel() {
  const [selectedPanel, setSelectedPanel] = React.useState(undefined);
  const [panelURL, setPanelURL] = React.useState(undefined);
  const popoverVisible = useSelector(
    (state) => state.local.popovers.userControlPanel.visible
  );
  const luaApi = useSelector((state) => state.luaApi);
  const isDataInitialized = useSelector((state) => state.userPanels.isInitialized);

  const panelList = useSelector((state) => state.userPanels.panels || []);
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (luaApi && !isDataInitialized) {
      dispatch(loadUserPanelData(luaApi));
    }
  }, []);

  function togglePopover() {
    // Todo MICAH this was to avoid creating a topic
    // Didnt feel right making a topic just for this
    // Thinking to adda a generic folder watching topic
    if (!popoverVisible) {
      dispatch(loadUserPanelData(luaApi));
    }
    dispatch(setPopoverVisibility({
      popover: 'userControlPanel',
      visible: !popoverVisible
    }));
  }

  function updatePanelSelection(selection) {
    setSelectedPanel(selection.value);
  }

  function addPanel() {
    dispatch(addUserPanel(selectedPanel));
  }

  function addWebPanel() {
    if (panelURL.indexOf('http') !== 0) {
      dispatch(addUserPanel(`http://${panelURL}`));
    } else {
      dispatch(addUserPanel(panelURL));
    }
  }

  function updatePanelURL(evt) {
    setPanelURL(evt.target.value);
  }

  function popover() {
    const placeholderText = 'Loading pages';
    const options = Object.values(panelList)
      .map((panel) => ({ value: panel.path, label: panel.name }));

    return (
      <Popover
        className={Picker.Popover}
        title="User Control Panels"
        closeCallback={() => togglePopover()}
        detachable
        attached
      >
        <div className={Popover.styles.content}>
          <Row>
            <Select
              menuPlacement="top"
              placeholder={placeholderText}
              options={options}
              label="Select Panel"
              onChange={updatePanelSelection}
              value={selectedPanel}
            />

            <div className={Popover.styles.row}>
              <Button
                onClick={addPanel}
                title="Add panel"
                style={{ width: 90 }}
                disabled={!selectedPanel}
              >
                <MdWeb alt="add panel" />
                <span style={{ marginLeft: 5 }}>Add Panel</span>
              </Button>
            </div>
          </Row>
          <HorizontalDelimiter />
          <Row>
            <div className={Popover.styles.title}>Add via HTTP</div>
            <div className="urlbox">
              <Input
                value={panelURL}
                label="URL"
                placeholder="URL"
                onChange={(evt) => updatePanelURL(evt)}
              />
            </div>
            <div className={Popover.styles.row}>
              <Button
                onClick={addWebPanel}
                title="Add panel"
                style={{ width: 90 }}
                disabled={!panelURL}
              >
                <MdWeb alt="add panel" />
                <span style={{ marginLeft: 5 }}>Add Panel</span>
              </Button>
            </div>
          </Row>
        </div>
      </Popover>
    );
  }

  return (
    <div className={Picker.Wrapper}>
      <Picker
        className={`${popoverVisible && Picker.Active}`}
        onClick={togglePopover}
        refKey="UserControl"
      >
        <div>
          <MdWeb className={Picker.Icon} alt="user control" />
        </div>
      </Picker>
      { popoverVisible && popover() }
    </div>
  );
}

export default UserControlPanel;
