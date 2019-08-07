import request from 'xhr-request-promise';

// TODO properly type this module

const genPayload = ((): Function => {
  let nextId = 0;
  return (method: string, params: any): any => ({
    jsonrpc: '2.0',
    id: ++nextId,
    method: method,
    params: params,
  });
})();

const send = (url: string): any => (method: string, params: unknown): any => {
  return request(url, {
    method: 'POST',
    contentType: 'application/json-rpc',
    body: JSON.stringify(genPayload(method, params)),
  })
    .then((answer: any): any => {
      var resp = JSON.parse(answer); // todo: use njsp?
      if (resp.error) {
        throw new Error(resp.error.message);
      } else {
        return resp.result;
      }
    })
    .catch((e: any) => {
      return { error: e.toString() };
    });
};

export { send };
