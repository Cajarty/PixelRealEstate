import React, { Component } from 'react'
import { Link } from 'react-router'
import { HiddenOnlyAuth, VisibleOnlyAuth } from './util/wrappers.js'
import Alerts from './layouts/Alerts';
import Axios from './network/Axios.jsx';

Axios.getInstance();

import './css/index.scss';

class App extends Component {
  render() {
    return (
      <div>
        {this.props.children}
        <Alerts/>
      </div>
    );
  }
}

export default App
