
import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import { Router, browserHistory } from 'react-router';
import routerConfig from './menuConfig';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import AppTheme from './styles/app-theme';
import fapp from './fapp';

if (module.hot) {
  module.hot.accept();
}

injectTapEventPlugin();

// Make an initial attempt to pre-authenticate
// the user with pre-existing credentials...
fapp.authenticate()
.then(resp => console.log('User is preauthenticated'))
.catch(error => console.log('User is not preauthenticated'))
.then(() => {
	// Start the main app...
	console.log('Starting app...');
	ReactDOM.render(
		<MuiThemeProvider muiTheme={getMuiTheme(AppTheme)}>
		     <Router history={browserHistory} routes={routerConfig} />
		</MuiThemeProvider>, 
		document.getElementById('app')
	);
});
