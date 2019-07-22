import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import styles from './../style/UtilitiesButtons.scss';
import SmallLabel from '../../../common/SmallLabel/SmallLabel';

import propertyDispatcher from '../../../../api/propertyDispatcher';

class ToggleBoolButton extends Component {
  constructor(props) {
    super(props);

    this.toggleProperty = this.toggleProperty.bind(this);
  }

  componentDidMount(){
    this.props.boolPropertyDispatcher.subscribe();
  }

  componentWillUnMount(){
    this.props.boolPropertyDispatcher.unsubscribe();
  }

  toggleProperty() {
    const value = this.props.propertyNode.value ? false : true;
    this.props.boolPropertyDispatcher.set(value);
  }

  render() {
      return (
        <div
          className={`${styles.UtilitiesButton} ${this.props.propertyNode.value === true && styles.active}`}
          role="button"
          tabIndex="0"
          key={this.props.property.URI}
          onClick={this.toggleProperty}
          id={this.props.property.URI}
        >
          <SmallLabel id={this.props.property.URI} style={{ textAlign: 'center' }}>
            {this.props.property.label}
          </SmallLabel>
        </div>
      );
  }
}

const mapStateToProps = (state, ownProps) => {

  let propertyNode = state.propertyTree.properties[ownProps.property.URI];

  return{
    propertyNode
  };
}

const mapDispatchToProps = (dispatch, ownProps) => ({
  boolPropertyDispatcher : propertyDispatcher(dispatch, ownProps.property.URI),
});

ToggleBoolButton = connect(
  mapStateToProps,
  mapDispatchToProps
)(ToggleBoolButton);

ToggleBoolButton.propTypes = {
  propertyNode: PropTypes.shape({
    description: PropTypes.string,
    value: PropTypes.bool,
  }),
};

export default ToggleBoolButton;
