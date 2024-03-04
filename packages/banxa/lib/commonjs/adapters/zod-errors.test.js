"use strict";

var _zodErrors = require("./zod-errors");
var _errors = require("./errors");
var _zod = require("zod");
describe('handleZodErrors', () => {
  const testSchema = _zod.z.object({
    name: _zod.z.string(),
    age: _zod.z.number()
  });
  test('should convert a ZodError into a ValidationError', () => {
    const invalidData = {
      name: 123,
      age: 'John Doe'
    };
    try {
      testSchema.parse(invalidData);
    } catch (error) {
      expect(error).toBeInstanceOf(_zod.z.ZodError);

      // Handle the error
      let handledError;
      try {
        (0, _zodErrors.handleZodErrors)(error);
      } catch (e) {
        var _handledError;
        handledError = e;
        expect(handledError).toBeInstanceOf(_errors.BanxaValidationError);
        expect((_handledError = handledError) === null || _handledError === void 0 ? void 0 : _handledError.message).toBe('Invalid data: name: Expected string, received number, age: Expected number, received string');
      }
    }
  });
  test('should re-throw an error that is not a ZodError', () => {
    const someOtherError = new Error('Some other error');
    let handledError;
    try {
      (0, _zodErrors.handleZodErrors)(someOtherError);
    } catch (e) {
      handledError = e;
    }
    expect(handledError).toBeInstanceOf(_errors.BanxaUnknownError);
  });
});
//# sourceMappingURL=zod-errors.test.js.map