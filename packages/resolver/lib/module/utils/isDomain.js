export const isDomain = receiver => {
  return /.+\..+/.test(receiver) || isHandle(receiver);
};
export const isHandle = receiver => receiver.startsWith('$');
//# sourceMappingURL=isDomain.js.map