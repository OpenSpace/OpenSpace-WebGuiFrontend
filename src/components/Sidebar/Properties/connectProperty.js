import { connect } from 'react-redux';

import propertyDispatcher from '../../../api/propertyDispatcher';
import subStateToProps from '../../../utils/subStateToProps';

const mapDispatchToProps = (dispatch, ownProps) => {
  const { uri } = ownProps;
  return {
    dispatcher: propertyDispatcher(dispatch, uri)
  };
};

const mapStateToSubState = (state) => ({
  properties: state.propertyTree.properties
});

const mapSubStateToProps = ({ properties }, ownProps) => {
  const { uri } = ownProps;
  const property = properties[uri] || {};

  return {
    value: property.value,
    description: property.description
  };
};

export const connectProperty =
  (Property) => connect(
    subStateToProps(mapSubStateToProps, mapStateToSubState),
    mapDispatchToProps
  )(Property);
