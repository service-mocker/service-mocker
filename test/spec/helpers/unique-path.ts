import * as uuid from 'uuid/v4';

export function uniquePath() {
  return '/' + uuid();
}
