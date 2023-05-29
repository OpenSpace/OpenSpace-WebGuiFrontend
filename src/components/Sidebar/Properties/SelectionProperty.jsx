import React from 'react';
import PropTypes from 'prop-types';

import Button from '../../common/Input/Button/Button';
import Checkbox from '../../common/Input/Checkbox/Checkbox';
import ToggleContent from '../../common/ToggleContent/ToggleContent';

import PropertyLabel from './PropertyLabel';

function SelectionProperty({ description, dispatcher, value }) {
  const [expanded, setExpanded] = React.useState(false);

  function onCheckboxChange(checked, option) {
    const selection = value;
    const index = selection.indexOf(option);
    const foundInSelection = index !== -1;

    if (checked && !foundInSelection) { // add to selection
      selection.push(option);
    } else if (!checked && foundInSelection) { // remove from selection
      selection.splice(index, 1);
    }
    dispatcher.set(selection);
  }

  function isSelected(option) {
    return value.includes(option);
  }

  function selectAllClick(evt) {
    const options = description.AdditionalData.Options;
    dispatcher.set(options);
    evt.stopPropagation();
  }

  function clearSelectionClick(evt) {
    dispatcher.set([]);
    evt.stopPropagation();
  }

  const options = description.AdditionalData.Options;
  const isDisabled = description.MetaData.isReadOnly;

  const label = <PropertyLabel description={description} />;

  const helperButtons = (
    <span>
      <Button onClick={selectAllClick}> Select All </Button>
      <Button onClick={clearSelectionClick}> Clear </Button>
    </span>
  );

  return (
    <ToggleContent
      title={label}
      expanded={expanded}
      setExpanded={setExpanded}
    >
      {/* @TODO (emmbr, 2021-05-27): this property type cannot be disabled */}
      {/* <div className={`${this.disabled ? styles.disabled : ''}`}> */}
      { (options.length > 10) && helperButtons }
      {
        options.map((opt) => (
          <Checkbox
            key={opt}
            checked={isSelected(opt)}
            setChecked={(checked) => { onCheckboxChange(checked, opt); }}
            disabled={isDisabled}
          >
            <p>{opt}</p>
          </Checkbox>
        ))
      }
      {/* </div> */}
    </ToggleContent>
  );
}

SelectionProperty.propTypes = {
  description: PropTypes.shape({
    Identifier: PropTypes.string,
    Name: PropTypes.string,
    MetaData: PropTypes.shape({
      isReadOnly: PropTypes.bool
    }),
    AdditionalData: PropTypes.shape({
      Options: PropTypes.array
    }),
    description: PropTypes.string
  }).isRequired,
  dispatcher: PropTypes.object.isRequired,
  value: PropTypes.any.isRequired
};

export default SelectionProperty;
