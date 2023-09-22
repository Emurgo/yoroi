"use strict";

var _helpers = require("./helpers");
describe('invalid', () => {
  it('should throw an error with the given message', () => {
    expect(() => (0, _helpers.invalid)('This is an invalid function')).toThrowError('This is an invalid function');
  });
});
//# sourceMappingURL=helpers.test.js.map