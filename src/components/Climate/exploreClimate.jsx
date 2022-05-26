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
          console.log("hej",idnr);
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
    //console.log("hej")
    //console.table(this.props.currentStory)
    //console.log(story.sightscontroller)
    const { json, story, storyInfo} = this.props;
    const { StoryStep } = this.state;

    var stepThroughJourney = this.stepThroughStory(StoryStep, json.journey);

    var stepThroughLocal = this.stepThroughStory(StoryStep, json.local)

    //console.log(this.props.currentStory)
    //console.log("nemen")
    //console.table(this.props.story.title)
    //console.log("wooddffffp")
    console.log("woop" + StoryStep)
    console.table("j " + stepThroughJourney)
    console.table("l " + stepThroughJourney.length)

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
                  <NextStepButton next = {this.Decrement} storyStep = {StoryStep} string = {"Previus!"}/>}
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
          </div>
        </div>
        <section className={styles.HomeButton}>
          <HomeButtonContainer resetStory={this.props.resetStory}/>
        </section>
      </div>

      );
    }

    else{
      return(
        <div className={styles.StoryPosistion}>
          <div className = {styles.TellStory}>
          {stepThroughLocal}
            {StoryStep > 0 &&
              <section className = {styles.PrevStepButton}>
                <NextStepButton next = {this.Decrement} storyStep = {StoryStep} string = {"Prevffius!"}/>}
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
