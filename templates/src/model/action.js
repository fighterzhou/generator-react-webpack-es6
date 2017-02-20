import * as ActionTypes from './action-types';
import AsyncApi from '../server/api/async-api';

export function requestAsyncAction() {
  return {
    type: ActionTypes.REQUEST_ASYNC_ACTION,
  }
}
export function successAsyncAction(data) {
  return {
    type: ActionTypes.SUCCESS_ASYNC_ACTION,
    data,
  }
}
export function failAsyncAction() {
  return {
    type: ActionTypes.FAIL_ASYNC_ACTION,
  }
}

export function syncAction(data) {
  return {
    type: ActionTypes.SYNC_ACTION,
    data,
  }
}
export function asyncAction(data) {
  return function wrap(dispatch) {
    dispatch(requestAsyncAction());
    return AsyncApi.asyncAction(data)
      .then(data => dispatch(successAsyncAction(data)))
      .catch(() => dispatch(failAsyncAction()));
  }
}

