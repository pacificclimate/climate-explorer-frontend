import React, { Component } from 'react';
import { Grid, Row } from 'react-bootstrap';
import { FullWidthCol, HalfWidthCol } from '../../layout/rb-derived-components';

class Account extends Component {

  constructor(props) {
    super(props);
    this.state = {
      name: "",
      email: "",
    };
    this.props.keycloak.loadUserInfo().then(userInfo => {
        this.setState({name: userInfo.name, email: userInfo.email})
    });
  }

  logout() {
    // cannot sort out how to make the history reset work
    // this.context.history.push('/');
    this.props.keycloak.logout();
  }

  render() {
    return (
      <div>
        <h1>Account Details</h1>
          <p><b>Name:</b> {this.state.name}</p>
          <p><b>Email:</b> {this.state.email}</p>
          <button onClick={ () => this.logout() }>
            Logout
          </button>
      </div>
    );
  }
}
export default Account;
