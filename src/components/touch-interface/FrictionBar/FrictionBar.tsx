import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { subscribeToProperty, unsubscribeToProperty } from '../../../api/Actions';
import { RollFrictionKey, RotationalFrictionKey, ZoomFrictionKey } from '../../../api/keys';
import { MdRotateRight, MdZoomIn, MdAutorenew } from 'react-icons/md';
import styles from './FrictionBar.scss';

interface LuaApi {
  setPropertyValue: (key: string, value: boolean) => void;
}

interface Property {
  value: boolean;
}

interface PropertyTree {
  properties: Record<string, Property>;
}

interface State {
  luaApi: LuaApi;
  propertyTree: PropertyTree;
}

const FrictionBar = () => {
  const dispatch = useDispatch();
  const { luaApi, propertyTree } = useSelector((state: State) => ({
    luaApi: state.luaApi,
    propertyTree: state.propertyTree.properties
  }));

  const rotationFriction = propertyTree[RotationalFrictionKey]?.value || false;
  const zoomFriction = propertyTree[ZoomFrictionKey]?.value || false;
  const rollFriction = propertyTree[RollFrictionKey]?.value || false;

  React.useEffect(() => {
    const keys = [RotationalFrictionKey, ZoomFrictionKey, RollFrictionKey];
    keys.forEach((key) => dispatch(subscribeToProperty(key)));

    return () => keys.forEach((key) => dispatch(unsubscribeToProperty(key)));
  }, [dispatch]);

  const toggleFriction = (key: string, currentValue: boolean) => {
    luaApi.setPropertyValue(key, !currentValue);
  };

  const buttonColor = (isActive: boolean) => (isActive ? '#FFFFFF' : '#FFFFFF40');

  return (
    <div className={styles.FrictionBar}>
      <div className={styles.row}>
        <div
          className={styles.itemContainer}
          onClick={() => toggleFriction(RotationalFrictionKey, rotationFriction)}
          title='Rotation friction'
          style={{ color: buttonColor(rotationFriction) }}
        >
          <MdRotateRight className={styles.icon} />
          <span>ROTATION</span>
        </div>

        <div
          className={styles.itemContainer}
          onClick={() => toggleFriction(ZoomFrictionKey, zoomFriction)}
          title='Zoom friction'
          style={{ color: buttonColor(zoomFriction) }}
        >
          <MdZoomIn className={styles.icon} />
          <span>ZOOM</span>
        </div>

        <div
          className={styles.itemContainer}
          onClick={() => toggleFriction(RollFrictionKey, rollFriction)}
          title='Roll friction'
          style={{ color: buttonColor(rollFriction) }}
        >
          <MdAutorenew className={styles.icon} />
          <span>ROLL</span>
        </div>
      </div>
    </div>
  );
};

export default FrictionBar;
