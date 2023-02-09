import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { copyTextToClipboard } from '../../../utils/helpers';
import InfoBox from '../../common/InfoBox/InfoBox';
import Button from '../../common/Input/Button/Button';
import Checkbox from '../../common/Input/Checkbox/Checkbox';
import ToggleContent from '../../common/ToggleContent/ToggleContent';

class SelectionProperty extends Component {
  constructor(props) {
    super(props);

    this.state = {
      expanded: false
    };

    this.setExpanded = this.setExpanded.bind(this);
    this.isSelected = this.isSelected.bind(this);
    this.onCheckboxChange = this.onCheckboxChange.bind(this);
    this.copyUri = this.copyUri.bind(this);
    this.selectAllClick = this.selectAllClick.bind(this);
    this.clearSelectionClick = this.clearSelectionClick.bind(this);
  }

  componentDidMount() {
    this.props.dispatcher.subscribe();
  }

  componentWillUnmount() {
    this.props.dispatcher.unsubscribe();
  }

  setExpanded(expanded) {
    this.setState({ expanded: expanded });
  }

  get descriptionPopup() {
    const { description } = this.props.description;
    return description ? (<InfoBox text={description} />) : '';
  }

  copyUri() {
    copyTextToClipboard(this.props.description.Identifier);
  }

  get disabled() {
    return this.props.description.MetaData.isReadOnly;
  }

  get selection() {
    return this.props.value;
  }

  get options() {
    return this.props.description.AdditionalData.Options;
  }

  onCheckboxChange(checked, option) {
    let selection = this.selection;
    const index = selection.indexOf(option)
    const isSelected = index != -1;

    if (checked && !isSelected) { // add to selection
      selection.push(option);
    }
    else if (!checked && isSelected) { // remove from selection
      selection.splice(index, 1);
    }
    this.props.dispatcher.set(selection);
  }

  isSelected(option) {
    return this.selection.includes(option);
  }

  selectAllClick(evt) {
    this.props.dispatcher.set(this.options);
    evt.stopPropagation();
  }

  clearSelectionClick(evt) {
    this.props.dispatcher.set([]);
    evt.stopPropagation();
  }

  render() {
    const { description } = this.props;
    const options = this.options;

    const label = (<span onClick={this.copyUri}>
      { description.Name } { this.descriptionPopup }
    </span>);

    const helperButtons = (
      <span>
        <Button onClick={this.selectAllClick}> Select All </Button>
        <Button onClick={this.clearSelectionClick}> Clear </Button>
      </span>
    )

      console.log(this.disabled);

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
            options.map(opt => 
              <Checkbox
                key={opt}
                label={opt}
                checked={this.isSelected(opt)}
                setChecked={(checked) => { this.onCheckboxChange(checked, opt); }}
                disabled={this.disabled}
              />
            )
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
      isReadOnly: PropTypes.bool,
    }),
    description: PropTypes.string,
  }).isRequired,
  value: PropTypes.any
};

export default SelectionProperty;
