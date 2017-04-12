throw new ReferenceError(
  'Please use explicit entry point to import service-mocker, ' +
  'like `import { createClient } from "service-mocker/client"` or ' +
  '`import { createServer } from "service-mocker/server"`'
);
