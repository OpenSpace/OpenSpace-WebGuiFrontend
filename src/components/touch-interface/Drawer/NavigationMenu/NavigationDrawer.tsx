import React from 'react';
import { Drawer } from '../Drawer';
import styles from './NavigationDrawer.scss';
import { closeDrawer } from '../../../../api/Actions';
import { useDispatch, useSelector } from 'react-redux';

import OriginPopup from '../../NavigationBar/Origin/OriginPopup';

export const NavigationDrawer = () => {
  const dispatch = useDispatch();

  const isOpen = useSelector((state: any) => state.local.drawersReducer.NavigationDrawer.isOpen);

  const [isLoading, setIsLoading] = React.useState(false);

  const closeNavigationDrawer = () => {
    dispatch(closeDrawer('NavigationDrawer'));
  };

  const bodyContent = (
    <div className={styles.bodyContainer}>
      <OriginPopup />
    </div>
  );

  const footerContent = (
    <div>
      {/* {environment.developmentMode && (
        <span className={styles.devModeNotifier}>GUI running in dev mode</span>
      )} */}
    </div>
  );

  return (
    <Drawer
      disabled={isLoading}
      isOpen={isOpen}
      title='Navigation'
      actionLabel='Continue'
      onClose={closeNavigationDrawer}
      onSubmit={() => {}}
      body={bodyContent}
      footer={footerContent}
    />
  );
};
