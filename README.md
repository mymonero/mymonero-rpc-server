## mymonero-rpc-server

Implements a subset of the Monero RPC server APIs [1,2] by way of the MyMonero WebSocket API and mymonero-core.

1. [Wallet RPC](https://web.getmonero.org/resources/developer-guides/wallet-rpc.html)
2. [Daemon RPC](https://web.getmonero.org/resources/developer-guides/daemon-rpc.html)

### Setup

* `bin/setup`

### Building Executables

Having run `bin/setup`,

* `bin/build`

### Running Tests

1. First start RPC servers in dev mode: `npm start`

2. Then run tests, e.g. `npm test -- tests/rpc_client__wallet__basic.spec.js`

### Divergences and Related Notes

* Wallet files are [rncryptor](https://github.com/RNCryptor/RNCryptor)-encrypted, serialized JSON, saved to `./{req.filename}.json`

### Methods implemented

#### Wallet RPC

From [Wallet RPC](https://web.getmonero.org/resources/developer-guides/wallet-rpc.html)

* `create_wallet`


#### Daemon RPC

*Coming soon*