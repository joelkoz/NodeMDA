
import React from 'react';
import FeathersComponent from './FeathersComponent';

class Home extends FeathersComponent {

  constructor() {
    super();

  }


  render() {

    const mainStyle = {
       marginTop: '55px'
    };

    let welcomeMsg;

    if (this.isAuthenticated) {
      welcomeMsg = `Welcome ${ this.user.firstName } to ${ this.fapp.get('appName') }`;
    }
    else {
      welcomeMsg = 'Please sign in';
    }

    return(
      <div className="home-page" style={ mainStyle }>
          { welcomeMsg }
      </div>
    );
  }
}

export default Home;