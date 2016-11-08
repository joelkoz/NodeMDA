
import React from 'react';
import feathersApp from '../fapp';

/**
 * FeathersApp is a Feathers aware React component that acts as a base class 
 * for containers that represent the entire application. It exposes the 
 * Feathers 'app' object via the 'fapp' property, as well as exposing it to 
 * all child components via the React Context.  
 */
class FeathersApp extends React.Component {

  constructor() {
    super();

    this.state = {
      authenticated: false,
    };

    this.onAuthenticated = this.onAuthenticated.bind(this);
    this.onUnauthenticated = this.onUnauthenticated.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
  }

  componentDidMount() {
    this.setState({
      authenticated: Boolean(this.user)
    });    
  }

  getChildContext() {
    return {  feathersApp: feathersApp,
              appComponent: this
           };
  }


  onAuthenticated() {
    this.setState({
      authenticated: true
    });
  }

  onUnauthenticated() {
    this.setState({
      authenticated: false
    });
  }

  /**
   * Attempts to authenticate the user based on any authentication tokens stored in
   * local storage. A promise is returned that will dispatch either onAuthenticated()
   * or onUnauthenticated()
   */
  authenticate() {
    let self = this;

    return this.fapp.authenticate()

    .then((response) => {
          self.onAuthenticated();
          return response;
    })

    .catch(error => {
        if(error.code === 401) {
          self.onUnauthenticated();
        }
        console.error(error);
        return error;
    });
  }


  /**
   * Attempts to log in to the application using the specified credentials. A promise
   * is returned that will either succeed, or throw an error.
   */
  login(email, password) {

    let app = this.fapp;
    let self = this;

    return app.authenticate(
       { type: 'local', email, password }
    )

    .then((result) => {
        self.onAuthenticated();
        return result;
    });

  }



  /**
   * Logs out the current user. This method returns a Promise to log the user out,
   * so this needs to be handled asynchronously.
   */
  logout() {
    let self = this;

    return this.fapp.logout()

    .then(() => {
      self.onUnauthenticated();
    });

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
    return  Boolean(this.user);
  }


  /**
   * Returns a reference to the "API facade" object that represents all of the
   * services available on the application server.
   */
  get api() {
     return this.fapp.api;
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


FeathersApp.childContextTypes = {
    feathersApp: React.PropTypes.object,
    appComponent: React.PropTypes.object,
};


export default FeathersApp;
