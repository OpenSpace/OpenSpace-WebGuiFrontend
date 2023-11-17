import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import propertyDispatcher from '../../../api/propertyDispatcher';
import Checkbox from '../../common/Input/Checkbox/Checkbox';
import Row from '../../common/Row/Row';

import BoolProperty from './BoolProperty';
import ListProperty from './ListProperty';
import MatrixProperty from './MatrixProperty';
import NumericProperty from './NumericProperty';
import OptionProperty from './OptionProperty';
import SelectionProperty from './SelectionProperty';
import StringProperty from './StringProperty';
import TriggerProperty from './TriggerProperty';
import VecProperty from './VectorProperty';

import styles from './Property.scss';

const concreteProperties = {
  BoolProperty,
  OptionProperty,
  TriggerProperty,
  StringProperty,

  DoubleListProperty: ListProperty,
  IntListProperty: ListProperty,
  StringListProperty: ListProperty,

  SelectionProperty,

  FloatProperty: NumericProperty,
  DoubleProperty: NumericProperty,
  LongProperty: NumericProperty,
  ULongProperty: NumericProperty,
  IntProperty: NumericProperty,
  UIntProperty: NumericProperty,
  ShortProperty: NumericProperty,
  UShortProperty: NumericProperty,

  Vec2Property: VecProperty,
  Vec3Property: VecProperty,
  Vec4Property: VecProperty,

  IVec2Property: VecProperty,
  IVec3Property: VecProperty,
  IVec4Property: VecProperty,

  UVec2Property: VecProperty,
  UVec3Property: VecProperty,
  UVec4Property: VecProperty,

  DVec2Property: VecProperty,
  DVec3Property: VecProperty,
  DVec4Property: VecProperty,

  Mat2Property: MatrixProperty,
  Mat3Property: MatrixProperty,
  Mat4Property: MatrixProperty,

  DMat2Property: MatrixProperty,
  DMat3Property: MatrixProperty,
  DMat4Property: MatrixProperty
};

function Property({ uri, ...props }) {
  const description = useSelector((state) => state.propertyTree.properties[uri].description);
  const value = useSelector((state) => state.propertyTree.properties[uri].value);

  if (!description) return null;

  const dispatch = useDispatch();
  const dispatcher = propertyDispatcher(dispatch, uri);

  React.useEffect(() => {
    dispatcher.subscribe();
    return dispatcher.unsubscribe;
  }, []);

  const ConcreteProperty = concreteProperties[description.Type];

  if (!ConcreteProperty) {
    console.error('Missing property', description?.Type, description);
    return null;
  }

  function setPropertyEnabled(v) {
    console.log(v);
    // TODO
  }

  const { MetaData } = description;
  const isEnabled = MetaData?.isEnabled;
  const isDisableable = (isEnabled !== undefined) && (MetaData?.isDisableable || false);

  const disabled = MetaData?.isReadOnly;

  return (
    <div
      style={{
        display: 'flex'
      }}
    >
      { isDisableable && <Checkbox checked={isEnabled} setChecked={setPropertyEnabled} /> }
      <div className={`${styles.propertyContainer} ${disabled ? styles.disabled : ''}`}>
        <ConcreteProperty
          dispatcher={dispatcher}
          key={description.Identifier}
          description={description}
          disabled={disabled}
          value={value}
          subscribe
          {...props}
        />
      </div>
    </div>
  );
}

Property.propTypes = {
  uri: PropTypes.string.isRequired
};

export default Property;
export const Types = concreteProperties;
export const GetType = (type) => concreteProperties[type];
