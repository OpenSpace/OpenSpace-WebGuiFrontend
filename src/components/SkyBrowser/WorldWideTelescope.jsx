import React, { Component } from 'react';
import Window from '../common/Window/Window';
import Picker from '../BottomBar/Picker';
import FloatingWindow from './WindowThreeStates/FloatingWindow'
import styles from './WorldWideTelescope.scss'

class WorldWideTelescope extends Component {
  constructor(props) {
    super(props);
    this.iframe = React.createRef();
    this.state = {
      isDragging: false,
      startDragPosition: [0,0]
    };
    this.sendMessageToWwt = this.sendMessageToWwt.bind(this);
    this.setAim = this.setAim.bind(this);
    this.mouseDown = this.mouseDown.bind(this);
    this.mouseUp = this.mouseUp.bind(this);
    this.handleDrag = this.handleDrag.bind(this);
    this.handleCallbackMessage = this.handleCallbackMessage.bind(this);
    this.addAllSelectedImages = this.addAllSelectedImages.bind(this);
    this.scroll = this.scroll.bind(this);
    this.createTopBar = this.createTopBar.bind(this);
  }

  componentDidMount() {
    window.addEventListener("message", this.handleCallbackMessage);
  }

  componentWillUnmount() {
    window.removeEventListener("message", this.handleCallbackMessage);
  }

  handleCallbackMessage(event) {
    console.log("React " + event.data);
    if(event.data == "wwt_has_loaded") {
      this.sendMessageToWwt({
       event : "modify_settings",
       settings : [["hideAllChrome", true]],
       target: "app"
     })
      this.sendMessageToWwt({
        event: "load_image_collection",
        url:"https://raw.githubusercontent.com/WorldWideTelescope/wwt-web-client/master/assets/webclient-explore-root.wtml",
        loadChildFolders: true
      });
      this.sendMessageToWwt({
        event: "set_background_color",
        data: this.props.target.color}
      );
    }
    if(event.data == "load_image_collection_completed") {
      this.props.setImageCollectionIsLoaded(true);
      this.addAllSelectedImages();
    }
  }

  addAllSelectedImages() {
    this.props.selectedImages.reverse().map(image => (
      this.props.selectImage(image.identifier)
    ));
  }

  sendMessageToWwt(message) {
    try {
      var frame = this.iframe.current.contentWindow;
      frame.postMessage(message, "*");
    } catch (error) {
      console.log("Trying to connect to AAS World Wide Telescope: " + error);
    }
  }

  setAim(ra, dec, fov, roll) {
    this.sendMessageToWwt({
      "event" : "center_on_coordinates",
      "ra" : ra,
      "dec" : dec,
      "fov" : fov,
      "roll" : roll,
      "instant" : true }
    );
  }

  handleDrag(mouse) {
    if(this.state.isDragging) {
      const end = [mouse.clientX, mouse.clientY];
      console.log(end + "   " + this.state.startDragPosition);
      this.props.skybrowserApi.finetuneTargetPosition(this.props.target.id, this.state.startDragPosition, end);
    }
  }

  mouseDown(mouse) {
    this.props.skybrowserApi.startFinetuningTarget(this.props.target.id);
    const position = [mouse.clientX, mouse.clientY];
    this.setState({
      isDragging : true,
      startDragPosition: position
    })
  }

  mouseUp(mouse) {
    this.setState({
      isDragging : false
    })
  }

  scroll(e) {
    console.log(e.deltaY);
    this.props.skybrowserApi.scrollOverBrowser(this.props.target.id, -e.deltaY);
  }

  createTopBar() {

    return (
      <header className={`header ${styles.topMenu}`}>
        <div className={styles.title}>{this.props.target.name}</div>
        <div>
        </div>
      </header>
    );
  }

  render() {
    const target = this.props.target;
    const iframe =
    <iframe
      id="webpage"
      name = "wwt"
      ref={this.iframe}
      src="http://localhost:8000"
      allow="accelerometer; clipboard-write; gyroscope"
      allowFullScreen
      frameBorder="0"
      align="middle"
      className={styles.wwt}
      >
        <p>ERROR: cannot display AAS WorldWide Telescope research app!</p>
      </iframe>;

    const button = <button
      className={styles.container}
      onMouseMove={this.handleDrag}
      onMouseDown={this.mouseDown}
      onMouseUp={this.mouseUp}
      onMouseLeave={this.mouseUp}
      onWheel = {(e) => this.scroll(e)} />

    if(target) {
      this.setAim(target.ra, target.dec, target.FOV, target.roll);
    }

    return <FloatingWindow
      className={`${Picker.Popover}`}
      title={target.name}
      closeCallback={this.togglePopover}
      size={{ height: `400px`, width: `400px` }}
      position={{ x: -600, y: -400 }}
    >
    {this.createTopBar()}
    <div className={styles.content}>
    {button}
    {iframe}
    </div>
    </FloatingWindow>;
  }
}
export default WorldWideTelescope;
