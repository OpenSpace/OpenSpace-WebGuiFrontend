import React from 'react';
import { Drawer } from '../Drawer';
import styles from './SceneDrawer.scss';
import { closeDrawer } from '../../../../api/Actions';
import { useDispatch, useSelector } from 'react-redux';

export const SceneDrawer = () => {
  const dispatch = useDispatch();

  const isOpen = useSelector((state: any) => state.local.drawersReducer.SceneDrawer.isOpen);

  const [isLoading, setIsLoading] = React.useState(false);

  const closeSceneDrawer = () => {
    dispatch(closeDrawer('SceneDrawer'));
  };

  const bodyContent = <div className={styles.bodyContainer}></div>;

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
      title='Scene'
      actionLabel='Continue'
      onClose={closeSceneDrawer}
      onSubmit={() => {}}
      body={bodyContent}
      footer={footerContent}
    />
  );
};
