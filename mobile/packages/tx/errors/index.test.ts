import {
  AssetOverflowError,
  BaseError,
  GenericError,
  NoOutputsError,
  NotEnoughMoneyToSendError,
  RewardAddressEmptyError,
} from './index'

describe('tx errors', () => {
  describe('NotEnoughMoneyToSendError', () => {
    it('should create error with correct id and message', () => {
      const error = new NotEnoughMoneyToSendError()
      expect(error.id).toBe('ceae0da9-9653-4b46-b658-00701f73573a')
      expect(error.message).toBe('Not enough balance for transaction')
      expect(error).toBeInstanceOf(BaseError)
    })
  })

  describe('AssetOverflowError', () => {
    it('should create error with correct id and message', () => {
      const error = new AssetOverflowError()
      expect(error.id).toBe('6edf10e8-472a-4d7e-9871-3184175cf980')
      expect(error.message).toBe('Asset overflow')
      expect(error).toBeInstanceOf(BaseError)
    })
  })

  describe('NoOutputsError', () => {
    it('should create error with correct id and message', () => {
      const error = new NoOutputsError()
      expect(error.id).toBe('23f2aa70-7e40-4cae-a113-3f8919ad45ec')
      expect(error.message).toBe('No outputs')
      expect(error).toBeInstanceOf(BaseError)
    })
  })

  describe('GenericError', () => {
    it('should create error with correct id', () => {
      const error = new GenericError()
      expect(error.id).toBe('c07c9d6f-ba71-44b2-af26-72704a154bf6')
      expect(error.message).toBe('')
      expect(error).toBeInstanceOf(BaseError)
    })
  })

  describe('RewardAddressEmptyError', () => {
    it('should create error with correct id and message', () => {
      const error = new RewardAddressEmptyError()
      expect(error.id).toBe('6ad14231-59f5-405d-8fc1-69a0acb92195')
      expect(error.message).toBe('Reward address empty')
      expect(error).toBeInstanceOf(BaseError)
    })
  })
})
