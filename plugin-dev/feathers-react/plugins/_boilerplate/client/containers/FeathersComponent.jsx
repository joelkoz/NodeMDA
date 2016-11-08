
import React from 'react';
import feathersApp from '../fapp';

/**
 * FeathersComponent is a Feathers aware React component that acts as a base class 
 * for components that are part of a React fronted Feathers application. Use of this
 * class assumes that the component will be a child component of a FeathersApp component
 * (or one of its decendants).
 */
class FeathersComponent extends React.Component {

  constructor(props) {
    super(props);
    this.logout = this.logout.bind(this);
  }


  /**
   * Returns the instance of the FeatersApp component that is current active in the application.
   */
  get appComponent() {
    // HACK ALERT - this value is passed in from the App.render() method, which is the only
    // way to get properties set from a top level component using React Router.
    return this.props.__appComponent || this.props.appComponent || this.context.appComponent;
  }


  getChildContext() {
    return { appComponent: this.appComponent };
  }


  /**
   * Returns the Feathers application object. 
   */
  get fapp() {
    return feathersApp;
  }



  /**
   * Returns the Feathers authenticated user (if there is one). Note that not all
   * Feathers apps even HAVE a concept of an authenticated user, so this may return
   * null or undefined.
   */
  get user() {
    return this.fapp.get('user');
  }


  /**
   * Returns TRUE if the application currently has an authenticated user attached
   * to the system.
   */
  get isAuthenticated() {
    return Boolean(this.user);
  }


  /**
   * Returns a reference to the "API facade" object that represents all of the
   * services available on the application server.
   */
  get api() {
     return this.fapp.api;
  }


  /**
   * Call logout() whenever you want to have the user logged out of the system. This
   * method returns a promise, which will allow you to handle the logout asyncrhonously.
   */
  logout() {
    return this.appComponent.logout();
  }


  /**
   * Sends the user to the specified path within this application.
   */
  navigateTo(path) {
    this.props.history.push(path);
  }


  /**
   * Returns a function that will navigate to the specified path for use
   * as an element onClick handler.
   */
  getNavigateHandler(path) {
    let finalPath = path;
    let self = this;
    return function() {
        self.props.history.push(finalPath);
    }
  }

}

FeathersComponent.childContextTypes = {
   appComponent: React.PropTypes.object
}

export default FeathersComponent;
