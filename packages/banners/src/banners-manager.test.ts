import {toNumber} from '@yoroi/common'
import {Banners} from '@yoroi/types'

import {bannersManagerMaker} from './banners-manager'

describe('bannersManagerMaker', () => {
  let storage: Banners.Config<'test-banner'>['storage']
  const mockDate = new Date(2025, 2, 11).getTime()

  beforeEach(() => {
    storage = {
      clear: jest.fn(),
      multiSet: jest.fn(),
      setItem: jest.fn(),
      multiRemove: jest.fn(),
      removeItem: jest.fn(),
      getAllKeys: jest.fn(),
      join: jest.fn(),
      getItem: jest.fn(),
      multiGet: jest.fn(),
      removeFolder: jest.fn(),
      onChange: jest.fn(),
    }

    jest.spyOn(global, 'Date').mockImplementation(
      () =>
        ({
          getTime: () => mockDate,
        } as unknown as Date),
    )
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should dismiss a banner', () => {
    const manager = bannersManagerMaker({storage})
    const bannerId = 'test-banner'

    manager.dismiss(bannerId)

    expect(storage.setItem).toHaveBeenCalledWith(bannerId, mockDate.toString())
  })

  it('should return dismissedAt time', () => {
    const manager = bannersManagerMaker<'test-banner'>({storage})
    const bannerId = 'test-banner'
    const timestamp = toNumber(mockDate.toString())

    ;(storage.getItem as jest.Mock).mockReturnValueOnce(timestamp)

    const result = manager.dismissedAt(bannerId)

    expect(result).toBe(mockDate)
    expect(storage.getItem).toHaveBeenCalledWith(bannerId)
  })

  it('should return 0 if banner is not dismissed', () => {
    const manager = bannersManagerMaker<'test-banner'>({storage})
    const bannerId = 'test-banner'

    ;(storage.getItem as jest.Mock).mockReturnValueOnce(null)

    const result = manager.dismissedAt(bannerId)

    expect(result).toBe(0)
    expect(storage.getItem).toHaveBeenCalledWith(bannerId)
  })
})
