import React from 'react';
import { Drawer } from '../Drawer';
import styles from './ActionDrawer.scss';
import { closeDrawer } from '../../../../api/Actions';
import { useDispatch, useSelector } from 'react-redux';
import ActionsPanel from '../../NavigationBar/Action/ActionsPanel';

export const ActionDrawer = () => {
  const dispatch = useDispatch();

  const isOpen = useSelector((state: any) => state.local.drawersReducer.ActionDrawer.isOpen);

  const [isLoading, setIsLoading] = React.useState(false);

  const closeActionDrawer = () => {
    dispatch(closeDrawer('ActionDrawer'));
  };

  const bodyContent = (
    <div className={styles.bodyContainer}>
      <ActionsPanel />
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
      title='Action'
      actionLabel='Continue'
      onClose={closeActionDrawer}
      onSubmit={() => {}}
      body={bodyContent}
      footer={footerContent}
    />
  );
};
