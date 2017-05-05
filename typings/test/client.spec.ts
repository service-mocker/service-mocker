import { createClient } from '../client';

const modernClient = createClient('/');
const legacyClient = createClient('/', {
  forceLegacy: true,
});

function callback(reg: ServiceWorkerRegistration | null) {
  if (reg) {
    console.log(reg.active);
    console.log(reg.waiting);
    console.log(reg.installing);
  }
}

console.log(modernClient.isLegacy);
console.log(legacyClient.isLegacy);

if (modernClient.controller) {
  console.log(modernClient.controller.state);
  console.log(modernClient.controller.scriptURL);
}

modernClient.ready.then(callback);
legacyClient.ready.then(callback);

modernClient.getRegistration().then(callback);
legacyClient.getRegistration().then(callback);

modernClient.update().then(callback);
legacyClient.update().then(callback);

modernClient.unregister().then((result) => {
  console.log(result === true);
});

legacyClient.unregister().then((result) => {
  console.log(result === false);
});
