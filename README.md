## mymonero-rpc-server

Implements a subset of the Monero RPC server APIs by way of the MyMonero WebSocket API and mymonero-core.

### Setup

* `bin/setup`

### Building Executables

Having run `bin/setup`,

* `bin/build`

### Running Tests

1. First start RPC servers in dev mode: `npm start`

2. Then run tests, e.g. `npm test -- tests/rpc_client__wallet__basic.spec.js`