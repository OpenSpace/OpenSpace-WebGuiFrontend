import PropTypes from 'prop-types';
import React,{ Component } from 'react';
import HomeButtonContainer from '../TouchBar/UtilitiesMenu/containers/HomeButtonContainer';
import styles from './exploreClimate.scss';

import { connect } from 'react-redux';
import NextPrevStepButton from './NextPrevButton';
import PickStoryLocal from './LocalStory/PickStoryLocal';
import SightsController from '../TouchBar/UtilitiesMenu/presentational/SightsController';
import subStateToProps from "../../utils/subStateToProps";
import {
  storyGetLayer,
} from '../../utils/storyHelpers';
class ExploreClimate extends Component{

  constructor(props) {
    super(props);

    this.state = {
      StoryStep: 0,
      LocalStory: "default",
    };
    this.stepThroughStory = this.stepThroughStory.bind(this);
    this.Increment = this.Increment.bind(this);
    this.Decrement = this.Decrement.bind(this);
    this.LocalStory = this.LocalStory.bind(this);
  }

  Increment = () => {
        this.setState((prevState) => ({
          StoryStep: prevState.StoryStep + 1
    }));
  }
  Decrement = () => {
        this.setState((prevState) => ({
          StoryStep: prevState.StoryStep - 1
    }));
  }

  LocalStory(story){
    console.log("im here");
    return (

      <div key = {story.id} style={{ background: 'red' }}>
        <h1>
          hehafhfdalihdlihfdalihfdalihfdalhfdalhfdafdaljhfdafdaluhfda
        </h1>
        <p>
          {story.storyinfo}
        </p>
      </div>
    );
  }



  stepThroughStory(StoryStep, filePath){
    const {luaApi, json } = this.props;
    console.log("hejheheheheheh");
    return(
      filePath.map((story) => {
        if(story.id == StoryStep){

          storyGetLayer(luaApi, story.toggleboolproperties);
          return (
            <div key = {story.id}>
              <h1>
                {story.title}
              </h1>
              <p>
                {story.storyinfo}
              </p>
            </div>

          );
        }
      })
    );

  }


  render() {
    const { json, story, storyInfo} = this.props;
    const { StoryStep } = this.state;
    var stepThroughJourney = this.stepThroughStory(StoryStep, json.journey);
    console.log("if ");
    console.log(StoryStep);
    return (
      <div className={styles.StoryPosistion}>
        <div className = {styles.TellStory}>
          <div className = "flex">

            { StoryStep <  stepThroughJourney.length &&
              <div id = "je" >
                {stepThroughJourney}
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
              </div>
            }
              { StoryStep <  stepThroughJourney.length -1 &&
                <div>
                  <section className = {styles.NextStepButton}>
                    <NextPrevStepButton next = {this.Increment} storyStep = {StoryStep} string = {"Next!"}/>
                  </section>
                </div>
              }
              {StoryStep > 0   &&

                <section className = {styles.PrevStepButton}>
                  <NextPrevStepButton next = {this.Decrement} storyStep = {StoryStep} string = {"Previus!"}/>
                </section>
                }
                { json.journey[StoryStep].local.length > 0 &&

                  json.journey[StoryStep].local.map((story, index) => {

                    return(
                        <div key = {index}>
                        <PickStoryLocal key = { index }
                          storyInfo = { story }
                          StoryStep = {StoryStep}
                          next = {this.Increment}
                        />
                       </div>
                      );
                    })

                }


          </div>
        </div>

        <section className={styles.HomeButton}>
          <HomeButtonContainer resetStory={this.props.resetStory}/>
        </section>
      </div>

      );

  }
}

ExploreClimate.propTypes = {
  story: PropTypes.objectOf(PropTypes.shape({
    storyTitle: PropTypes.string,
    storyInfo: PropTypes.string,
  })),
  luaApi: PropTypes.object,
};
ExploreClimate.defaultProps = {
  story: {},
  json: {},
};
const mapSubStateToProps = ({ luaApi }) => {
  return {
    luaApi: luaApi,
  };
};

const mapStateToSubState = (state) => ({
  luaApi: state.luaApi,
});
ExploreClimate = connect(subStateToProps(mapSubStateToProps, mapStateToSubState))(ExploreClimate);

export default ExploreClimate;
