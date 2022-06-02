import PropTypes from 'prop-types';
import React,{ Component } from 'react';
import HomeButtonContainer from '../TouchBar/UtilitiesMenu/containers/HomeButtonContainer';
import styles from './exploreClimate.scss';
import InfoMenu from './infoMenu'
import { connect } from 'react-redux';
import NextStepButton from './nextButton';
import PickStoryLocal from './PickStoryLocal';
import SightsController from '../TouchBar/UtilitiesMenu/presentational/SightsController';
import subStateToProps from "../../utils/subStateToProps";
import {
  storyGetLayer, storyGetLayer2, storyGetLocation
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

  stepThroughStory(StoryStep, filePath){
    const {luaApi, json } = this.props;
    var idnr = json.journey.length;

    return(
      filePath.map((story) => {
        if(story.id == StoryStep){
          console.log("storystep " + StoryStep);
          console.log("heeej",idnr);
          console.table(story)
          storyGetLayer2(luaApi, story.toggleboolproperties_noshow);
          storyGetLayer(luaApi, story.toggleboolproperties);
          storyGetLocation(luaApi, story.pos);

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

    //var stepThroughLocal = this.stepThroughStory(StoryStep, json.local)

    if(StoryStep < stepThroughJourney.length){
    return (
      <div className={styles.StoryPosistion}>
        <div className = {styles.TellStory}>
          <div className = "flex">
              {stepThroughJourney}
              <br/>
              <br/>
              <br/>
              <br/>
              <br/>
              { StoryStep <  stepThroughJourney.length -1 &&
                <section className = {styles.NextStepButton}>
                  <NextStepButton next = {this.Increment} storyStep = {StoryStep} string = {"Next!"}/>
                </section>
              }
              {StoryStep > 0 && StoryStep < stepThroughJourney.length  &&
                <section className = {styles.PrevStepButton}>
                  <NextStepButton next = {this.Decrement} storyStep = {StoryStep} string = {"Previous!"}/>}
                </section>
              }

              { StoryStep ==  stepThroughJourney.length - 1 && json.local.length > 0 &&


                json.local.map((story, index) => {
                    return(
                      <div key = {index} style={{height: 40+1*story.id}} >
                      <PickStoryLocal key = {index}
                        storyInfo = {story}
                        storyTitle = {story.title}
                      />

                    </div>



                    );
                  })

              }
              <br/>
              <br/>
              <br/>
              <div className={styles.HomeButton}>

                  <HomeButtonContainer resetStory={this.props.resetStory}/>

              </div>
          </div>
        </div>

      </div>

      );
    }

    else{
      return(
        <div className={styles.StoryPosistion}>
          <div className = {styles.TellStory}>
        //{stepThroughLocal}
            {StoryStep > 0 &&
              <section className = {styles.PrevStepButton}>
                <NextStepButton next = {this.Decrement} storyStep = {StoryStep} string = {"Previous!!!"}/>}
              </section>
            }
        </div>
      </div>

      );
  }
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
