import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import propertyDispatcher from '../../../../api/propertyDispatcher';
import SmallLabel from '../../../common/SmallLabel/SmallLabel';
import styles from '../style/UtilitiesButtons.scss';

class ToggleBoolButton extends Component {
  constructor(props) {
    super(props);

    this.toggleProperty = this.toggleProperty.bind(this);
  }

  componentDidMount() {
    const { boolPropertyDispatcher } = this.props;
    boolPropertyDispatcher.subscribe();
  }

  componentWillUnmount() {
    const { boolPropertyDispatcher } = this.props;
    boolPropertyDispatcher.unsubscribe();
  }

  toggleProperty() {
    const { boolPropertyDispatcher, propertyNode } = this.props;

    const value = !propertyNode.value;
    boolPropertyDispatcher.set(value);
  }

  render() {
    const { property, propertyNode } = this.props;

    return (
      <div
        className={`${styles.UtilitiesButton} ${propertyNode.value === true && styles.active}`}
        role="button"
        tabIndex="0"
        key={property.URI}
        onClick={this.toggleProperty}
        id={property.URI}
      >
        <SmallLabel id={property.URI} style={{ textAlign: 'center' }}>
          {property.label}
        </SmallLabel>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const propertyNode = state.propertyTree.properties[ownProps.property.URI];

  // TODO (emmbr, 2022-01-18) Should check that the property node actually
  // exists as well, and handle the case when it doesn't

  return {
    propertyNode,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  boolPropertyDispatcher: propertyDispatcher(dispatch, ownProps.property.URI),
});

ToggleBoolButton = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ToggleBoolButton);

ToggleBoolButton.propTypes = {
  propertyNode: PropTypes.shape({
    description: PropTypes.string,
    value: PropTypes.bool,
  }),
};

export default ToggleBoolButton;
