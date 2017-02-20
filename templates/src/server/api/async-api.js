import { postJSON } from '../helper';

export default class AsyncApi {
  static asyncAction(obj) {
    return postJSON({ data: obj, name: AsyncApi.asyncAction.name });
  }
}