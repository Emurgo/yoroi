jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: jest.fn((obj) => obj.ios),
}));

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.Platform = {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios),
  };
  return RN;
});
