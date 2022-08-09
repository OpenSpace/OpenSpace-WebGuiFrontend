import React, { Component, createRef } from 'react'
import styles from './DropDown.scss'

const DEFAULT_PLACEHOLDER_STRING = 'Select...'

class Dropdown extends Component {
  constructor (props) {
    super(props)
    this.state = {
      selected: this.parseValue(props.value, props.options) || {
        label: typeof props.placeholder === 'undefined' ? DEFAULT_PLACEHOLDER_STRING : props.placeholder,
        value: ''
      },
      isOpen: false
    }
    this.dropdownRef = createRef()
    this.mounted = true
    this.handleDocumentClick = this.handleDocumentClick.bind(this)
    this.fireChangeEvent = this.fireChangeEvent.bind(this)
  }

  componentDidUpdate (prevProps) {
    if (this.props.value !== prevProps.value) {
      if (this.props.value) {
        let selected = this.parseValue(this.props.value, this.props.options)
        if (selected !== this.state.selected) {
          this.setState({ selected })
        }
      } else {
        this.setState({
          selected: {
            label: typeof this.props.placeholder === 'undefined' ? DEFAULT_PLACEHOLDER_STRING : this.props.placeholder,
            value: ''
          }
        })
      }
    }
  }

  componentDidMount () {
    document.addEventListener('click', this.handleDocumentClick, false)
    document.addEventListener('touchend', this.handleDocumentClick, false)
  }

  componentWillUnmount () {
    this.mounted = false
    document.removeEventListener('click', this.handleDocumentClick, false)
    document.removeEventListener('touchend', this.handleDocumentClick, false)
  }

  handleMouseDown (event) {
    if (this.props.onFocus && typeof this.props.onFocus === 'function') {
      this.props.onFocus(this.state.isOpen)
    }
    if (event.type === 'mousedown' && event.button !== 0) return
    event.stopPropagation()
    event.preventDefault()

    if (!this.props.disabled) {
      this.setState({
        isOpen: !this.state.isOpen
      })
    }
  }

  parseValue (value, options) {
    let option

    if (typeof value === 'string') {
      for (var i = 0, num = options.length; i < num; i++) {
        if (options[i].type === 'group') {
          const match = options[i].items.filter(item => item.value === value)
          if (match.length) {
            option = match[0]
          }
        } else if (typeof options[i].value !== 'undefined' && options[i].value === value) {
          option = options[i]
        }
      }
    }

    return option || value
  }

  setValue (value, label) {
    let newState = {
      selected: {
        value,
        label},
      isOpen: false
    }
    this.fireChangeEvent(newState)
    this.setState(newState)
  }

  fireChangeEvent (newState) {
    if (newState.selected !== this.state.selected && this.props.onChange) {
      this.props.onChange(newState.selected)
    }
  }

  renderOption (option) {
    let value = option.value
    if (typeof value === 'undefined') {
      value = option.label || option
    }
    let label = option.label || option.value || option
    let isSelected = value === this.state.selected.value || value === this.state.selected

    const dataAttributes = Object.keys(option.data || {}).reduce(
      (acc, dataKey) => ({
        ...acc,
        [`data-${dataKey}`]: option.data[dataKey]
      }),
      {}
    )

    return (
      <div
        key={value}
        className={`${styles.DropdownOption} ${isSelected ? styles.isSelected : ""}`}
        onMouseDown={this.setValue.bind(this, value, label)}
        onClick={this.setValue.bind(this, value, label)}
        role='option'
        aria-selected={isSelected ? 'true' : 'false'}
        {...dataAttributes}
      >
        {label}
      </div>
    )
  }

  buildMenu () {
    let { options } = this.props
    let ops = options.map((option) => {
      if (option.type === 'group') {
        let groupTitle = (<div className={styles.DropdownTitle}>
          {option.name}
        </div>)
        let _options = option.items.map((item) => this.renderOption(item))

        return (
          <div className={styles.DropdownGroup} key={option.name} role='listbox' tabIndex='-1'>
            {groupTitle}
            {_options}
          </div>
        )
      } else {
        return this.renderOption(option)
      }
    })

    return ops.length ? ops : <div className={styles.DropdownNoresults}>
                                No options found
    </div>
  }

  handleDocumentClick (event) {
    if (this.mounted) {
      if (!this.dropdownRef.current.contains(event.target)) {
        if (this.state.isOpen) {
          this.setState({ isOpen: false })
        }
      }
    }
  }

  isValueSelected () {
    return typeof this.state.selected === 'string' || this.state.selected.value !== ''
  }

  render () {
    const { arrowClosed, arrowOpen } = this.props
    const placeHolderValue = typeof this.state.selected === 'string' ? this.state.selected : this.state.selected.label

    const value = (<div className={styles.DropdownPlaceholder}>
      {placeHolderValue}
    </div>)
    const menu = this.state.isOpen ? <div className={styles.DropdownMenu} aria-expanded='true'>
      {this.buildMenu()}
    </div> : null

    return (
      <div ref={this.dropdownRef} className={styles.DropdownRoot}>
        <div className={styles.DropdownControl} onMouseDown={this.handleMouseDown.bind(this)} onTouchEnd={this.handleMouseDown.bind(this)} aria-haspopup='listbox'>
          {value}
          <div className={styles.DropdownArrowWrapper}>
            {arrowOpen && arrowClosed
              ? this.state.isOpen ? arrowOpen : arrowClosed
              : <span className={styles.DropdownArrow} />}
          </div>
        </div>
        {menu}
      </div>
    )
  }
}

export default Dropdown