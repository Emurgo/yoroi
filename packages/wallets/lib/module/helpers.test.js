import { invalid } from './helpers';
describe('invalid', () => {
  it('should throw an error with the given message', () => {
    expect(() => invalid('This is an invalid function')).toThrowError('This is an invalid function');
  });
});
//# sourceMappingURL=helpers.test.js.map