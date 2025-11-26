export abstract class BaseError extends Error {
  private _id: string

  get id(): string {
    return this._id
  }

  constructor(id: string, message: string) {
    super(message)
    this._id = id
  }
}

export class NotEnoughMoneyToSendError extends BaseError {
  constructor() {
    super(
      'ceae0da9-9653-4b46-b658-00701f73573a',
      'Not enough balance for transaction'
    )
  }
}

export class AssetOverflowError extends BaseError {
  constructor() {
    super('6edf10e8-472a-4d7e-9871-3184175cf980', 'Asset overflow')
  }
}

export class NoOutputsError extends BaseError {
  constructor() {
    super('23f2aa70-7e40-4cae-a113-3f8919ad45ec', 'No outputs')
  }
}

export class GenericError extends BaseError {
  constructor() {
    super('c07c9d6f-ba71-44b2-af26-72704a154bf6', '')
  }
}

export class RewardAddressEmptyError extends BaseError {
  constructor() {
    super('6ad14231-59f5-405d-8fc1-69a0acb92195', 'Reward address empty')
  }
}

