import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './SkybrowserFocusEntry.scss';
import Picker from '../Picker';
import Button from '../../common/Input/Button/Button';
import MaterialIcon from '../../common/MaterialIcon/MaterialIcon';
import InfoBoxSkybrowser from '../../common/InfoBox/InfoBoxSkybrowser';
import TooltipSkybrowser from '../../common/Tooltip/TooltipSkybrowser';
import { jsonToLuaString } from '../../../utils/propertyTreeHelpers';

//import { clamp } from 'lodash/number';


class SkybrowserFocusEntry extends Component {
  constructor(props) {
    super(props);
    this.state = { showImageName: false };
    this.select = this.select.bind(this);
    this.setRef = this.setRef.bind(this);
    //this.showImageNamePopup = this.showImageNamePopup.bind(this);
    //this.hideImageNamePopup = this.hideImageNamePopup.bind(this);
  }

  setRef(what) {
    return (element) => {
      this[what] = element;
    };
  }

  select(evt) {
    const { identifier } = this.props;
    if (this.props.onSelect) {
      this.props.onSelect(identifier, evt);
    }
  }
  
  /*
  showImageNamePopup() {
    this.setState({ showImageName: true });
  }

  hideImageNamePopup() {
    this.setState({ showImageName: false });
  }
  */
  
  get isActive() {
    return this.props.identifier === this.props.active;
  }

  get position() {
    if (!this.wrapper) return { top: '0px', left: '0px' }; 
    const { top, left, right, bottom } = this.wrapper.getBoundingClientRect();
    return { top: `${bottom} - ${top}`, left: `${right} - ${left}`};
  }
  
  render() {
    const { name, identifier, url, credits, creditsUrl } = this.props;
    const { showImageName, showImageInfo } = this.state;
   
    return (
      
      <li className={`${styles.entry} ${this.isActive && styles.active}`} onClick={this.select}
          onMouseEnter={() => {this.props.hoverFunc(this.props.identifier)} }
          onMouseLeave={() => {this.props.hoverLeavesImage()}}>
          <div className={styles.image}>
            <img src={url} alt={name} />
          </div>
          <div className={styles.imageHeader}>   
         
            <span 
            ref={this.setRef('wrapper')}
            className={styles.imageTitle}>

            {/*
            onMouseEnter={ (name.length > 9 || identifier.length > 9 ? this.showImageNamePopup : this.hideImageNamePopup ) } 
            onMouseLeave={ this.hideImageNamePopup }         
              { showImageName && (
              <TooltipSkybrowser placement="bottom-right" style={this.position}> 
                { name || identifier } 
              </TooltipSkybrowser>  
              )}
            */}

              { name || identifier }   
            </span>
            <InfoBoxSkybrowser 
              title={(name || identifier)} 
              text={credits}  
              textUrl={creditsUrl}>
           </InfoBoxSkybrowser>
        


            {/*
            { credits && (
            <MaterialIcon  icon="help"
                onMouseEnter={this.showImageInfoPopup}
                onMouseLeave={this.hideImageInfoPopup}/> 
            )}
            { showImageInfo && (
            <TooltipSkybrowser placement="bottom-left" style={this.position}>
              <span className={styles.tooltipTitle}> { name || identifier } </span>
              { credits }

              <Button onClick={() =>  {
              const newWindow = window.open(creditsUrl, '_blank', 'noopener,noreferrer');
              if (newWindow) newWindow.opener = null;
              }}>
              </Button>
            </TooltipSkybrowser>
            )}
            */}

            {/*<InfoBox text={ credits }></InfoBox> */}
       
                
           {/*
                        <Picker onClick={() =>  {
              const newWindow = window.open(creditsUrl, '_blank', 'noopener,noreferrer');
              if (newWindow) newWindow.opener = null;
              }}>
              </Picker>
           */}

          </div>
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
  onSelect: null,
  active: '',
};

export default SkybrowserFocusEntry;
