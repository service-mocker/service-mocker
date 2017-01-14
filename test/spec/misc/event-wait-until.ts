import { eventWaitUntil } from 'service-mocker/lib/utils';

export default function() {
  describe('eventWaitUntil', () => {
    it('should be resolved', () => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', ('/'), true);
      xhr.send();

      return eventWaitUntil(xhr, 'readystatechange', () => xhr.readyState === xhr.DONE);
    });
  });
}
