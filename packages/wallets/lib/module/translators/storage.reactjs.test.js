import React from 'react';
import renderer from 'react-test-renderer';
import { StorageProvider, useStorage } from './storage.reactjs'; // Update with the actual module path
import { rootStorage } from '../storage';
describe('StorageProvider and useStorage Tests', () => {
  test('StorageProvider provides storage context', () => {
    const TestComponent = () => {
      const storage = useStorage();
      return /*#__PURE__*/React.createElement("div", null, storage ? 'Storage Available' : 'Storage Unavailable');
    };
    const tree = renderer.create( /*#__PURE__*/React.createElement(StorageProvider, {
      storage: rootStorage
    }, /*#__PURE__*/React.createElement(TestComponent, null)));
    const treeInstance = tree.root;
    const textElement = treeInstance.findByType('div');
    expect(textElement.props.children).toBe('Storage Available');
  });
  test('StorageProvider provides the default rootStorage context', () => {
    const TestComponent = () => {
      const storage = useStorage();
      return /*#__PURE__*/React.createElement("div", null, storage ? 'Storage Available' : 'Storage Unavailable');
    };
    const tree = renderer.create( /*#__PURE__*/React.createElement(StorageProvider, null, /*#__PURE__*/React.createElement(TestComponent, null)));
    const treeInstance = tree.root;
    const textElement = treeInstance.findByType('div');
    expect(textElement.props.children).toBe('Storage Available');
  });
  test('useStorage throws error without StorageProvider', () => {
    const InvalidComponent = () => {
      useStorage();
      return /*#__PURE__*/React.createElement("div", null, "Invalid Component");
    };

    // Suppress console error caused by the 'invalid' function
    const originalError = console.error;
    console.error = jest.fn();
    expect(() => renderer.create( /*#__PURE__*/React.createElement(InvalidComponent, null))).toThrow('Missing StorageProvider');
    console.error = originalError;
  });
});
//# sourceMappingURL=storage.reactjs.test.js.map