import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import propertyDispatcher from '../../../api/propertyDispatcher';
import LoadingString from '../LoadingString/LoadingString';

/**
 * display the value of a property in an effortless way
 */
class PropertyString extends Component {
  componentDidMount() {
    this.props.dispatcher.subscribe();
  }

  componentWillUnmount() {
    this.props.dispatcher.subscribe();
  }

  render() {
    return (
      <LoadingString loading={this.props.value === undefined}>
        { this.props.value }
      </LoadingString>
    );
  }
}

PropertyString.propTypes = {
  defaultValue: PropTypes.string,
  uri: PropTypes.string.isRequired,
};

PropertyString.defaultProps = {
  defaultValue: 'loading',
};

const mapStateToProps = (state, { uri }) => {
  const property = state.propertyTree.properties[uri] || {};

  return {
    value: property.value,
    description: property.description,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  dispatcher: propertyDispatcher(dispatch, ownProps.uri),
});

PropertyString = connect(mapStateToProps, mapDispatchToProps)(PropertyString);

export default PropertyString;
