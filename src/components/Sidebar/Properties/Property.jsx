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

import { connect } from 'react-redux';

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
  render() {
    const { description, value } = this.props;

    if (!description || !value) {
      return null;
    }

    const ConcreteProperty =
      concreteProperties[description.Type] || concreteProperties.defaultProperty;

    if (description.MetaData && description.MetaData.Visibility === "Hidden") {
      return null;
    }

    return <ConcreteProperty key={description.Identifier} description={description} value={value} subscribe />;
  }
}

const mapStateToProps = (state, ownProps) => {
  const { uri } = ownProps;
  const property = state.propertyTree.properties[uri] || {};

  return {
    value: property.value,
    description: property.description
  }
}

Property = connect(
  mapStateToProps
)(Property);

export default Property;
export const Types = concreteProperties;
export const GetType = type => concreteProperties[type] || concreteProperties.defaultProperty;