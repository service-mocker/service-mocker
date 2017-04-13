const ACTION = {
  ESTABLISHED: 'established',
  REQUEST_CLAIM: 'request_claim',
};

Object.keys(ACTION).forEach(prop => {
  ACTION[prop] = '@mocker/' + ACTION[prop];
});

export { ACTION };
