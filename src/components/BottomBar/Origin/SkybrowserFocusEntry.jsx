import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './SkybrowserFocusEntry.scss';
import Picker from '../Picker';
import Button from '../../common/Input/Button/Button';
import MaterialIcon from '../../common/MaterialIcon/MaterialIcon';
import InfoBoxSkybrowser from '../../common/InfoBox/InfoBoxSkybrowser';
import TooltipSkybrowser from '../../common/Tooltip/TooltipSkybrowser';
import { jsonToLuaString } from '../../../utils/propertyTreeHelpers';
import SkybrowserTabs from '../../common/Tabs/SkybrowserTabs';

//import { clamp } from 'lodash/number';
class OpacitySlider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 100
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
    this.props.setOpacity(Number(this.props.identifier), Number(this.state.value/100));
  }

  render() {
    return   <div className={styles.slidecontainer}><input type="range" min="0" max="100" value={this.state.value}  className={styles.slider} onChange={this.handleChange} /> </div>;
  }
}

class SkybrowserFocusEntry extends Component {
  constructor(props) {
    super(props);
    this.state = {selectedImageBorderColor: ''}
    this.select = this.select.bind(this);
    this.setBorderColor = this.setBorderColor.bind(this);
  }

  setBorderColor() {
    const color = this.props.currentTargetColor();
    this.setState({ selectedImageBorderColor: color == "" ? 'red' : 'rgb(' + color + ')' });
  }

  select(evt) {
    const { identifier, onSelect } = this.props;
    if (onSelect && identifier) {
      onSelect(identifier, evt);
    }
    this.props.currentTargetColor ? this.setBorderColor() : null;
  }

  get isActive() {
    return this.props.identifier === this.props.active;
  }

  get isTabEntry() {
    return this.props.setOpacity;
  }

  render() {
    const { name, identifier, thumbnail, credits, creditsUrl, has3dCoords, setOpacity, removeImageSelection, add3dImage} = this.props;
    const image3dbutton = has3dCoords ? <MaterialIcon
      icon={'add_circle'}
      className={'small'}
      onClick={() => {add3dImage(identifier)}}>
      </MaterialIcon> : "";
    const imageRemoveButton = removeImageSelection ? <div style={{display: 'flex', justifyContent: 'flex-end'}}>
    <Button onClick={() => {removeImageSelection(identifier)}} className={styles.removeImageButton} transparent small>
      <MaterialIcon icon="close" className="small" />
    </Button></div> : "";
    /*
    <MaterialIcon
      icon={'highlight_off'}
      style={{fontSize: '15px'}}
      onClick={() => {this.props.removeImageSelection(identifier)}}>
      </MaterialIcon> : "";*/

    const opacitySlider = setOpacity ? <OpacitySlider setOpacity={setOpacity} identifier={identifier}/> : "";

    return (

      <li className={`${styles.entry} ${this.isTabEntry && styles.tabEntry} ${this.isActive && styles.active}`}
          style={{ borderLeftColor: this.state.selectedImageBorderColor }}
          onMouseEnter={() => {this.props.hoverFunc(identifier)} }
          onMouseLeave={() => {this.props.hoverLeavesImage()}}>
          {imageRemoveButton}
          <div className={styles.image}>
            <img src={thumbnail} alt={name} onClick={this.select}/>
          </div>
          <div className={styles.imageHeader}>
            <span
            className={styles.imageTitle}>
              { name || identifier }
            </span>
            <InfoBoxSkybrowser
              title={(name || identifier)}
              text={credits}
              textUrl={creditsUrl}
              isTabEntry={this.isTabEntry}>
            </InfoBoxSkybrowser>
          </div>
          {image3dbutton}
          {opacitySlider}
      </li>
    );
  }
}

SkybrowserFocusEntry.propTypes = {
  identifier: PropTypes.string.isRequired,
  name: PropTypes.string,
  onSelect: PropTypes.func,
  active: PropTypes.string,
};

SkybrowserFocusEntry.defaultProps = {
  active: '',
  onSelect: null
};

export default SkybrowserFocusEntry;
