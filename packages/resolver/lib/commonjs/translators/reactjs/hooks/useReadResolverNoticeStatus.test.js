"use strict";

var _reactHooks = require("@testing-library/react-hooks");
var _reactQuery = require("react-query");
var _useReadResolverNoticeStatus = require("./useReadResolverNoticeStatus");
var _ResolverProvider = require("../provider/ResolverProvider");
jest.mock('react-query', () => ({
  useQuery: jest.fn(),
  useQueryClient: jest.fn()
}));
jest.mock('../provider/ResolverProvider', () => ({
  useResolver: jest.fn()
}));
describe('useReadResolverNoticeStatus', () => {
  it('initializes and calls necessary functions', () => {
    const readResolverNoticeStatusMock = jest.fn();
    // @ts-ignore
    _ResolverProvider.useResolver.mockImplementation(() => ({
      readResolverNoticeStatus: readResolverNoticeStatusMock
    }));
    const invalidateQueriesMock = jest.fn();
    // @ts-ignore
    _reactQuery.useQueryClient.mockImplementation(() => ({
      invalidateQueries: invalidateQueriesMock
    }));
    (0, _reactHooks.renderHook)(() => (0, _useReadResolverNoticeStatus.useReadResolverNoticeStatus)());
    expect(_ResolverProvider.useResolver).toHaveBeenCalled();
    expect(_reactQuery.useQueryClient).toHaveBeenCalled();
    expect(_reactQuery.useQuery).toHaveBeenCalledWith({
      queryKey: ['resolver'],
      queryFn: readResolverNoticeStatusMock,
      onSuccess: expect.any(Function)
    });
  });
  it('calls invalidateQueries on success', () => {
    const invalidateQueriesMock = jest.fn();
    // @ts-ignore
    _reactQuery.useQueryClient.mockImplementation(() => ({
      invalidateQueries: invalidateQueriesMock
    }));

    // @ts-ignore
    _reactQuery.useQuery.mockImplementation(_ref => {
      let {
        onSuccess
      } = _ref;
      onSuccess();
      return {
        data: 'mockData'
      };
    });
    const {
      result
    } = (0, _reactHooks.renderHook)(() => (0, _useReadResolverNoticeStatus.useReadResolverNoticeStatus)());
    expect(invalidateQueriesMock).toHaveBeenCalledWith(['resolver']);
    expect(result.current.readResolverNoticeStatus).toEqual('mockData');
  });
});
//# sourceMappingURL=useReadResolverNoticeStatus.test.js.map