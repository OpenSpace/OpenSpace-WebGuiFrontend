import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './SkybrowserFocusEntry.scss';
import Picker from '../Picker';
import MaterialIcon from '../../common/MaterialIcon/MaterialIcon';
import InfoBox from '../../common/InfoBox/InfoBox';
import { jsonToLuaString } from '../../../utils/propertyTreeHelpers';


class SkybrowserFocusEntry extends Component {
  constructor(props) {
    super(props);
    this.state = { showFullName: false };
    this.select = this.select.bind(this);
    this.truncate = this.truncate.bind(this);  
  }

  truncate(str) {
    return str.length > 10 ? str.substring(0,10) + "..." : str;
  }

  select(evt) {
    const { identifier } = this.props;
    if (this.props.onSelect) {
      this.props.onSelect(identifier, evt);
    }
  }

  get isActive() {
    return this.props.identifier === this.props.active;
  }
  
  render() {
    const { name, identifier, url, credits, creditsUrl } = this.props;
    //const [showFullName, setShowFullName] = useState(false);
  
    return (
      
      <li className={`${styles.entry} ${this.isActive && styles.active}`} onClick={this.select}
          onMouseEnter={() => {this.props.hoverFunc(this.props.identifier)} }
          onMouseLeave={() => {this.props.hoverLeavesImage()}}>
          <div className={styles.image}>
            <img src={url} alt={name} />
          </div>
          <div className={styles.imageHeader}>   
            <span className={styles.imageTitle} 
            onMouseEnter={() => { this.setState({showFullName : true}); }} 
            onMouseLeave={() => { this.setState({showFullName : false}); }}>     
              {( this.state.showFullName ? (name || identifier) : (this.truncate(name) || this.truncate(identifier)) )}
            </span>
            <InfoBox text={ credits }/>
          </div>
                
           {/*
            <Picker onClick={() =>  {
            const newWindow = window.open(creditsUrl, '_blank', 'noopener,noreferrer');
            if (newWindow) newWindow.opener = null;
            }}>
            </Picker>
           */}
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
