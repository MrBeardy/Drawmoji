// Utils
import _ from 'lodash';
import LZString from 'lz-string';

// React
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';

// App
import Layout from './containers/Layout.jsx'
import Workspace from './containers/Workspace.jsx'

// ----

console.clear();

let mountNode = document.getElementById('app-container');

ReactDOM.render(
  <Router history={ hashHistory }>
    <Route path="/" component={Layout}>
      <IndexRoute component={Workspace} />
    </Route>
  </Router>, mountNode
);
