import React, { Component } from 'react';
import SmallLabel from '../common/SmallLabel/SmallLabel';
import styles from './Shortcut.scss';
import Button from '../common/Input/Button/Button';
import Icon from '../common/Icon/Icon';
import DataManager from '../../api/DataManager';
import InfoBox from '../common/InfoBox/InfoBox';

class Shortcut extends Component {
	constructor(props) {
    	super(props);
  	}

  	render() {
    	const { documentation, name, script } = this.props;
	    return (
	    	<div key={name} className={styles.shortcutContainer}>
			 	<Button className= {styles.executeButton} script={script} onClick={executeShortcut} >
		        	<Icon icon="call_missed_outgoing" />
		      	</Button>
				<div className={styles.content}> {name} &nbsp; <InfoBox text={documentation} /></div>
				
		    </div>
	    );
	 }
}

const executeShortcut = (e) => {
	e.stopPropagation();
	var script = e.currentTarget.getAttribute("script")
	if (script && script.length > 0) {
	    DataManager.runScript(e.currentTarget.getAttribute("script"));		
	}
}


export default Shortcut;
