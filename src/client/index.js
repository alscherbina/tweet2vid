import React from 'react';
import ReactDOM from 'react-dom';
import 'bulma/css/bulma.min.css';
import '@babel/polyfill';
import App from './App';

const contentNode = document.getElementById('contents');

const app = <App />;

ReactDOM.render(app, contentNode);
