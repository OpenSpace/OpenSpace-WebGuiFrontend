import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import propertyDispatcher from '../../../../api/propertyDispatcher';
import { triggerAction } from '../../../../api/Actions';
import SmallLabel from '../../../common/SmallLabel/SmallLabel';
import styles from '../style/UtilitiesButtons.scss';

class ToggleBoolButton extends Component {
  constructor(props) {
    super(props);

    this.state = {
      checked: this.props.property.isAction ? this.props.property.defaultvalue : this.props.propertyNode.value,
    };

    this.disableIfChecked = this.disableIfChecked.bind(this);
    this.toggleChecked = this.toggleChecked.bind(this);
    this.handleOnClick = this.handleOnClick.bind(this);
  }

  componentDidMount() {
    const { boolPropertyDispatcher, property } = this.props;
    if (!property.isAction) {
      boolPropertyDispatcher.subscribe();
    }
  }

  componentWillUnmount() {
    const { boolPropertyDispatcher, property } = this.props;
    if (!property.isAction) {
      boolPropertyDispatcher.unsubscribe();
    }
  }

  disableIfChecked() {
    const { boolPropertyDispatcher, property } = this.props;
    const { checked } = this.state;
    if (checked) {
      if (property.isAction) {
        this.props.triggerActionDispatcher(property.actionDisabled);
      } else {
        boolPropertyDispatcher.set(false);
      }
      this.setState({ checked: false });
    }
  }

  toggleChecked() {
    const { property } = this.props;
    const { checked } = this.state;
    if (property.isAction) {
      if (!checked) {
        this.props.triggerActionDispatcher(property.actionEnabled);
        this.setState({ checked: true });
      } else {
        this.props.triggerActionDispatcher(property.actionDisabled);
        this.setState({ checked: false });
      }
    } else {
      const value = !checked;
      this.setState({ checked: value });
      this.props.boolPropertyDispatcher.set(value);
    }
  }

  handleOnClick() {
    const { property } = this.props;
	  this.toggleChecked();
	  if (property.group) {
      this.props.handleGroup(this.props);
	  }
  }

  render() {
    const { property } = this.props;
    const { checked } = this.state;
    return (
      <div
        className={`${styles.UtilitiesButton} ${checked === true && styles.active}`}
        role="button"
        tabIndex="0"
        key={property.URI}
        onClick={this.handleOnClick}
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
  // TODO (emmbr, 2022-01-18) Should check that the property node actually
  // exists as well, and handle the case when it doesn't

  if (!ownProps.property.isAction) {
    const propertyNode = state.propertyTree.properties[ownProps.property.URI];
    return {
      propertyNode,
    };
  } return { propertyNode: null };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  boolPropertyDispatcher: propertyDispatcher(dispatch, ownProps.property.URI),
  triggerActionDispatcher: (action) => {
    dispatch(triggerAction(action));
  },
});

ToggleBoolButton = connect(
  mapStateToProps,
  mapDispatchToProps,
  null,
  { forwardRef: true },
)(ToggleBoolButton);

ToggleBoolButton.propTypes = {
  propertyNode: PropTypes.shape({
    description: PropTypes.string,
    value: PropTypes.bool,
  }),
};

export default ToggleBoolButton;
