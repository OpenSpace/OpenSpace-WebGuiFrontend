import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { copyTextToClipboard } from '../../../utils/helpers';
import InfoBox from '../../common/InfoBox/InfoBox';
import Input from '../../common/Input/Input/Input';
import styles from './Property.scss';

class ListProperty extends Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
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

  onChange(evt) {
    const value = evt.target.value.trim();

    if (value === '') {
      this.props.dispatcher.set({});
      return;
    }

    this.props.dispatcher.set(value.split(','));
  }

  render() {
    const { description, value } = this.props;
    const label = (
      <span onClick={this.copyUri}>
        { description.Name }
        {' '}
        { this.descriptionPopup }
      </span>
    );
    return (
      <div className={`${this.disabled ? styles.disabled : ''}`}>
        <Input
          value={value.join(',')}
          label={label}
          placeholder={description.Name}
          onEnter={this.onChange}
          disabled={this.disabled}
        />
      </div>
    );
  }
}

ListProperty.propTypes = {
  description: PropTypes.shape({
    Identifier: PropTypes.string,
    Name: PropTypes.string,
    MetaData: PropTypes.shape({
      isReadOnly: PropTypes.bool,
    }),
    description: PropTypes.string,
  }).isRequired,
  value: PropTypes.any,
};

export default ListProperty;
