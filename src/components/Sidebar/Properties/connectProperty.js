import { connect } from 'react-redux';
import propertyDispatcher from '../../../api/propertyDispatcher';
import { startListening, stopListening, changePropertyValue } from '../../../api/Actions';

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    dispatcher: propertyDispatcher(dispatch, ownProps.description.Identifier)
  }
}

export const connectProperty = Property => connect(null, mapDispatchToProps)(Property);
