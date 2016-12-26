import 'es6-promise/auto';
import 'whatwg-fetch';

import fetchRunner from './fetch.spec';

describe('==== Modern Client Tests ====', () => {
  fetchRunner();
});
