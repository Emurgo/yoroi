module.exports = {
  MMKV: function () {
    return {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    }
  },
}
