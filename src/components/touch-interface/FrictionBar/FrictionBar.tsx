import React, { useCallback } from 'react';
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

  const handleToggleFriction = useCallback(
    (key: string, curVal: boolean) => {
      luaApi.setPropertyValue(key, !curVal);
    },
    [luaApi]
  );

  React.useEffect(() => {
    const keys = [RotationalFrictionKey, ZoomFrictionKey, RollFrictionKey];
    keys.forEach((key) => dispatch(subscribeToProperty(key)));

    return () => keys.forEach((key) => dispatch(unsubscribeToProperty(key)));
  }, [dispatch]);

  const buttonColor = (isActive: boolean) => (isActive ? '#FFFFFF' : '#FFFFFF40');

  const frictions = [
    {
      key: RotationalFrictionKey,
      icon: MdRotateRight,
      title: 'Rotation'
    },
    {
      key: ZoomFrictionKey,
      icon: MdZoomIn,
      title: 'Zoom'
    },
    {
      key: RollFrictionKey,
      icon: MdAutorenew,
      title: 'Roll'
    }
  ];

  return (
    <div className={styles.container}>
      {frictions.map((friction) => (
        <div
          className={styles.btn}
          onClick={() => handleToggleFriction(friction.key, propertyTree[friction.key]?.value)}
          title={friction.title}
          style={{ color: buttonColor(propertyTree[friction.key]?.value) }}
        >
          <friction.icon className={styles.icon} />
          <span>{friction.title}</span>
        </div>
      ))}
    </div>
  );
};

export default FrictionBar;
