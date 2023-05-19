import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Button from '../../common/Input/Button/Button';
import Checkbox from '../../common/Input/Checkbox/Checkbox';
import ToggleContent from '../../common/ToggleContent/ToggleContent';

import PropertyLabel from './PropertyLabel';

class SelectionProperty extends Component {
  constructor(props) {
    super(props);

    this.state = {
      expanded: false
    };

    this.setExpanded = this.setExpanded.bind(this);
    this.isSelected = this.isSelected.bind(this);
    this.onCheckboxChange = this.onCheckboxChange.bind(this);
    this.selectAllClick = this.selectAllClick.bind(this);
    this.clearSelectionClick = this.clearSelectionClick.bind(this);
  }

  componentDidMount() {
    this.props.dispatcher.subscribe();
  }

  componentWillUnmount() {
    this.props.dispatcher.unsubscribe();
  }

  onCheckboxChange(checked, option) {
    const selection = this.props.value; 
    const index = selection.indexOf(option);
    const isSelected = index !== -1;

    if (checked && !isSelected) { // add to selection
      selection.push(option);
    } else if (!checked && isSelected) { // remove from selection
      selection.splice(index, 1);
    }
    this.props.dispatcher.set(selection);
  }

  setExpanded(expanded) {
    this.setState({ expanded });
  }

  isSelected(option) {
    const { value } = this.props; 
    return value.includes(option);
  }

  selectAllClick(evt) {
    const options = this.props.description.AdditionalData.Options;
    this.props.dispatcher.set(options);
    evt.stopPropagation();
  }

  clearSelectionClick(evt) {
    this.props.dispatcher.set([]);
    evt.stopPropagation();
  }

  render() {
    const { description } = this.props;
    const options = description.AdditionalData.Options;
    const isDisabled = description.MetaData.isReadOnly;

    const label = <PropertyLabel description={description} />;

    const helperButtons = (
      <span>
        <Button onClick={this.selectAllClick}> Select All </Button>
        <Button onClick={this.clearSelectionClick}> Clear </Button>
      </span>
    );

    return (
      <ToggleContent
        title={label}
        expanded={this.state.expanded}
        setExpanded={this.setExpanded}
      >
        {/* @TODO (emmbr, 2021-05-27): this property type cannot be disabled */}
        {/* <div className={`${this.disabled ? styles.disabled : ''}`}> */}
        { (options.length > 10) && helperButtons }
        {
          options.map((opt) => (
            <Checkbox
              key={opt}
              checked={this.isSelected(opt)}
              setChecked={(checked) => { this.onCheckboxChange(checked, opt); }}
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
}

SelectionProperty.propTypes = {
  description: PropTypes.shape({
    Identifier: PropTypes.string,
    Name: PropTypes.string,
    MetaData: PropTypes.shape({
      isReadOnly: PropTypes.bool
    }),
    description: PropTypes.string
  }).isRequired,
  value: PropTypes.any.isRequired
};

export default SelectionProperty;
