import React from 'react';
import {
  MdClose, MdExitToApp, MdOpenInBrowser, MdOutlineFilterNone
} from 'react-icons/md';
import PropTypes from 'prop-types';

import { useLocalStorageState } from '../../../../utils/customHooks';
import Button from '../../../common/Input/Button/Button';

import FloatingWindow from './FloatingWindow';
import PaneRightHandSide from './PaneRightHandSide';
import PopoverResizeable from './PopoverResizeable';

import styles from './WindowThreeStates.scss';

const WindowStyle = {
  DETACHED: 'DETACHED',
  PANE: 'PANE',
  ATTACHED: 'ATTACHED'
};

function WindowThreeStates({
  defaultStyle, defaultHeight, defaultWidth, children, minHeight,
  closeCallback, title, acceptedStyles, sizeCallback
}) {
  const [windowStyle, setWindowStyle] = React.useState(defaultStyle);
  const [sizePopover, setSizePopover] = useLocalStorageState(
    `${title} sizePopover`,
    { width: defaultWidth, height: defaultHeight }
  );
  const [sizeAttached, setSizeAttached] = useLocalStorageState(
    `${title} sizeAttached`,
    { width: defaultWidth, height: defaultHeight }
  );
  const [sizePane, setSizePane] = useLocalStorageState(
    `${title} sizePane`,
    { width: defaultWidth }
  );
  const [positionPopover, setPositionPopover] = useLocalStorageState(`${title} position`, () => {
    const centerX = -window.innerWidth * 0.5 + sizePopover.width;
    const centerY = -window.innerHeight * 0.5 - (sizePopover.height * 0.5);
    return { x: centerX, y: centerY };
  });
  const topMenuHeight = 30;

  // This callback is for the missions timeline.
  // It has to know how large the pane is in order to render its content
  React.useEffect(() => {
    sizeCallback({ width: sizePane.width, height: sizePane.height - topMenuHeight });
  }, [sizePane]);

  function createTopBar() {
    const hasDetached = acceptedStyles.find((item) => item === WindowStyle.DETACHED);
    const detachedButton = hasDetached && windowStyle !== WindowStyle.DETACHED && (
      <Button onClick={() => setWindowStyle(WindowStyle.DETACHED)} transparent small>
        <MdOutlineFilterNone />
      </Button>
    );
    const hasPane = acceptedStyles.find((item) => item === WindowStyle.PANE);
    const paneButton = hasPane && windowStyle !== WindowStyle.PANE && (
      <Button onClick={() => setWindowStyle(WindowStyle.PANE)} transparent small>
        <MdExitToApp />
      </Button>
    );
    const hasAttached = acceptedStyles.find((item) => item === WindowStyle.ATTACHED);
    const attachedButton = hasAttached && windowStyle !== WindowStyle.ATTACHED && (
      <Button onClick={() => setWindowStyle(WindowStyle.ATTACHED)} transparent small>
        <MdOpenInBrowser />
      </Button>
    );
    const closeCallbackButton = (
      <Button onClick={closeCallback} transparent small>
        <MdClose />
      </Button>
    );

    return (
      <header className={`header ${styles.topMenu}`} style={{ height: topMenuHeight }}>
        <div className={styles.title}>{title}</div>
        <div>
          {detachedButton}
          {attachedButton}
          {paneButton}
          {closeCallbackButton}
        </div>
      </header>
    );
  }

  switch (windowStyle) {
    case WindowStyle.DETACHED:

      return (
        <FloatingWindow
          sizeCallback={setSizePopover}
          defaultSize={sizePopover}
          minHeight={minHeight}
          defaultPosition={positionPopover}
          handleDragStop={(e, data) => {
            const { x, y } = data;
            setPositionPopover({ x, y });
          }}
        >
          {createTopBar()}
          {children}
        </FloatingWindow>
      );
    case WindowStyle.PANE:
      return (
        <PaneRightHandSide
          defaultWidth={sizePane.width}
          sizeCallback={setSizePane}
        >
          {createTopBar()}
          {children}
        </PaneRightHandSide>
      );
    case WindowStyle.ATTACHED:
    default:
      return (
        <PopoverResizeable
          sizeCallback={setSizeAttached}
          defaultSize={sizeAttached}
          minHeight={minHeight}
        >
          {createTopBar()}
          {children}
        </PopoverResizeable>
      );
  }
}

WindowThreeStates.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  closeCallback: PropTypes.func,
  defaultHeight: PropTypes.number,
  defaultWidth: PropTypes.number,
  defaultStyle: PropTypes.string,
  minHeight: PropTypes.number,
  acceptedStyles: PropTypes.array,
  sizeCallback: PropTypes.func
};

WindowThreeStates.defaultProps = {
  title: '',
  closeCallback: null,
  defaultHeight: 440,
  defaultWidth: 350,
  minHeight: 100,
  defaultStyle: WindowStyle.ATTACHED,
  acceptedStyles: [WindowStyle.ATTACHED, WindowStyle.DETACHED, WindowStyle.PANE],
  sizeCallback: () => {}
};

WindowThreeStates.styles = styles;

export default WindowThreeStates;
