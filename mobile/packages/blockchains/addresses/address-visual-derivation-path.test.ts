import {addressVisualDerivationPathMaker} from './address-visual-derivation-path'

test('addressVisualDerivationPathMaker', () => {
  expect(
    addressVisualDerivationPathMaker('cardano-bip44')({
      account: 42,
      role: 1,
      index: 47,
    }),
  ).toBe("m/44'/1815'/42'/1/47")

  expect(
    addressVisualDerivationPathMaker('cardano-cip1852')({
      account: 42,
      role: 1,
      index: 47,
    }),
  ).toBe("m/1852'/1815'/42'/1/47")
})
