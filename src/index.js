import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './styles/reset.css';
import "./styles/App.css";
import './styles/scroller.css';
// import reportWebVitals from './reportWebVitals';
// import { eSearchLogic, eSearchFilter } from "./constants";

import { Provider } from 'react-redux'
// import { createStore } from 'redux'
// import reducer from './reducers'
// import { Constants } from "./constants";
// import { configureStore } from '@reduxjs/toolkit';

// import { combineReducers } from "redux";
// import viewReducer from './features/viewSlice';
// import canvasReducer from './features/canvasSlice';
import { store } from './store';


// const initialState = { 
//   view : {
//     // mode:Constants.MODE_USER_OPTIONS,
//     searchFilter:eSearchFilter.PICTURE,
//     searchLogic:eSearchLogic.BEGINS,
//     searchTerm:'',
//     showMenuPopup: false,
//   } 
// };

// const store = createStore(
//   reducer,
//   initialState,
//   window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__() 
// )

// const store = configureStore({
//   reducer: {
//     view: viewReducer,       // RTK slice
//     canvas: canvasReducer          // Classic Redux reducer
//   }
//     // reducer:{...reducer},
// //   initialState,
// });

window.store = store;



ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);



// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
