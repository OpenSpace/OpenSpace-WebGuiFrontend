import React from 'react';
import { Drawer } from '../Drawer';
import styles from './SystemDrawer.scss';
import { closeDrawer } from '../../../../api/Actions';
import { useDispatch, useSelector } from 'react-redux';
import SystemItem, { SystemItemProps } from './SystemItem';
import { showAbout, openTutorials, openFeedback, nativeGui, quit } from './system-utils';
import environment from '../../../../api/Environment';
import { MdExitToApp } from 'react-icons/md';

export const SystemDrawer = () => {
  const dispatch = useDispatch();

  const isOpen = useSelector((state: any) => state.local.drawersReducer.SystemDrawer.isOpen);
  const connectionLost = useSelector((state: any) => state.connection.connectionLost);
  const luaApi = useSelector((state: any) => state.luaApi);

  const [isLoading, setIsLoading] = React.useState(false);

  const items: SystemItemProps[] = [
    {
      label: 'About OpenSpace',
      onClick: () => showAbout(dispatch)
    },
    {
      label: 'Open Web Tutorial',
      onClick: () => openTutorials(connectionLost),
      disabled: connectionLost
    },
    {
      label: 'Send Feedback',
      onClick: () => {
        openFeedback(connectionLost);
      },
      disabled: connectionLost
    },
    {
      label: 'Toggle Console',
      onClick: () => {
        openFeedback(luaApi);
      },
      disabled: !luaApi,
      shortcut: '~'
    },
    {
      label: 'Toggle Native GUI',
      onClick: () => {
        nativeGui(luaApi);
      },
      disabled: !luaApi,
      shortcut: 'F1'
    },
    {
      label: 'Quit OpenSpace',
      onClick: () => {
        quit(luaApi);
      },
      icon: <MdExitToApp className={styles.linkIcon} />,
      disabled: !luaApi,
      shortcut: 'ESC'
    }
  ];

  const closeSystemDrawer = () => {
    dispatch(closeDrawer('SystemDrawer'));
  };

  const bodyContent = (
    <div className={styles.bodyContainer}>
      {items.map((item, index) => (
        <SystemItem
          key={index}
          label={item.label}
          onClick={item.onClick}
          icon={item.icon}
          disabled={item.disabled}
          shortcut={item.shortcut}
        />
      ))}
    </div>
  );

  const footerContent = (
    <div>
      {environment.developmentMode && (
        <span className={styles.devModeNotifier}>GUI running in dev mode</span>
      )}
    </div>
  );

  return (
    <Drawer
      disabled={isLoading}
      isOpen={isOpen}
      title='System'
      actionLabel='Continue'
      onClose={closeSystemDrawer}
      onSubmit={() => {}}
      body={bodyContent}
      footer={footerContent}
    />
  );
};
