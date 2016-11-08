
import React from 'react';
import FeathersApp from './FeathersApp';

import AppBar from 'material-ui/AppBar';
import MenuItem from 'material-ui/MenuItem';
import Drawer from 'material-ui/Drawer';
import IconButton from 'material-ui/IconButton';
import NavigationMenuIcon from 'material-ui/svg-icons/navigation/menu';

import { getMenuItems } from '../menuConfig';

class App extends FeathersApp {

  constructor(props) {
    super(props);
    this.state = { menuVisible: false, appBarStack: [] };
    this.toggleMenuDisplay = this.toggleMenuDisplay.bind(this);
    this.forceMenuClosed = this.forceMenuClosed.bind(this);
    this.updateAppDimensions = this.updateAppDimensions.bind(this);
  }


  componentWillMount() {
      this.updateAppDimensions();
  }

  componentDidMount() { 
      window.addEventListener("resize", this.updateAppDimensions);
  }

  componentWillUnmount() {
      window.removeEventListener("resize", this.updateAppDimensions);
  }


  updateAppDimensions() {
    const leftRightMarginPadding = 16;
    const topMarginAndBannerHeight = 60;
    
    let w = window,
        d = document,
        documentElement = d.documentElement,
        body = d.getElementsByTagName('body')[0],
        width = w.innerWidth || documentElement.clientWidth || body.clientWidth,
        height = w.innerHeight|| documentElement.clientHeight|| body.clientHeight;
        this.setState({appBodyWidth: width - leftRightMarginPadding, appBodyHeight: height - topMarginAndBannerHeight });
  }



  toggleMenuDisplay() { 
    this.setState({ menuVisible: !this.state.menuVisible }); 
  }
  

  forceMenuClosed() { 
    this.setState({ menuVisible: false }); 
  }


  /**
   * Dynamically create a list of <MenuItem> components to display
   */
  createMenuItems() {

    let self = this;
    let menuItems = getMenuItems();
    let list = [];

    if (this.isAuthenticated) {
        // All features are available to authenticated users...
        list = menuItems.map(
            function(item) {
               return (
                  <MenuItem key={item.keyValue} primaryText={item.name} onClick={ self.getNavigateHandler(item.path) } onTouchTap={self.forceMenuClosed} />
                );
            }
         );

         list.push(
          <MenuItem key={'signout'} primaryText="Sign out" onClick={self.logout} onTouchTap={self.forceMenuClosed} />          
        );
     }
     else {
         // unauthenticated users can only sign in.
         list.push(
          <MenuItem key={'signin'} primaryText="Sign In" onClick={self.getNavigateHandler('/signIn')} onTouchTap={self.forceMenuClosed} />          
        );
     }

     return list;
  }



  pushAppBarInfo(title, style, elementLeft, elementRight) {
      let defaultInfo = this.getAppBarInfo();

      if (!title) {
        title = defaultInfo.title;
      }

      if (!style) {
        style = defaultInfo.style;
      }

      if (typeof(elementLeft) === 'undefined') {
        elementLeft = defaultInfo.elementLeft;
      }

      let appBarStack = [].concat(this.state.appBarStack);
      appBarStack.push({ title, style, elementLeft, elementRight });

      this.setState({ menuVisible: false, appBarStack });
  }


  popAppBarInfo() {
     if (this.state.appBarStack.length > 0) {
        let appBarStack = [].concat(this.state.appBarStack);
        appBarStack.pop();
        this.setState({ menuVisible: false, appBarStack });
     }
  }


  getDefaultAppBarLeft() {
    let self = this;
    return (
       <IconButton onTouchTap={self.toggleMenuDisplay}><NavigationMenuIcon /></IconButton>
    );

  }

  getAppBarInfo() {
    let appBarStackLen = this.state.appBarStack.length;
    if (appBarStackLen === 0) {
        return {
            title: this.fapp.get('appName'),
            style: { fontWeight: 'bold' },
            elementLeft: this.getDefaultAppBarLeft(),
            elementRight: undefined,
        };
    }
    else {
        return this.state.appBarStack[appBarStackLen-1];
    }
  }


  render() {
    let self = this;
    let appBarInfo = this.getAppBarInfo();

    return(
      <div>
          <AppBar
            style={ appBarInfo.style }
            title={ appBarInfo.title }
            showMenuIconButton={ Boolean(appBarInfo.elementLeft )}
            iconElementLeft={  appBarInfo.elementLeft }
            iconElementRight={ appBarInfo.elementRight }
          />

          <Drawer
            docked={false}
            width={200}
            open={self.state.menuVisible}
            onRequestChange={(menuVisible) => self.setState({menuVisible})} >

            { self.createMenuItems() }

          </Drawer>
          <div id="appBody" style={{ margin: '15px', width: this.state.appBodyWidth, height: this.state.appBodyHeight }}>
          { /* This line is critical for FeathersComponent to have access to the application component... */ }
          {self.props.children && React.cloneElement(self.props.children, { __appComponent: self }) }
          </div>
       </div>      
    );

  }

}

export default App;
