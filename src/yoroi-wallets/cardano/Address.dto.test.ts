import {AddressDTOCardano} from './Address.dto'

const WALLET_1_PATH_0 =
  'addr1q' +
  '8nwu2tufggrar998mg5yutzfz5v' +
  'unpk2sx9xx0kcyew9nqw86pdygc' +
  '6zarl2kks6fvg8um447uvv679sf' +
  'dtzkwf2kuqn4sf3e'

const WALLET_1_PATH_1 =
  'addr1q' +
  '9ndnrwz52yeex4j04kggp0ul5632' +
  'qmxqx22ugtukkytjysw86pdygc6z' +
  'arl2kks6fvg8um447uvv679sfdtz' +
  'kwf2kuq673wke'

const KEY_HASHES_W1P1 = {
  spending: '66d98dc2a2899c9ab27d6c8405fcfd351503660194ae217cb588b912',
  staking: '0e3e82d2231a1747f55ad0d25883f375afb8c66bc5825ab159c955b8',
}

describe('AddressDTOCardano class', () => {
  it('should create an instance of AddressDTOCardano', async () => {
    const w1p0 = new AddressDTOCardano(WALLET_1_PATH_0)
    await expect(w1p0).toBeInstanceOf(AddressDTOCardano)
  })
  describe('.getKeyHashes()', () => {
    it('should return the KeyHashes object', async () => {
      const w1p1 = new AddressDTOCardano(WALLET_1_PATH_1)
      await expect(await w1p1.getKeyHashes()).toEqual(KEY_HASHES_W1P1)
    })
  })
})
