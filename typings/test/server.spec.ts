import { createServer } from '../server';

const server = createServer();

console.log(server.isLegacy);

const { router } = server;

console.log(router.baseURL);

router.all('/', (req, res) => {
  ////// Request //////
  console.log(req.baseURL);
  console.log(req.path);
  console.log(req.url);
  console.log(req.headers);
  console.log(req.method);
  console.log(req.params);
  console.log(req.query);
  console.log(req.clone().baseURL);

  // native methods
  req.arrayBuffer();
  req.blob();
  req.json();
  req.text();

  ////// Response //////
  console.log(res.headers);

  res.type('txt')
    .status(200)
    .end();

  res.end();
  res.json({});
  res.send({});
  res.sendStatus(200);

  res.forward(req);
  res.forward(new Request('/'), { method: 'POST' });
});

router.get('/', {});
router.post('/', {});
router.put('/', {});
router.delete('/', {});
router.head('/', {});
router.options('/', {});

console.log(router.scope('/api').baseURL);

router.route('/api')
  .all({})
  .get({})
  .post({})
  .put({})
  .delete({})
  .head({})
  .options({});
