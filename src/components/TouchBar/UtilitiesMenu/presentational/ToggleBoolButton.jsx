import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import { triggerAction } from '../../../../api/Actions';
import propertyDispatcher from '../../../../api/propertyDispatcher';
import Button from '../../../common/Input/Button/Button';
import SmallLabel from '../../../common/SmallLabel/SmallLabel';

import styles from '../style/UtilitiesButtons.scss';

function ToggleBoolButton({ property, handleGroup }) {
  const propertyNode = useSelector((state) => {
    if (!property.isAction) {
      return state.propertyTree.properties[property.URI];
    }
    return null;
  });

  const [checked, setChecked] = React.useState(
    property.isAction ? property.defaultvalue : propertyNode.value
  );

  const dispatch = useDispatch();
  const boolPropertyDispatcher = React.useRef(propertyDispatcher(dispatch, property.URI));

  React.useEffect(() => {
    if (!property.isAction) {
      boolPropertyDispatcher.current.subscribe();
    }
    return () => {
      if (!property.isAction) {
        boolPropertyDispatcher.current.unsubscribe();
      }
    };
  }, []);

  function toggleChecked() {
    if (property.isAction) {
      if (!checked) {
        dispatch(triggerAction(property.actionEnabled));
        setChecked(true);
      } else {
        dispatch(triggerAction(property.actionDisabled));
        setChecked(false);
      }
    } else {
      const value = !checked;
      setChecked(value);
      boolPropertyDispatcher.current.set(value);
    }
  }

  // Used by parent ref. How?
  // function disableIfChecked() {
  //   if (checked) {
  //     if (property.isAction) {
  //       dispatch(triggerAction(property.actionDisabled));
  //     } else {
  //       boolPropertyDispatcher.current.set(false);
  //     }
  //     setChecked(false);
  //   }
  // }

  function handleOnClick() {
    toggleChecked();
    if (property.group && handleGroup) {
      handleGroup(property);
    }
  }

  return (
    <Button
      className={`${styles.UtilitiesButton} ${checked === true && styles.active}`}
      key={property.URI}
      onClick={handleOnClick}
      id={property.URI}
      regular
    >
      <SmallLabel id={property.URI} style={{ textAlign: 'center' }}>
        {property.label}
      </SmallLabel>
    </Button>
  );
}

ToggleBoolButton.propTypes = {
  property: PropTypes.shape({
    URI: PropTypes.string,
    defaultvalue: PropTypes.bool,
    label: PropTypes.string,
    isAction: PropTypes.bool
  }).isRequired
};

export default ToggleBoolButton;
