
import React from 'react';
import FeathersComponent from './FeathersComponent';
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import Paper from 'material-ui/Paper';
import _ from 'lodash';

class SignIn extends FeathersComponent {

  constructor() {
    super();

    this.state = {
      showRegistrationForm: false,
      okToContinue: false,
      status: { isProblem: false, msg: null },
    };

    this.checkOkToContinue = this.checkOkToContinue.bind(this);
    this.toggleshowRegistrationForm = this.toggleshowRegistrationForm.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }


  login() {
    let self = this;
    let formData = this.getFormData();

    this.appComponent.login(formData.email, formData.password)

    .then((result) => {
      self.setState({
        status: { isProblem: false, msg: 'You are signed in as ' + this.user.firstName },
      });

      self.navigateTo('/');
    })

    .catch((error) => {
      self.setState({
        status: { isProblem: true, msg: error.message },
      });
      console.error('Error authenticating!', error);
    });
  }


  getFormData() {
    let formData = {};

    if (this.state.showRegistrationForm) {
      formData.firstName = this.refs.firstName.getValue();
      formData.lastName = this.refs.lastName.getValue();
    }

    formData.email = this.refs.email.getValue();
    formData.password = this.refs.password.getValue();

    return formData;
  }


  register() {

    let self = this;
    let { firstName, lastName, email, password } = this.getFormData();

    this.api.AccountService.SignUp(firstName, lastName, email, password)
    .then((result) => {
      self.setState({
        status: { isProblem: false,
                  msg: 'Please check your email to validate your account.'},
        showRegistrationForm: false,
      });
    })
    .catch((error) => {
      self.setState({
        status: { isProblem: true, msg: error.message },
      })
      console.error('Error authenticating!', error);
    });

  }


  onSubmit(event) {
    if (this.state.showRegistrationForm) {
      this.register();
    } else {
      this.login();
    }
  }


  toggleshowRegistrationForm() {
    this.setState({
      showRegistrationForm: !this.state.showRegistrationForm,
    }, () => this.checkOkToContinue());
  }


  checkOkToContinue() {

    let newState = {};

    let formData = this.getFormData();
    let email = formData.email;
    let password = formData.password;

    newState.emailPresent = Boolean(email);
    newState.passwordPresent = Boolean(password);

    newState.okToContinue = newState.emailPresent && newState.passwordPresent;

    if (this.state.showRegistrationForm) {
      // If we are on the registration form, we ALSO need the first name and
      // the passwords must match...
      newState.firstNamePresent = Boolean(formData.firstName);
      let password2 = this.refs.passwordConfirmation.getValue();
      newState.passwordsMatch = (password === password2);
      newState.okToContinue = newState.okToContinue && newState.firstNamePresent && newState.passwordsMatch;
    }
    else {
      newState.passwordsMatch = true;
    }

    if (!_.isMatch(this.state, newState)) {
        this.setState(newState);
    }
  }


  getInputElements() {

    const displayWithNext = { display: 'inline-block', marginRight: '25px', verticalAlign: 'top' };
    const displayOnOwnLine = { display: 'block' };
    const msgBox = { width: '100%', display: 'block '};
    const infoMsgBox = Object.assign({ color: 'black'}, msgBox);
    const errorMsgBox = Object.assign({ color: 'red'}, msgBox);

    let fe = [];

    if (this.state.status.msg) {fe.push(
        <Paper key={1} 
            style={ this.state.status.isProblem ? errorMsgBox : infoMsgBox } 
            zDepth={1} >
            {this.state.status.msg}
        </Paper>
    );}


    if (this.state.showRegistrationForm) {fe.push(

            <TextField key={2}
                style={ displayWithNext } 
                ref="firstName" 
                floatingLabelText="First name" 
                type="text" 
                onChange={ this.checkOkToContinue } 
                errorText={ this.state.firstNamePresent ? false : "First name is required."}/>, 

            <TextField key={3}
                ref="lastName" 
                style={ { verticalAlign: 'top'} }
                floatingLabelText="Last name" 
                type="text" /> 
    );}

    fe.push(
        <TextField key={4}
            style={ displayOnOwnLine } 
            ref="email" 
            floatingLabelText="email" 
            type="email" 
            onChange={ this.checkOkToContinue } 
            errorText={ this.state.emailPresent ? false : "email is required" }/>,

        <TextField key={5}
            style={ displayWithNext } 
            ref="password" 
            floatingLabelText="Password" 
            type="password" 
            onChange={ this.checkOkToContinue } 
            errorText={ this.state.passwordPresent ? false : "Password is required" } />,
    );


    if (this.state.showRegistrationForm) {fe.push(
        <TextField key={6}
            ref="passwordConfirmation" 
            floatingLabelText="Repeat password" 
            style={ { verticalAlign: 'top'} }
            type="password" 
            onChange={ this.checkOkToContinue } 
            errorText={ this.state.passwordsMatch ? false : "Passwords don't match" }/> 
    );}

    return fe;
  }



  render() {

    const displayWithNext = { display: 'inline-block', marginRight: '25px' };

    const actions = [
      <RaisedButton
        label={ this.state.showRegistrationForm ? "Sign in" : "Register" }
        style={ displayWithNext }
        primary={false}
        keyboardFocused={false}
        onTouchTap={this.toggleshowRegistrationForm}
      />,
      <RaisedButton
        label={ this.state.showRegistrationForm ? "Create account" : "Sign in" }
        primary={true}
        keyboardFocused={true}
        disabled={ !this.state.okToContinue }
        onTouchTap={this.onSubmit}
      />,
    ];

    return (
      <Dialog
        title={"Sign in"}
        actions={actions}
        modal={false}
        open={true}
        onRequestClose={this.onSubmit}>
        { this.getInputElements() }
      </Dialog>
    );
  }
}


export default SignIn;
