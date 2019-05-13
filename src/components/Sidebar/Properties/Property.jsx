import React, { Component } from 'react';
import Checkbox from '../../common/Input/Checkbox/Checkbox';
import { connectProperty } from './connectProperty';

import BoolProperty from './BoolProperty';
import NumericProperty from './NumericProperty';
import OptionProperty from './OptionProperty';
import TriggerProperty from './TriggerProperty';
import VecProperty from './VectorProperty';
import MatrixProperty from './MatrixProperty';
import PropertyBase from './PropertyBase';

const concreteProperties = {
  BoolProperty,
  OptionProperty,
  TriggerProperty,
  StringProperty: PropertyBase,
  NumericProperty,
  FloatProperty: NumericProperty,
  IntProperty: NumericProperty,
  Vec2Property: VecProperty,
  Vec3Property: VecProperty,
  Vec4Property: VecProperty,
  MatrixProperty,
  DMat4Property: MatrixProperty,
  defaultProperty: PropertyBase,
};

class Property extends Component {
  constructor(props) {

  }

  render() {
    const { description, value } = this.props;
    const ConcreteProperty = concreteProperties[Description.Type] || concreteProperties.defaultProperty;

    if ( description.MetaData &&  (description.MetaData.Visibility == "Hidden") ) {
      return null;
    }
    return <ConcreteProperty key={Description.Identifier} uri={Description.Identifier} subscribe />;
  }
}

export default Property;
export const Types = concreteProperties;
export const GetType = type => concreteProperties[type] || concreteProperties.defaultProperty;