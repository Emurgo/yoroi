import {shouldShowDrep2usOnGovernance} from './should-show-drep2us-on-governance'

describe('shouldShowDrep2usOnGovernance', () => {
  it('should return true if the currentDRepIdHex is different from the yoroiDRepIdHex', () => {
    const currentDRepIdHex = 'DE'
    const yoroiDRepIdHex = 'AD'
    const result = shouldShowDrep2usOnGovernance({
      currentDRepIdHex,
      yoroiDRepIdHex,
    })
    expect(result).toBe(true)
  })

  it('should return false if the currentDRepIdHex is the same as the yoroiDRepIdHex', () => {
    const currentDRepIdHex = 'AD'
    const yoroiDRepIdHex = 'AD'
    const result = shouldShowDrep2usOnGovernance({
      currentDRepIdHex,
      yoroiDRepIdHex,
    })
    expect(result).toBe(false)
  })
})
