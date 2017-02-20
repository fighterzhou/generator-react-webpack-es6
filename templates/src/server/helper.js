/**
 * Created by Amg on 2016/12/26.
 */

import 'fetch-ie8';

function ajax(url, obj, name = 'test') {

  // For easy to identify each ajax in Browser's Network, add interface's name after interface.
  // If needn't, you can use the first one.

  // const postUrl = `${url}`;
  const postUrl = `${url}?${name}`;

  const postData = (typeof obj === 'object') ? JSON.stringify(obj) : obj;

  return fetch(postUrl, {
    method: 'post',
    mode: 'cors',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: `{"params":${postData}}`,
  }).then(res => res.json()).then((rs) => {
    if (DEBUG) {
      // 输出网络记录
      console.groupCollapsed(`[POST] [${name}] `, rs);
      console.log(`%c${postData}`, 'font-style:italic;color:#666');
      console.log(`%c${JSON.stringify(rs, null, '\t')}`, 'color:green');
      console.groupEnd();
    }
    if (rs.status !== 0) {
      // to write your own condition in here...
      console.error(`调用失败! ${JSON.stringify(rs)}`);
      throw new Error(rs.message);
    }
    return rs;
  });
}

const promise = data => new Promise((resolve) => {
  resolve();
}).then(() => {
  if (data.type === 'err') {
    console.error(`调用失败! ${JSON.stringify(data)}`);
    throw new Error(data.message);
  }
  return data;
});

function postJSON({ name, data }) {

  // The switch should open when the project just created
  // to simulate promise, when the simulation switch is opened.( set the switch in config.js)

  if (IS_SIMULATOR_MODE) return promise;

  const url = `${BASE_SERVER}`;
  return ajax(url, data, name);
}

export { postJSON };
