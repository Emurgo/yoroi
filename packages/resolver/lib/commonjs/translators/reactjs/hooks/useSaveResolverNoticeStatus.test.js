"use strict";

var _reactHooks = require("@testing-library/react-hooks");
var _reactQuery = require("react-query");
var _useSaveResolverNoticeStatus = require("./useSaveResolverNoticeStatus");
var _ResolverProvider = require("../provider/ResolverProvider");
jest.mock('react-query', () => ({
  useMutation: jest.fn(),
  useQueryClient: jest.fn().mockReturnValue({
    invalidateQueries: jest.fn()
  })
}));
jest.mock('../provider/ResolverProvider', () => ({
  useResolver: jest.fn()
}));
describe('useSaveResolverNoticeStatus', () => {
  it('calls useResolver and useQueryClient', () => {
    const saveResolverNoticeStatusMock = jest.fn();
    // @ts-ignore
    _ResolverProvider.useResolver.mockReturnValue({
      saveResolverNoticeStatus: saveResolverNoticeStatusMock
    });
    (0, _reactHooks.renderHook)(() => (0, _useSaveResolverNoticeStatus.useSaveResolverNoticeStatus)());
    expect(_ResolverProvider.useResolver).toHaveBeenCalled();
    expect(_reactQuery.useQueryClient).toHaveBeenCalled();
  });
});
//# sourceMappingURL=useSaveResolverNoticeStatus.test.js.map