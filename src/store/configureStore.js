import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import authReducer from '../reducers/auth';
import placesReducer from '../reducers/places';
import mapReducer from '../reducers/map';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default () => {
  const store = createStore(
    combineReducers({
      auth: authReducer,
      places: placesReducer,
      map: mapReducer
    }),
    composeEnhancers(applyMiddleware(thunk))
  );

  return store;
};
