import React, { Component } from 'react';
import Checkbox from '../../common/Input/Checkbox/Checkbox';
import { connectProperty } from './connectProperty';

import BoolProperty from './BoolProperty';
import MatrixProperty from './MatrixProperty';
import NumericProperty from './NumericProperty';
import OptionProperty from './OptionProperty';
import TriggerProperty from './TriggerProperty';
import VecProperty from './VectorProperty';
import StringProperty from './StringProperty';
import ListProperty from './ListProperty';


const concreteProperties = {
  BoolProperty,
  OptionProperty,
  TriggerProperty,
  StringProperty: StringProperty,

  DoubleListProperty: ListProperty,
  IntListProperty: ListProperty,
  StringListProperty: ListProperty,

  FloatProperty: NumericProperty,
  DoubleProperty: NumericProperty,
  LongDoubleProperty: NumericProperty,
  LongLongProperty: NumericProperty,
  ULongLongProperty: NumericProperty,
  LongProperty: NumericProperty,
  ULongProperty: NumericProperty,
  IntProperty: NumericProperty,
  UIntProperty: NumericProperty,
  ShortProperty: NumericProperty,
  UShortProperty: NumericProperty,
  SignedCharProperty: NumericProperty,
  UCharProperty: NumericProperty,

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

  // Only square matrices are displayed property
  // at this point. --emiax

  Mat2Property: MatrixProperty,
  //Mat2x3Property: MatrixProperty,
  //Mat2x4Property: MatrixProperty,

  //Mat3x2Property: MatrixProperty,
  Mat3Property: MatrixProperty,
  //Mat3x4Property: MatrixProperty,

  //Mat4x2Property: MatrixProperty,
  //Mat4x3Property: MatrixProperty,
  Mat4Property: MatrixProperty,

  DMat2Property: MatrixProperty,
  //DMat2x3Property: MatrixProperty,
  //DMat2x4Property: MatrixProperty,

  //DMat3x2Property: MatrixProperty,
  DMat3Property: MatrixProperty,
  //DMat3x4Property: MatrixProperty,

  //DMat4x2Property: MatrixProperty,
  //DMat4x3Property: MatrixProperty,
  DMat4Property: MatrixProperty,
};

class Property extends Component {
  render() {
    const { description, value } = this.props;

    const ConcreteProperty = concreteProperties[description.Type];

    if (!ConcreteProperty) {
      console.error("Missing property", description.Type, description);
      return null;
    }

    return <ConcreteProperty {...this.props}
                        key={description.Identifier}
                        description={description}
                        value={value}
                        subscribe />;
  }
}

Property = connectProperty(Property);

export default Property;
export const Types = concreteProperties;
export const GetType = type => concreteProperties[type];
