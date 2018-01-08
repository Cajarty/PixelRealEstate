import React, { Component } from 'react'
import { Link } from 'react-router'
import { HiddenOnlyAuth, VisibleOnlyAuth } from './util/wrappers.js'
import Alerts from './layouts/Alerts';

// // Styles
// import './css/oswald.css'
// import './css/open-sans.css'
// import './css/pure-min.css'
import './App.css'

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
