import React, { Component } from 'react';
import PropTypes, { bool } from 'prop-types';
import InfoBox from '../../common/InfoBox/InfoBox';
import { copyTextToClipboard } from '../../../utils/helpers';
import ToggleContent from '../../common/ToggleContent/ToggleContent';
import Checkbox from '../../common/Input/Checkbox/Checkbox';

class SelectionProperty extends Component {
  constructor(props) {
    super(props);

    this.state = {
      expanded: false
    };

    this.isSelected = this.isSelected.bind(this);
    this.onCheckboxChange = this.onCheckboxChange.bind(this);
    this.copyUri = this.copyUri.bind(this);
  }

  componentDidMount() {
    this.props.dispatcher.subscribe();
  }

  componentWillUnmount() {
    this.props.dispatcher.unsubscribe();
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

  onCheckboxChange(checked, option) {
    let selection = this.selection;
    const index = selection.indexOf(option)
    const isSelected = index != -1;
    
    if(checked && !isSelected) { // add to selection
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

  render() {
    const { description } = this.props;
    const { Options } = description.AdditionalData;

    const label = (<span onClick={this.copyUri}>
      { description.Name } { this.descriptionPopup }
    </span>);

    const setExpanded = (expanded) => {
      this.setState({ expanded: expanded });
    }

    return (
      <ToggleContent
        title={label}
        expanded={this.state.expanded}
        setExpanded={setExpanded}
      >
        {
          Options.map(opt => 
            <Checkbox
              key={opt}
              label={opt}
              checked={this.isSelected(opt)}
              setChecked={(checked) => { this.onCheckboxChange(checked, opt); }}
              disabled={this.disabled}
            />
          )
        }
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
