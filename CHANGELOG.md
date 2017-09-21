# [2.1.0](https://github.com/service-mocker/service-mocker/compare/v2.0.1...v2.1.0) (2017-09-21)

### Features

- **server**: support middleware. (#40)

# [2.0.1](https://github.com/service-mocker/service-mocker/compare/v2.0.0...v2.0.1) (2017-08-05)

### Bug Fixes

- **server/request**: avoid decoding empty parameters. ([#38](https://github.com/service-mocker/service-mocker/pull/38))

# [2.0.0](https://github.com/service-mocker/service-mocker/compare/v1.1.1...v2.0.0) (2017-04-09)

### Bug Fixes

- **client**: fix occasionally hanging in Chrome. ([#32](https://github.com/service-mocker/service-mocker/pull/32))

### Breaking Changes

Switch to Babel + es2017. TypeScript based sources are now maintenanced in [1.x](https://github.com/service-mocker/service-mocker/tree/1.x) branch.

# [1.1.1](https://github.com/service-mocker/service-mocker/compare/v1.1.0...v1.1.1) (2017-04-09)

### Features

- Add TypeScript compatibility check. ([#28](https://github.com/service-mocker/service-mocker/pull/28))

# [1.1.0](https://github.com/service-mocker/service-mocker/compare/v1.0.4...v1.1.0) (2017-02-15)

### Bug Fixes

- **router**: support chainable base URLs. ([#23](https://github.com/service-mocker/service-mocker/pull/23))

### Features

- **router**: add `router.scope()` method for route prefixes.

### Minor Changes

- **router**: deprecate `router.base()` method.


# [1.0.4](https://github.com/service-mocker/service-mocker/compare/v1.0.3...v1.0.4) (2017-02-11)

### Bug Fixes

- **router**: matching `baseURL` from the begining of `request.url`. ([#19](https://github.com/service-mocker/service-mocker/pull/19))
- **client**: fix HTTPS protocol comparison. ([aad0418](https://github.com/service-mocker/service-mocker/commit/aad0418f649e89f0ee182cbdf7e0ac422f99ee48))

# [1.0.3](https://github.com/service-mocker/service-mocker/compare/v1.0.2...v1.0.3) (2017-01-28)

### Bug Fixes

- **client/modern**: force worker registration to use `scope: location.pathname` to ensure current page is under controlling. ([#18](https://github.com/service-mocker/service-mocker/pull/18))

# [1.0.2](https://github.com/service-mocker/service-mocker/compare/v1.0.1...v1.0.2) (2017-01-27)

### Bug Fixes

- **router**: intercept all requests in spite of the potential non-mockers, fix [#14](https://github.com/service-mocker/service-mocker/issues/14) ([#17](https://github.com/service-mocker/service-mocker/pull/17))

### Minor Changes

- **server**: remove `clientManager` module ([0fbcc3d](https://github.com/service-mocker/service-mocker/commit/0fbcc3d7b5a6be40053610e62bc2a5d26dbc8399))

# 1.0.1 (2017-01-19)

First Release.
