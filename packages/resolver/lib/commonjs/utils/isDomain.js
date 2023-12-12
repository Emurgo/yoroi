"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isHandle = exports.isDomain = void 0;
const isDomain = receiver => {
  return /.+\..+/.test(receiver) || isHandle(receiver);
};
exports.isDomain = isDomain;
const isHandle = receiver => receiver.startsWith('$');
exports.isHandle = isHandle;
//# sourceMappingURL=isDomain.js.map