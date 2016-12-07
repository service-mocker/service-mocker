const ACTION = {
  PING: 'ping',
  PONG: 'pong',
  SUCCESS: 'success',
  FAILED: 'failed',
  SET_STORAGE: 'set_storage',
  GET_STORAGE: 'get_storage',
  CLEAR_STORAGE: 'clear_storage',
  REMOVE_STORAGE: 'remove_storage',
  DISCONNECT: 'disconnect',
  ESTABLISHED: 'established',
  REQUEST_CLAIM: 'request_claim',
};

Object.keys(ACTION).forEach(prop => {
  ACTION[prop] = '@mocker/' + ACTION[prop];
});

export { ACTION };
