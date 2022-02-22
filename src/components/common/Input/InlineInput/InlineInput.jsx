import PropTypes from 'prop-types';
import React, { Component } from 'react';
import AutosizeInput from 'react-input-autosize';
import { excludeKeys } from '../../../../utils/helpers';
import Input from '../Input/Input';
import styles from './InlineInput.scss';

class InlineInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
      focus: false
    }

    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  render() {
    const { props, state, onKeyUp } = this;
    return <AutosizeInput
      {...excludeKeys(props, "noExtraWidth onEnter")}
      id={props.id || `inlineinput-${Input.nextId}`}
      value={state.value}
      onChange={this.onChange}
      onKeyUp={onKeyUp}
      onBlur={this.onBlur}
      onFocus={this.onFocus}
      className={`${styles.input} ${props.className}`}
      extraWidth={props.noExtraWidth ? 0 : undefined}
    />
  }

  componentDidUpdate() {
    const { props, state } = this;
    if (props.value === state.value) {
      return;
    }
    if (state.focus) {
      return;
    }
    this.setState({
      value: props.value
    });
  }

  onFocus() {
    this.setState({
      focus: true
    });
  }

  onBlur(event) {
    this.setState({
      focus: false
    });
    this.props.onEnter(event);
  }

  onKeyUp(event) {
    if (event.key === 'Enter') {
      this.props.onEnter(event);
    }
  }

  onChange(event) {
    const { props, state } = this;
    const { value } = event.currentTarget;
    this.setState({
      value
    });
    this.props.onChange(event);
  }
}

InlineInput.propTypes = {
  className: PropTypes.string,
  id: PropTypes.string,
  onChange: PropTypes.func,
  onEnter: PropTypes.func,
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  noExtraWidth: PropTypes.bool
};

InlineInput.defaultProps = {
  className: '',
  id: null,
  onChange: () => {},
  onEnter: () => {},
  type: 'text',
  value: '',
  noExtraWidth: false
};

export default InlineInput;
