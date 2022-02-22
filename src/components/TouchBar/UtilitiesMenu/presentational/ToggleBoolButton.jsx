import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import propertyDispatcher from '../../../../api/propertyDispatcher';
import { triggerAction } from '../../../../api/Actions';
import SmallLabel from '../../../common/SmallLabel/SmallLabel';
import styles from './../style/UtilitiesButtons.scss';

class ToggleBoolButton extends Component {
  constructor(props) {
    super(props);
	
	this.state = {
      checked: false
    };

    this.toggleProperty = this.toggleProperty.bind(this);
	this.handleOnClick = this.handleOnClick.bind(this);
  }

  componentDidMount(){
	if(this.props.property.isAction) {
		this.props.boolPropertyDispatcher.subscribe();
	}
  }

  componentWillUnMount(){
	if(this.props.property.isAction) {
		this.props.boolPropertyDispatcher.unsubscribe();
	}
  }

  toggleProperty() {
	if(this.props.property.isAction) {
		if(!this.state.checked) {
			this.props.triggerActionDispatcher(this.props.property.actionEnabled);
			this.setState({ checked: true });
		}
		else {
			this.props.triggerActionDispatcher(this.props.property.actionDisabled);
			this.setState({ checked: false });
		}
	}
	else {
		const value = this.props.propertyNode.value ? false : true;
		this.setState({ checked: value });
		this.props.boolPropertyDispatcher.set(value);
	}
  }
  
  handleOnClick () {
	  this.toggleProperty();
	  if(this.props.property.group){
		this.props.handleGroup(this.props);
	  }
  }

  render() {
      return (
        <div
          className={`${styles.UtilitiesButton} ${this.state.checked === true && styles.active}`}
          role="button"
          tabIndex="0"
          key={this.props.property.URI}
          onClick={this.handleOnClick}
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
  // TODO (emmbr, 2022-01-18) Should check that the property node actually 
  // exists as well, and handle the case when it doesn't
	
  if(!ownProps.property.isAction) {
	  let propertyNode = state.propertyTree.properties[ownProps.property.URI];

	  return{
		propertyNode
	  };
  }
  else
	  return;
}

const mapDispatchToProps = (dispatch, ownProps) => ({
  boolPropertyDispatcher : propertyDispatcher(dispatch, ownProps.property.URI),
  triggerActionDispatcher: (action) => {
    dispatch(triggerAction(action));
  }
});

ToggleBoolButton = connect(
  mapStateToProps,
  mapDispatchToProps, 
  null, 
  {forwardRef: true}
)(ToggleBoolButton);

ToggleBoolButton.propTypes = {
  propertyNode: PropTypes.shape({
    description: PropTypes.string,
    value: PropTypes.bool,
  }),
};

export default ToggleBoolButton;

