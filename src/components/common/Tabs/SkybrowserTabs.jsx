import React, { Component } from 'react';
import styles from './SkybrowserTabs.scss';
import Button from '../Input/Button/Button';
import MaterialIcon from '../MaterialIcon/MaterialIcon';
import { excludeKeys } from '../../../utils/helpers';
import PropTypes from 'prop-types';
import ScrollOverlay from '../../common/ScrollOverlay/ScrollOverlay';
import CenteredLabel from '../../common/CenteredLabel/CenteredLabel';
import { Resizable } from 're-resizable';
import TooltipSkybrowser from '../../common/Tooltip/TooltipSkybrowser';

class SkybrowserTabs extends Component {
    constructor(props) {
        super(props);
        this.state = {
            height: 185,
            currentHeight: 185,
            showButtonInfo1: false,
            showButtonInfo2: false,
            showButtonInfo3: false,
            showButtonInfo4: false,
        }
        this.createTabs = this.createTabs.bind(this);
        this.onResizeStop = this.onResizeStop.bind(this);
        this.onResize = this.onResize.bind(this);
        this.setRef = this.setRef.bind(this);
        this.showTooltip = this.showTooltip.bind(this);
        this.hideTooltip = this.hideTooltip.bind(this);
        this.handleDeleteTab = this.handleDeleteTab.bind(this);
    }

    get inheritedProps() {
        const doNotInclude = 'closeCallback className position size title';
        return excludeKeys(this.props, doNotInclude);
    }

    get position() {
        if (!this.wrapper) return { top: '0px', left: '0px' };
        const { top, right} = this.wrapper.getBoundingClientRect();
        return { top: `${top}`, left: `${right}`};
    }

    setRef(what) {
        return (element) => {
          this[what] = element;
        };
    }

    showTooltip(buttonNumber) {
        if(buttonNumber == 1) this.setState({showButtonInfo1 : !this.state.showButtonInfo1});
        else if(buttonNumber == 2) this.setState({showButtonInfo2 : !this.state.showButtonInfo2});
        else if(buttonNumber == 3) this.setState({showButtonInfo3 : !this.state.showButtonInfop3});
        else this.setState({showButtonInfo4 : !this.state.showButtonInfo4})

    }

    hideTooltip(buttonNumber) {
        if(buttonNumber == 1) this.setState({showButtonInfo1 : false});
        else if(buttonNumber == 2) this.setState({showButtonInfo2 : false});
        else if(buttonNumber == 3) this.setState({showButtonInfo3 : false});
        else this.setState({showButtonInfo4 : false})
    }

    createTabs() {

        const { showButtonInfo1, showButtonInfo2, showButtonInfo3, showButtonInfo4 } = this.state;
        const { targets, currentTarget, removeBrowser} = this.props;
        const { lockTarget, unlockTarget, createTargetBrowserPair, adjustCameraToTarget, select2dImagesAs3d, centerTarget, selectTab} = this.props.viewComponentProps;

        const allTabs = Object.keys(targets).map((target, index) => {

            let targetColor = 'rgb(' + targets[target].color + ')';
            let targetIsLocked = targets[target].isLocked;

            return(
                <div key={index}
                style={currentTarget === target ? {borderTopRightRadius: "4px", borderTop:  "3px solid " + targetColor}:{}}>
                    <div className={ currentTarget === target ? styles.tabActive : styles.tab } onClick={() => selectTab(target)}>
                        <span className={styles.tabHeader}>
                            <span className={styles.tabTitle}>{ targets[target].name }</span>
                            <Button onClick={() => removeBrowser(target)} className={styles.closeTabButton} transparent small>
                                <MaterialIcon icon="close" className="small"/>
                            </Button>
                        </span>
                            { currentTarget === target &&
                            <span className={styles.tabButtonContainer} ref={this.setRef('wrapper')}>
                                <Button onClick={() => adjustCameraToTarget(target)} onMouseLeave={() => this.hideTooltip(1)}
                                className={styles.tabButton} transparent small>
                                    <MaterialIcon icon="visibility" className={"small"} onMouseEnter={() => this.showTooltip(1)}/>
                                    { showButtonInfo1 && <TooltipSkybrowser
                                        placement="bottom-right"
                                        style={this.position}>
                                        {"Look at target"}
                                        </TooltipSkybrowser>
                                    }
                                </Button>
                                <Button onClick={() => centerTarget(target)} onMouseLeave={() => this.hideTooltip(2)}
                                className={styles.tabButton} transparent small >
                                    <MaterialIcon onMouseEnter={() => this.showTooltip(2)} icon="filter_center_focus" className="small"/>
                                    { showButtonInfo2 && <TooltipSkybrowser
                                        placement="bottom-right"
                                        style={this.position}>
                                        {"Move target to center of view"}
                                        </TooltipSkybrowser>
                                    }
                                </Button>
                                <Button onClick={targetIsLocked ? () => unlockTarget(target) : () => lockTarget(target)}
                                onMouseLeave={() => this.hideTooltip(3)} className={targetIsLocked ? styles.tabButtonActive : styles.tabButton}
                                transparent small>
                                    <MaterialIcon onMouseEnter={() => this.showTooltip(3)} icon="lock" className="small"/>
                                    { showButtonInfo3 && <TooltipSkybrowser
                                        placement="bottom-right"
                                        style={this.position}>
                                        {"Lock aim of target"}
                                        </TooltipSkybrowser>
                                    }
                                </Button>
                                <Button onClick={() => select2dImagesAs3d(target)} onMouseLeave={() => this.hideTooltip(4)}
                                className={styles.tabButton} transparent small>
                                    <MaterialIcon onMouseEnter={() => this.showTooltip(4)} icon="get_app" className="small"/>
                                    { showButtonInfo4 && <TooltipSkybrowser
                                        placement="bottom-right"
                                        style={this.position}>
                                        {"Add images to 3D Browser"}
                                        </TooltipSkybrowser>
                                    }
                                </Button>
                            </span>
                            }
                    </div>
                </div>
            );
        });
        return (
            <div className={styles.navTabs}>
                {allTabs}
                <Button onClick={() => createTargetBrowserPair()} className={styles.addTabButton} transparent>
                    <MaterialIcon icon="add" />
                </Button>
            </div>
        );
    }

    handleDeleteTab(tabToDelete) {
        // Call function handle from WWTPanel that is sent as a prop, to call Lua function removeTargetBrowserPair
    }

    onResizeStop(e, direction, ref, delta) {
        this.setState({
            height: this.state.height + delta.height
        })

    }

    onResize(e, direction, ref, delta) {
        this.setState({
            currentHeight: this.state.height + delta.height
        })
        this.props.viewComponentProps.setCurrentTabHeight(this.state.currentHeight);
    }

    render() {
        const {data, currentPopoverHeight} = this.props;
        var props = this.props;
        const EntryComponent = this.props.viewComponent;
        var noOfSelectedImages = data.length;

        return(
            <section {...this.inheritedProps} className={styles.tabContainer}>
                <Resizable
                enable={{ top: true, bottom: false }}
                handleClasses={{ top: styles.topHandle }}
                size={{ height: this.state.currentHeight }}
                minHeight={130}
                maxHeight={currentPopoverHeight}
                onResizeStop={this.onResizeStop}
                onResize={this.onResize}>
                {this.createTabs()}
                <div className={styles.tabContent} style={{ height: this.state.currentHeight }}>
                    <ScrollOverlay>
                        { data.length === 0 ? (
                        <CenteredLabel>There are no loaded images in this Sky Browser.</CenteredLabel>
                        ) : (
                        <ul>
                            { data.map((entry, index) => (
                                 <div>
                                {(index == 0) ? <span className={styles.arrowButtonEmpty} transparent></span> : 
                                    <Button onClick={() => props.setImageOrder(entry.identifier , index + 1)} className={styles.arrowButton} transparent>
                                    <MaterialIcon icon="keyboard_arrow_left" />
                                    </Button>
                                }
                                <EntryComponent
                                {...entry}
                                {...props.viewComponentProps}
                                key={entry.identifier}
                                onSelect={this.props.onSelect}
                                />
                                {
                                (index == noOfSelectedImages -1) ? <span className={styles.arrowButtonEmpty} transparent></span> : 
                                    <Button onClick={() => props.setImageOrder(entry.identifier, index - 1)} className={styles.arrowButton} transparent>
                                    <MaterialIcon icon="keyboard_arrow_right" />
                                    </Button>
                                  }
                              </div>
                            ))}
                        </ul>
                        )}
                    </ScrollOverlay>
                </div>
            </Resizable>
            </section>
        )

    };

}

SkybrowserTabs.propTypes = {
    children: PropTypes.node,
    data: PropTypes.array.isRequired,
    viewComponent: PropTypes.elementType,
    viewComponentProps: PropTypes.object,

};

SkybrowserTabs.defaultProps = {
    children: '',
    viewComponent: (props) => (<li>{ JSON.stringify(props) }</li>),
    viewComponentProps: {},
};

export default SkybrowserTabs;
