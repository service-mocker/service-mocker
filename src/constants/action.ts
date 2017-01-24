const ACTION = {
  PING: 'ping',
  PONG: 'pong',
  RECONNECT: 'reconnect',
  DISCONNECT: 'disconnect',
  ESTABLISHED: 'established',
  CLIENT_FOUND: 'client_found',
  REQUEST_CLAIM: 'request_claim',
};

Object.keys(ACTION).forEach(prop => {
  ACTION[prop] = '@mocker/' + ACTION[prop];
});

export { ACTION };
