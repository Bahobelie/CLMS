
import { createStore } from 'redux';
import rootReducer from '../contexts';

const Store=createStore(rootReducer);

export default Store;
