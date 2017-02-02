# [Next](https://github.com/service-mocker/service-mocker/compare/v1.0.3...develop)

### Bug Fixes

- **router**: matching `baseURL` from the begining of `request.url`. ([#19])

# [1.0.3](https://github.com/service-mocker/service-mocker/compare/v1.0.2...v1.0.3) (2017-01-28)

### Bug Fixes

- **client/modern**: force worker registration to use `scope: location.pathname` to ensure current page is under controlling. ([#18](https://github.com/service-mocker/service-mocker/pull/18))

# [1.0.2](https://github.com/service-mocker/service-mocker/compare/v1.0.1...v1.0.2) (2017-01-27)

### Bug Fixes

- **router**: intercept all requests in spite of the potential non-mockers, fix [#14](https://github.com/service-mocker/service-mocker/issues/14) ([#17](https://github.com/service-mocker/service-mocker/pull/17))

### Non-breaking changes

- **server**: remove `clientManager` module ([0fbcc3d](https://github.com/service-mocker/service-mocker/commit/0fbcc3d7b5a6be40053610e62bc2a5d26dbc8399))

# 1.0.1 (2017-01-19)

First Release.
