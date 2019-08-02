import React, { Component } from 'react';
import Popover from '../common/Popover/Popover';
import SmallLabel from '../common/SmallLabel/SmallLabel';
import Button from '../common/Input/Button/Button';
import Picker from './Picker';
import MaterialIcon from '../common/MaterialIcon/MaterialIcon';
import Input from '../common/Input/Input/Input';
import Row from '../common/Row/Row';

import ScrollOverlay from '../common/ScrollOverlay/ScrollOverlay';


import { setPopoverVisibility, onOpenConnection } from '../../api/Actions';
import { connect } from 'react-redux';

import styles from './ScreenSpaceRenderablePanel.scss';

import {
  ScreenSpaceRenderablesKey,
} from '../../api/keys';

import PropertyOwner from '../Sidebar/Properties/PropertyOwner'
import propertyDispatcher from '../../api/propertyDispatcher';

class ScreenSpaceRenderablePanel extends Component {

  constructor(props) {
    super(props);
    console.log("Scroll")
    this.state = {
      slideName: undefined,
    };

    this.togglePopover = this.togglePopover.bind(this);
    this.addSlide = this.addSlide.bind(this);
  }

  togglePopover() {
    this.props.setPopoverVisibility(!this.props.popoverVisible)
  }

  updateSlideName(evt) {
    this.setState({
      slideName: evt.target.value
    });
  }  

  updateSlideURL(evt) {
    this.setState({
      slideURL: evt.target.value
    });
  }

  updateSlideURLForFile(evt) {
    var url = evt.target.files[0].name;
    console.log(evt.target.files);
    this.setState({
      slideURL: url
    });
  }

  chooseFile() {
    document.getElementById('local-file').click();
  }

  addSlide() {

    var renderable = {        
      Identifier: this.state.slideName,
      Name: this.state.slideName 
    };
    
    if (this.state.slideURL.indexOf("http") != 0) {
      renderable.Type = 'ScreenSpaceImageLocal';
      renderable.TexturePath = this.state.slideURL;
    } else {
      renderable.Type = 'ScreenSpaceImageOnline';
      renderable.URL = this.state.slideURL;
    }

    this.props.luaApi.addScreenSpaceRenderable(renderable);

    setTimeout(() => {
      this.props.refresh();
    }, 500);

  }

  get popover() {
    const slideNameLabel = <span>Slide name</span>;
    const slideURLLabel = <span>URL</span>;
    const noSlidesLabel = <span>No active slides</span>;
    const renderables = this.props.screenSpaceRenderables; 
    var slideContent;
    var key = 0;
    if (renderables.length == 0) {
      slideContent = noSlidesLabel;
    } else {
      slideContent = renderables.map(prop => {
              ++key;
              return <PropertyOwner  autoExpand={false}
                              key={key}
                              uri={prop}
                              expansionIdentifier={"P:"+prop} />
      })
    }

    const fileInput = <div className="input-button">
                <MaterialIcon 
                  icon="attach_file" 
                  onClick={this.chooseFile}
                />
                <input 
                  type="file" 
                  id="local-file"
                  onChange={evt => this.updateSlideURLForFile(evt)} 
                />
              </div>;

    return (
      <Popover
        className={Picker.Popover}
        title="ScreenSpace Renderables"
        closeCallback={this.togglePopover}
        detachable
        attached={true}
      >        
        <div className={Popover.styles.content}>
          <Row>
            <Input value={this.state.slideName}
                   label={slideNameLabel}
                   placeholder={"Slide name..."}
                   onChange={evt => this.updateSlideName(evt)} />
            <div className="urlbox">
            <Input value={this.state.slideURL}
                   label={slideURLLabel}
                   placeholder={"URL"}
                   onChange={evt => this.updateSlideURL(evt)} />
            </div>
            <div className={Popover.styles.row}>
              <Button onClick={this.addSlide}
                      title="Add slide"
                      style={{width: 90}}
                      disabled={!this.state.slideName || !this.state.slideURL}>
                <MaterialIcon icon="insert_photo" />
                <span style={{marginLeft: 5}}>Add Slide</span>
              </Button>
            </div>
          </Row>
        </div>
        <hr className={Popover.styles.delimiter} />
        <div className={Popover.styles.title}>Slides </div>
        <div className={styles.slideList}>
          <ScrollOverlay>
            {slideContent}
          </ScrollOverlay>
        </div>
      </Popover>
    );
  }

  render() {
    const { popoverVisible } = this.props;
    return (
      <div className={Picker.Wrapper}>
        <Picker onClick={this.togglePopover}>
          <div>
            <MaterialIcon className={styles.photoIcon} icon="insert_photo" />
          </div>
        </Picker>
        { popoverVisible && this.popover }
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  var renderables = state.propertyTree.propertyOwners.ScreenSpace ? state.propertyTree.propertyOwners.ScreenSpace.subowners : [];
  var visible = state.local.popovers.screenSpaceRenderables.visible;
  return {
    popoverVisible: visible,
    screenSpaceRenderables: renderables,
    luaApi: state.luaApi
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setPopoverVisibility: (visible) => {
      dispatch(setPopoverVisibility({
        popover: 'screenSpaceRenderables',
        visible
      }));
      dispatch(onOpenConnection());
    },
    refresh: () => {
      dispatch(onOpenConnection());
    }
  }
}

ScreenSpaceRenderablePanel = connect(mapStateToProps, mapDispatchToProps)(ScreenSpaceRenderablePanel);

export default ScreenSpaceRenderablePanel;