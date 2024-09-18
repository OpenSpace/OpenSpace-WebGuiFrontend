/**********************************************************
OpenSpace Streaming Thesis (2022)
----------------------------------------------
This component is the bottom bar menu that accessed the
streaming functionality through the WebRTCStreaming.jsx
functions.
**********************************************************/

import React from 'react';
import Button from '../common/Input/Button/Button';
import Popover from '../common/Popover/Popover';
import Picker from '../BottomBar/Picker';
import styles from  './StreamingMenu.scss';
import { MdScreenShare } from 'react-icons/md';
import { joinSession } from './WebRTCStreaming';

function StreamingMenu() {
  const [showPopover, setShowPopover] = React.useState(false);

  function togglePopover() {
    setShowPopover((old) => !old);
  }

  // TODO: For the GStreamer solution, the "Host" button can be removed, as that was only needed
  // for the Spout and WebRTC Screen Share solutions.
  return (
    <div className={Picker.Wrapper}>
      <Picker onClick={togglePopover}>
        <div>
            <MdScreenShare className={styles.streamIcon} />
        </div>
        {showPopover &&
          <Popover
            className={Picker.Popover}
            title="Streaming options"
          >
            <div className={Popover.styles.content}>
              <Button
                block
                smalltext
                onClick={() => {joinSession()}}
                className={styles.actionButton}
              >
                  <p>Join session</p>
              </Button>
            </div>
          </Popover>}
      </Picker>
    </div>
  )
}

export default StreamingMenu;