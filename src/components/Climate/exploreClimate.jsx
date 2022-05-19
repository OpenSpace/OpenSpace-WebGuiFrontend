import PropTypes from 'prop-types';
import React,{ Component } from 'react';
import HomeButtonContainer from '../TouchBar/UtilitiesMenu/containers/HomeButtonContainer';
import styles from './exploreClimate.scss';
import InfoMenu from './infoMenu'






class exploreClimate extends Component{


  constructor(props) {
    super(props);

    this.state = {

    };


  }


  render() {
    // console.log("tjeeeeena " + this.props.currentStory)
    return (


      <div className={styles.exploreClimate}>

        <section className={styles.HomeButton}>
          <HomeButtonContainer resetStory={this.props.resetStory}/>

        </section>
          <section className={styles.Grid__Left}>

          <InfoMenu resetStory={this.props.resetStory} pickedStory = {this.props.currentStory}/>
        </section>


      </div>



    );}



}

exploreClimate.propTypes = {
  story: PropTypes.objectOf(PropTypes.shape({})),

};

export default exploreClimate;
