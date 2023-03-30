import {WALLET_IMPLEMENTATION_REGISTRY} from '../../types'
import {WALLET_CONFIG as HASKELL_SHELLEY, WALLET_CONFIG_24 as HASKELL_SHELLEY_24} from '../constants/mainnet/constants'
import {formatPath} from './formatPath'

test('Can format address', () => {
  expect(formatPath(42, 'Internal', 47, WALLET_IMPLEMENTATION_REGISTRY.HASKELL_BYRON)).toBe("m/44'/1815'/42'/1/47")
  expect(formatPath(42, 'Internal', 47, HASKELL_SHELLEY.WALLET_IMPLEMENTATION_ID)).toBe("m/1852'/1815'/42'/1/47")
  expect(formatPath(42, 'Internal', 47, HASKELL_SHELLEY_24.WALLET_IMPLEMENTATION_ID)).toBe("m/1852'/1815'/42'/1/47")
})
