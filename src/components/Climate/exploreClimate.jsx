import PropTypes from 'prop-types';
import React,{ Component } from 'react';
import HomeButtonContainer from '../TouchBar/UtilitiesMenu/containers/HomeButtonContainer';
import styles from './exploreClimate.scss';
import InfoMenu from './infoMenu'
import { connect } from 'react-redux';

import SightsController from '../TouchBar/UtilitiesMenu/presentational/SightsController';

import {
  storyGetLayer,
} from '../../utils/storyHelpers';
class exploreClimate extends Component{


  constructor(props) {
    super(props);

    this.state = {

    };

    this.setLayer = this.setLayer.bind(this);
  }


  setLayer(layer){

    const{luaApi} = this.props;
    const layerFromJson = storyGetLayer(luaApi, layer);

    return layerFromJson;
  }

  render() {
    //console.log("hej")
    //console.table(this.props.currentStory)
    //console.log(story.sightscontroller)
    const { story, storyInfo} = this.props


    /*{
      this.props.story.datecontroller.map((story) => {
        return (
          <div key = {story.id}>
            <h1 key = {story.title}>{story.title}</h1>
            <p
              key= {story.info}>{story.info}</p>

          </div>

        );
      })

    }*/
    //console.log(this.props.currentStory)
    //console.log("nemen")
    //console.table(this.props.story.title)
    //console.log("wooddffffp")
    //console.log(this.props.json)
    return (

      <div className={styles.StoryPosistion}>
        <div className = {styles.TellStory}>
          <div className = "flex">




          <div style={{ display: 'flex' }}>
          {(story) && (
            <div styles = {{color: "red"}}><p>hej</p></div>
          )}

          <div className={styles.exploreClimate}>

            <section className={styles.HomeButton}>
              <HomeButtonContainer resetStory={this.props.resetStory}/>

            </section>
              <section className={styles.Grid__Left}>
              <InfoMenu resetStory={this.props.resetStory} pickedStory = {this.props.json}/>
            </section>


          </div>

      </div>

    </div>
  </div>
</div>

);}

}



exploreClimate.propTypes = {
  story: PropTypes.objectOf(PropTypes.shape({
    storyTitle: PropTypes.string,
    storyInfo: PropTypes.string,
  })),
};
exploreClimate.defaultProps = {
  story: {},
  json: {},
};

export default exploreClimate;
