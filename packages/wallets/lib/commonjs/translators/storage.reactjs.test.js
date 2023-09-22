"use strict";

var _react = _interopRequireDefault(require("react"));
var _reactTestRenderer = _interopRequireDefault(require("react-test-renderer"));
var _storage = require("./storage.reactjs");
var _storage2 = require("../storage");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
// Update with the actual module path

describe('StorageProvider and useStorage Tests', () => {
  test('StorageProvider provides storage context', () => {
    const TestComponent = () => {
      const storage = (0, _storage.useStorage)();
      return /*#__PURE__*/_react.default.createElement("div", null, storage ? 'Storage Available' : 'Storage Unavailable');
    };
    const tree = _reactTestRenderer.default.create( /*#__PURE__*/_react.default.createElement(_storage.StorageProvider, {
      storage: _storage2.rootStorage
    }, /*#__PURE__*/_react.default.createElement(TestComponent, null)));
    const treeInstance = tree.root;
    const textElement = treeInstance.findByType('div');
    expect(textElement.props.children).toBe('Storage Available');
  });
  test('StorageProvider provides the default rootStorage context', () => {
    const TestComponent = () => {
      const storage = (0, _storage.useStorage)();
      return /*#__PURE__*/_react.default.createElement("div", null, storage ? 'Storage Available' : 'Storage Unavailable');
    };
    const tree = _reactTestRenderer.default.create( /*#__PURE__*/_react.default.createElement(_storage.StorageProvider, null, /*#__PURE__*/_react.default.createElement(TestComponent, null)));
    const treeInstance = tree.root;
    const textElement = treeInstance.findByType('div');
    expect(textElement.props.children).toBe('Storage Available');
  });
  test('useStorage throws error without StorageProvider', () => {
    const InvalidComponent = () => {
      (0, _storage.useStorage)();
      return /*#__PURE__*/_react.default.createElement("div", null, "Invalid Component");
    };

    // Suppress console error caused by the 'invalid' function
    const originalError = console.error;
    console.error = jest.fn();
    expect(() => _reactTestRenderer.default.create( /*#__PURE__*/_react.default.createElement(InvalidComponent, null))).toThrow('Missing StorageProvider');
    console.error = originalError;
  });
});
//# sourceMappingURL=storage.reactjs.test.js.map