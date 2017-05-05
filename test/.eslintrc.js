module.exports = {
  env: {
    mocha: true,
  },
  globals: {
    // Set each global variable name equal to true to
    // allow the variable to be overwritten or false to
    // disallow overwriting
    // <http://eslint.org/docs/user-guide/configuring#specifying-globals>
    Mocha: false
  },
  rules: {
    // We will see lots of unused-expressions when using chai
    // like: expect(err).not.to.be.null
    'no-unused-expressions': 0,
  }
}
