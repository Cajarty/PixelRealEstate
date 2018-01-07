import React, { Component } from 'react';
import {VisitPage} from '../../functions/functions.jsx';
import * as Routes from '../../const/routes.jsx';

class Home extends Component {


  render() {
    return (
      <div className='page tiled'>
        <div className='title'>PixelRealEstate</div>
        <button onClick={() => VisitPage(Routes.CANVAS)}>View The Land</button>
      </div>
    )
  }
}

export default Home