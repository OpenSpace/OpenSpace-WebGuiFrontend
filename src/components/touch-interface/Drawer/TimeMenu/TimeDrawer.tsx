import React from 'react';
import { Drawer } from '../Drawer';
import styles from './TimeDrawer.scss';
import { closeDrawer } from '../../../../api/Actions';
import { useDispatch, useSelector } from 'react-redux';
import TimePopup from '../../NavigationBar/Time/TimePopup';

export const TimeDrawer = () => {
  const dispatch = useDispatch();

  const isOpen = useSelector((state: any) => state.local.drawersReducer.TimeDrawer.isOpen);

  const [isLoading, setIsLoading] = React.useState(false);

  const closeTimeDrawer = () => {
    dispatch(closeDrawer('TimeDrawer'));
  };

  const bodyContent = (
    <div className={styles.bodyContainer}>
      <TimePopup />
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
      title='Date & Time Selection'
      actionLabel='Continue'
      onClose={closeTimeDrawer}
      onSubmit={() => {}}
      body={bodyContent}
      footer={footerContent}
    />
  );
};
