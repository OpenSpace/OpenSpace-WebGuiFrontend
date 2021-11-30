import React, { Component } from 'react';
import { connectProperty } from './connectProperty';

import BoolProperty from './BoolProperty';
import ListProperty from './ListProperty';
import MatrixProperty from './MatrixProperty';
import NumericProperty from './NumericProperty';
import OptionProperty from './OptionProperty';
import SelectionProperty from './SelectionProperty';
import StringProperty from './StringProperty';
import TriggerProperty from './TriggerProperty';
import VecProperty from './VectorProperty';


const concreteProperties = {
  BoolProperty,
  OptionProperty,
  TriggerProperty,
  StringProperty: StringProperty,

  DoubleListProperty: ListProperty,
  IntListProperty: ListProperty,
  StringListProperty: ListProperty,

  SelectionProperty: SelectionProperty,

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
