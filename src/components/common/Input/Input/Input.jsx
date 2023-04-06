import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { excludeKeys } from '../../../../utils/helpers';
import MaterialIcon from '../../MaterialIcon/MaterialIcon';
import styles from './Input.scss';

class Input extends Component {
  static get nextId() {
    return Input.idCounter++;
  }

  constructor(props) {
    super(props);

    this.state = {
      value: props.value,
      id: `input-${Input.nextId}`,
    };

    this.onChange = this.onChange.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.clear = this.clear.bind(this);
    this.setInputRef = this.setInputRef.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    // Update state value variable when we get new props
    if (prevProps.value !== this.props.value) {
      this.setState({ value: this.props.value });
    }
  }

  /**
   * callback for input
   * @param event InputEvent
   */
  onChange(event) {
    const { value } = event.target;

    // update state so that input is re-rendered with new content
    this.setState({ value });

    // send to the onChange (if any)!
    this.props.onChange(event);
  }

  onKeyUp(event) {
    if (event.key === 'Enter') {
      this.props.onEnter(event);
    }
  }

  onKeyDown(event) {
    //TMP hack for windows CEF not allowing .
    //other issues are not fixed by this but at least it lets .for now.
    // i.e || (event.keyCode == 39) this should be ' but winds up being right arrow
    //this solution is so bad it only lets you put . at the end of a value.
    //but I feel its still better then nothing happening.
    if ( (window.navigator.platform == "Win32") && ((event.keyCode == 46)) ) {
      let charString = String.fromCharCode(event.keyCode);
      if (event.currentTarget.type == "number") {
        charString += "0";
      }
      this.inputNode.value += charString;
      this.onChange({ currentTarget: this.inputNode });
    }
  }

  /**
   * callback to keep save a reference of the input field
   * @param node
   */
  setInputRef(node) {
    this.inputNode = node;
  }

  /**
   * clear the input field
   */
  clear() {
    this.setState({ value: '' });

    // trigger onchange event on input
    this.inputNode.value = '';
    const event = new CustomEvent('clear');
    this.inputNode.dispatchEvent(event);
    this.onChange(event);
    this.inputNode.focus();
  }

  get hasInput() {
    return this.state.value !== '';
  }

  /**
   * filter out props that shouldn't be inherited by the input element
   * @returns {*}
   */
  get inheritProps() {
    const doNotInclude = 'children onEnter wide onChange loading value clearable';
    return excludeKeys(this.props, doNotInclude);
  }

  render() {
    const { placeholder, className, wide, loading, clearable, label, children } = this.props;
    const { value, id } = this.state;
    return (
      <div className={`${styles.group} ${wide ? styles.wide : ''}`}>
        <input
          {...this.inheritProps}
          className={`${className} ${styles.input}
                      ${this.hasInput ? styles.hasinput : ''}
                      ${loading ? styles.loading : ''}
                      ${wide ? styles.wide : ''}`}
          id={id}
          onChange={this.onChange}
          onKeyUp={this.onKeyUp}
          onKeyDown={this.onKeyDown}
          value={value}
          ref={this.setInputRef}
        />
        <label htmlFor={id} className={`${styles.label} ${this.hasInput && styles.hasinput}`}>
          { label || placeholder }
        </label>
        <div className={styles.buttonsContainer}>
          { children }
          { clearable && (
            <MaterialIcon
              icon="cancel"
              className={`${styles.clearbutton} ${this.hasInput && styles.hasinput}`}
              onClick={this.clear}
              tabIndex="0"
              role="button"
              title="Clear input field"
            />
          )}
        </div>
      </div>
    );
  }
}

Input.idCounter = Input.idCounter || 1;

Input.propTypes = {
  onChange: PropTypes.func,
  onEnter: PropTypes.func,
  className: PropTypes.string,
  clearable: PropTypes.bool,
  label: PropTypes.node,
  loading: PropTypes.bool,
  placeholder: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  wide: PropTypes.bool,
};

Input.defaultProps = {
  onChange: () => {},
  onEnter: () => {},
  className: '',
  clearable: false,
  label: null,
  loading: false,
  value: '',
  wide: true,
};

export default Input;

