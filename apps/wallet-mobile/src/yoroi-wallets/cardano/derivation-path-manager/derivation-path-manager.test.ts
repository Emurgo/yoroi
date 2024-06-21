import {derivationPathManagerMaker} from './derivation-path-manager'

test('derivationPathManagerMaker', () => {
  expect(
    derivationPathManagerMaker('cardano-bip44')({
      account: 42,
      role: 1,
      index: 47,
    }),
  ).toBe("m/44'/1815'/42'/1/47")

  expect(
    derivationPathManagerMaker('cardano-cip1852')({
      account: 42,
      role: 1,
      index: 47,
    }),
  ).toBe("m/1852'/1815'/42'/1/47")
})
