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
      startDragPosition: [0,0],
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
    this.changeSize = this.changeSize.bind(this);
    this.setBorderColor = this.setBorderColor.bind(this);
    this.color = [255, 255, 255];
    this.screenSpaceSize = [0.5, 0.5];
  }

  componentDidMount() {
    window.addEventListener("message", this.handleCallbackMessage);
  }

  componentWillUnmount() {
    window.removeEventListener("message", this.handleCallbackMessage);
  }

  handleCallbackMessage(event) {
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
      this.setBorderColor(this.props.target.color);
    }
    if(event.data == "load_image_collection_completed") {
      this.props.setImageCollectionIsLoaded(true);
      this.addAllSelectedImages();
    }
  }

  setBorderColor(color) {
    this.color = color;
    this.sendMessageToWwt({
      event: "set_background_color",
      data: color}
    );
  }

  addAllSelectedImages() {
    this.props.selectedImages.reverse().map(image => (
      this.props.selectImage(image.identifier, false)
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

  changeSize(widthWwt, heightWwt) {
    const { innerWidth: windowWidth, innerHeight: windowHeight } = window;
    const ratio = widthWwt / heightWwt;
    const scale = heightWwt / windowHeight;
    const newWidth = 2 * scale * ratio;
    const newHeight = 2 * scale;
    const id = this.props.target.id;
    this.props.skybrowserApi.setScreenSpaceSize(id, newWidth, newHeight);
    this.screenSpaceSize = [newWidth, newHeight];
  }

  render() {
    const target = this.props.target;
    if(target.color != this.color) {
      this.setBorderColor(target.color);
    }

    const iframe =
    <iframe
      id="webpage"
      name = "wwt"
      ref={this.iframe}
      src="http://wwt.openspaceproject.com"
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
      position={{ x: -800, y: -600 }}
      setNewHeight={this.changeSize}
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
