"use strict";

var _theme = require("./theme");
describe('banxaIsTheme', () => {
  it('should return true for valid theme', () => {
    const validTheme = ['dark', 'light'];
    validTheme.forEach(theme => {
      expect((0, _theme.banxaIsTheme)(theme)).toBe(true);
    });
  });
  it('should return false for invalid theme', () => {
    const invalidTheme = ['darks', 'lights', 'white', 'black', '', undefined, null, 123];
    invalidTheme.forEach(theme => {
      expect((0, _theme.banxaIsTheme)(theme)).toBe(false);
    });
  });
});
//# sourceMappingURL=theme.test.js.map