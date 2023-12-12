"use strict";

var _zod = require("zod");
var _zodErrors = require("./zod-errors");
describe('handleZodErrors', () => {
  it('formats ZodError correctly', () => {
    const mockIssues = [{
      // @ts-ignore
      code: 'some_error_code',
      path: ['field1'],
      message: 'Invalid field1'
    }, {
      // @ts-ignore
      code: 'another_error_code',
      path: ['nested', 'field2'],
      message: 'Invalid field2'
    }];
    const mockZodError = new _zod.ZodError(mockIssues);
    const result = (0, _zodErrors.handleZodErrors)(mockZodError);
    expect(result).toBe('Invalid data: field1: Invalid field1, nested.field2: Invalid field2');
  });
  it('returns null for non-Zod errors', () => {
    const nonZodError = new Error('Regular error');
    const result = (0, _zodErrors.handleZodErrors)(nonZodError);
    expect(result).toBeNull();
  });
});
//# sourceMappingURL=zod-errors.test.js.map