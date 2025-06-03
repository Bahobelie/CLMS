import { combineReducers } from 'redux';
import auth from './auth-reducer/auth';

const rootReducer = combineReducers({
  auth
});
export default rootReducer;
