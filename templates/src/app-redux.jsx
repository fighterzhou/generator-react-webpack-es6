/**
 * Created by Amg on 2017/2/20.
 */

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import './css/main.css'

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSuccessRequest: true,
    }
  }

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    appState: PropTypes.object,
  };

  onClickSyncAction = () => {
    this.props.dispatch(syncAction(`You clicked syncAction button! ${Math.random()}`));
  };

  onClickAsyncAction = () => {
    this.props.dispatch(
      asyncAction(`The request is ${this.state.isSuccessRequest ? "success" : "failed"}`)
    );
  };

  onChangeStatus = () => {
    this.setState({ isSuccessRequest: !state.isSuccessRequest });
  };

  render() {
    const { appState:{ data } } = this.props;

    return (
      <div>
        <div>{data}</div>
        <button onClick={this.onClickSyncAction}>
          click syncAction!
        </button>
        <div>
          {`The request will ${this.state.isSuccessRequest ? "success" : "fail"}!`}
        </div>
        <button onClick={this.onClickAsyncAction}>
          click asyncAction
        </button>
        <button onClick={this.onChangeStatus}>
          change request status
        </button>
      </div>
    );
  }
}

function mapStateProps(state) {
  return {
    appState: state.appState,
  }
}

export default connect(mapStateProps)(App);
