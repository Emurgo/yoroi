import {primaryTokenId} from '@yoroi/portfolio'
import {
  Address,
  Amount,
  Balance,
  Chain,
  DatumHash,
  KeyHash,
  TransactionHash,
  UtxoId,
} from '@yoroi/types'

import {NoOutputsError} from '../errors'
import {ModernUtxo} from '../utxo/models'
import {
  addCertificate,
  addCertificates,
  addCollateralInput,
  addCollateralInputs,
  addInput,
  addInputs,
  addMetadata,
  addOutput,
  addOutputs,
  addReferenceInput,
  addWithdrawal,
  buildTransaction,
  buildTransactionCBOR,
  createTransactionBuilder,
  excludeUtxo,
  excludeUtxos,
  getTransactionState,
  isTransactionReady,
  removeCollateralInput,
  removeInput,
  setChangeAddress,
  setChangeOutput,
  setFee,
  setTTL,
  setTTLWithBuffer,
  setValidityInterval,
} from './builder'
import {createCardanoHaskellConfig} from './helpers'
import type {
  TransactionCertificate,
  TransactionOutput,
  TransactionWithdrawal,
} from './types'

describe('transaction builder', () => {
  const createMockUtxo = (
    txHash: string,
    txIndex: number,
    balance: Balance.Amounts,
  ): ModernUtxo => ({
    receiver: 'addr_test1' as Address,
    txHash: txHash as TransactionHash,
    txIndex,
    balance,
    toTransactionUnspentOutputHex: jest.fn(() => 'hex'),
    toTransactionUnspentOutput: jest.fn(),
  })

  describe('createTransactionBuilder', () => {
    it('should create initial state with empty arrays', () => {
      const state = createTransactionBuilder()
      expect(state.inputs).toEqual([])
      expect(state.outputs).toEqual([])
      expect(state.certificates).toEqual([])
      expect(state.withdrawals).toEqual([])
      expect(state.referenceInputs).toEqual([])
      expect(state.collateralInputs).toEqual([])
      expect(state.metadata).toEqual([])
      expect(state.options.mints).toEqual([])
      expect(state.excludedUtxos).toEqual(new Set())
    })
  })

  describe('addInput', () => {
    it('should add single input', () => {
      const state = createTransactionBuilder()
      const utxo = createMockUtxo('hash1', 0, {
        [primaryTokenId]: '1000000' as Balance.Quantity,
      })
      const newState = addInput(state, utxo)
      expect(newState.inputs).toHaveLength(1)
      expect(newState.inputs[0]?.utxo).toBe(utxo)
      expect(state.inputs).toHaveLength(0) // Original unchanged
    })

    it('should add multiple inputs', () => {
      const state = createTransactionBuilder()
      const utxo1 = createMockUtxo('hash1', 0, {
        [primaryTokenId]: '1000000' as Balance.Quantity,
      })
      const utxo2 = createMockUtxo('hash2', 1, {
        [primaryTokenId]: '2000000' as Balance.Quantity,
      })
      const newState = addInputs(state, [utxo1, utxo2])
      expect(newState.inputs).toHaveLength(2)
    })
  })

  describe('removeInput', () => {
    it('should remove input by txHash and txIndex', () => {
      const state = createTransactionBuilder()
      const utxo1 = createMockUtxo('hash1', 0, {
        [primaryTokenId]: '1000000' as Balance.Quantity,
      })
      const utxo2 = createMockUtxo('hash2', 1, {
        [primaryTokenId]: '2000000' as Balance.Quantity,
      })
      const stateWithInputs = addInputs(state, [utxo1, utxo2])
      const newState = removeInput(
        stateWithInputs,
        'hash1' as TransactionHash,
        0,
      )
      expect(newState.inputs).toHaveLength(1)
      expect(newState.inputs[0]?.utxo.txHash).toBe('hash2')
    })
  })

  describe('addOutput', () => {
    it('should add single output', () => {
      const state = createTransactionBuilder()
      const amounts: Balance.Amounts = {
        [primaryTokenId]: '1000000' as Balance.Quantity,
      }
      const newState = addOutput(state, 'addr_test1', amounts)
      expect(newState.outputs).toHaveLength(1)
      expect(newState.outputs[0]).toEqual({
        address: 'addr_test1' as Address,
        amounts,
        datum: undefined,
      })
    })

    it('should add output with datum', () => {
      const state = createTransactionBuilder()
      const amounts: Balance.Amounts = {
        [primaryTokenId]: '1000000' as Balance.Quantity,
      }
      const datum = {hash: 'datum_hash' as DatumHash}
      const newState = addOutput(state, 'addr_test1', amounts, datum)
      expect(newState.outputs[0]?.datum).toBe(datum)
    })

    it('should add multiple outputs', () => {
      const state = createTransactionBuilder()
      const outputs: TransactionOutput[] = [
        {
          address: 'addr1' as Address,
          amounts: {[primaryTokenId]: '1000000' as Balance.Quantity},
        },
        {
          address: 'addr2' as Address,
          amounts: {[primaryTokenId]: '2000000' as Balance.Quantity},
        },
      ]
      const newState = addOutputs(state, outputs)
      expect(newState.outputs).toHaveLength(2)
    })
  })

  describe('addCertificate', () => {
    it('should add single certificate', () => {
      const state = createTransactionBuilder()
      const cert: TransactionCertificate = {
        kind: 'StakeRegistration',
        stakeCredentialKeyHashHex: 'hash' as KeyHash,
      }
      const newState = addCertificate(state, cert)
      expect(newState.certificates).toHaveLength(1)
      expect(newState.certificates[0]?.kind).toBe('StakeRegistration')
    })

    it('should add multiple certificates', () => {
      const state = createTransactionBuilder()
      const certs: TransactionCertificate[] = [
        {
          kind: 'StakeRegistration',
          stakeCredentialKeyHashHex: 'hash1' as KeyHash,
        },
        {
          kind: 'StakeDelegation',
          stakeCredentialKeyHashHex: 'hash2' as KeyHash,
          poolKeyHash: 'pool1' as KeyHash,
        },
      ]
      const newState = addCertificates(state, certs)
      expect(newState.certificates).toHaveLength(2)
    })
  })

  describe('addWithdrawal', () => {
    it('should add withdrawal', () => {
      const state = createTransactionBuilder()
      const withdrawal: TransactionWithdrawal = {
        rewardAddress: 'stake_test1' as Address,
        amount: '1000000' as Amount,
      }
      const newState = addWithdrawal(
        state,
        withdrawal.rewardAddress,
        withdrawal.amount,
      )
      expect(newState.withdrawals).toHaveLength(1)
      expect(newState.withdrawals[0]).toEqual(withdrawal)
    })
  })

  describe('addReferenceInput', () => {
    it('should add reference input', () => {
      const state = createTransactionBuilder()
      const utxo = createMockUtxo('hash1', 0, {
        [primaryTokenId]: '1000000' as Balance.Quantity,
      })
      const newState = addReferenceInput(state, utxo)
      expect(newState.referenceInputs).toHaveLength(1)
      expect(newState.referenceInputs[0]?.utxo).toBe(utxo)
    })
  })

  describe('addCollateralInput', () => {
    it('should add single collateral input', () => {
      const state = createTransactionBuilder()
      const utxo = createMockUtxo('hash1', 0, {
        [primaryTokenId]: '5000000' as Balance.Quantity,
      })
      const newState = addCollateralInput(state, utxo)
      expect(newState.collateralInputs).toHaveLength(1)
      expect(newState.collateralInputs[0]?.utxo).toBe(utxo)
    })

    it('should add multiple collateral inputs', () => {
      const state = createTransactionBuilder()
      const utxos = [
        createMockUtxo('hash1', 0, {
          [primaryTokenId]: '5000000' as Balance.Quantity,
        }),
        createMockUtxo('hash2', 1, {
          [primaryTokenId]: '5000000' as Balance.Quantity,
        }),
      ]
      const newState = addCollateralInputs(state, utxos)
      expect(newState.collateralInputs).toHaveLength(2)
    })

    it('should remove collateral input', () => {
      const state = createTransactionBuilder()
      const utxo1 = createMockUtxo('hash1', 0, {
        [primaryTokenId]: '5000000' as Balance.Quantity,
      })
      const utxo2 = createMockUtxo('hash2', 1, {
        [primaryTokenId]: '5000000' as Balance.Quantity,
      })
      const stateWithCollateral = addCollateralInputs(state, [utxo1, utxo2])
      const newState = removeCollateralInput(stateWithCollateral, 'hash1', 0)
      expect(newState.collateralInputs).toHaveLength(1)
      expect(newState.collateralInputs[0]?.utxo.txHash).toBe('hash2')
    })
  })

  describe('excludeUtxo', () => {
    it('should exclude single UTXO', () => {
      const state = createTransactionBuilder()
      const newState = excludeUtxo(state, 'hash1' as TransactionHash, 0)
      expect(newState.excludedUtxos.has('hash1:0' as UtxoId)).toBe(true)
      expect(state.excludedUtxos.has('hash1:0' as UtxoId)).toBe(false) // Original unchanged
    })

    it('should exclude multiple UTXOs', () => {
      const state = createTransactionBuilder()
      const utxos = [
        createMockUtxo('hash1', 0, {
          [primaryTokenId]: '1000000' as Balance.Quantity,
        }),
        createMockUtxo('hash2', 1, {
          [primaryTokenId]: '2000000' as Balance.Quantity,
        }),
      ]
      const newState = excludeUtxos(state, utxos)
      expect(newState.excludedUtxos.has('hash1:0' as UtxoId)).toBe(true)
      expect(newState.excludedUtxos.has('hash2:1' as UtxoId)).toBe(true)
    })
  })

  describe('addMetadata', () => {
    it('should add metadata', () => {
      const state = createTransactionBuilder()
      const newState = addMetadata(state, '674', {msg: 'test'})
      expect(newState.metadata).toHaveLength(1)
      expect(newState.metadata[0]).toEqual({label: '674', data: {msg: 'test'}})
    })
  })

  describe('setChangeAddress', () => {
    it('should set change address', () => {
      const state = createTransactionBuilder()
      const newState = setChangeAddress(state, 'addr_test1' as Address)
      expect(newState.options.changeAddress).toBe('addr_test1')
    })
  })

  describe('setChangeOutput', () => {
    it('should set manual change output', () => {
      const state = createTransactionBuilder()
      const amounts: Balance.Amounts = {
        [primaryTokenId]: '5000000' as Balance.Quantity,
      }
      const newState = setChangeOutput(state, 'addr_test1', amounts)
      expect(newState.options.manualChangeOutput).toEqual({
        address: 'addr_test1' as Address,
        amounts,
      })
    })
  })

  describe('setFee', () => {
    it('should set manual fee', () => {
      const state = createTransactionBuilder()
      const amounts: Balance.Amounts = {
        [primaryTokenId]: '170000' as Balance.Quantity,
      }
      const newState = setFee(state, amounts)
      expect(newState.options.manualFee).toBe(amounts)
    })
  })

  describe('setTTL', () => {
    it('should set TTL', () => {
      const state = createTransactionBuilder()
      const newState = setTTL(state, 1000000)
      expect(newState.options.ttl).toBe(1000000)
    })
  })

  describe('setTTLWithBuffer', () => {
    it('should set TTL with default buffer', () => {
      const state = createTransactionBuilder()
      const newState = setTTLWithBuffer(state, 1000000)
      expect(newState.options.ttl).toBe(1000000 + 7200)
    })

    it('should set TTL with custom buffer', () => {
      const state = createTransactionBuilder()
      const newState = setTTLWithBuffer(state, 1000000, 3600)
      expect(newState.options.ttl).toBe(1000000 + 3600)
    })
  })

  describe('setValidityInterval', () => {
    it('should set validity interval', () => {
      const state = createTransactionBuilder()
      const newState = setValidityInterval(state, 1000, 2000)
      expect(newState.options.validityInterval).toEqual({
        start: 1000,
        end: 2000,
      })
    })
  })

  describe('getTransactionState', () => {
    it('should return current state', () => {
      const state = createTransactionBuilder()
      const utxo = createMockUtxo('hash1', 0, {
        [primaryTokenId]: '1000000' as Balance.Quantity,
      })
      const stateWithInput = addInput(state, utxo)
      const currentState = getTransactionState(stateWithInput)
      expect(currentState.inputs).toHaveLength(1)
      expect(currentState.inputs[0]?.utxo).toBe(utxo)
    })
  })

  describe('isTransactionReady', () => {
    it('should return false when no inputs', () => {
      const state = createTransactionBuilder()
      const amounts: Balance.Amounts = {
        [primaryTokenId]: '1000000' as Balance.Quantity,
      }
      const stateWithOutput = addOutput(state, 'addr_test1', amounts)
      expect(isTransactionReady(stateWithOutput)).toBe(false)
    })

    it('should return false when no outputs', () => {
      const state = createTransactionBuilder()
      const utxo = createMockUtxo('hash1', 0, {
        [primaryTokenId]: '1000000' as Balance.Quantity,
      })
      const stateWithInput = addInput(state, utxo)
      expect(isTransactionReady(stateWithInput)).toBe(false)
    })

    it('should return true when has inputs and outputs', () => {
      const state = createTransactionBuilder()
      const utxo = createMockUtxo('hash1', 0, {
        [primaryTokenId]: '1000000' as Balance.Quantity,
      })
      const amounts: Balance.Amounts = {
        [primaryTokenId]: '500000' as Balance.Quantity,
      }
      const stateWithBoth = addOutput(
        addInput(state, utxo),
        'addr_test1',
        amounts,
      )
      expect(isTransactionReady(stateWithBoth)).toBe(true)
    })
  })

  describe('buildTransaction', () => {
    const protocolParams: Pick<
      Chain.Cardano.ProtocolParams,
      | 'keyDeposit'
      | 'linearFee'
      | 'coinsPerUtxoByte'
      | 'poolDeposit'
      | 'epoch'
      | 'maxBlockBodySize'
      | 'maxBlockHeaderSize'
      | 'maxTxSize'
      | 'maxReferenceScriptsSize'
      | 'stakePoolPledgeInfluence'
      | 'monetaryExpansion'
      | 'treasuryExpansion'
      | 'minPoolCost'
      | 'maxExecutionUnits'
      | 'minFeeReferenceScript'
    > = {
      linearFee: {coefficient: '44', constant: '155381'},
      poolDeposit: '500000000',
      keyDeposit: '2000000',
      coinsPerUtxoByte: '4310',
      epoch: 0,
      maxBlockBodySize: '90112',
      maxBlockHeaderSize: '1100',
      maxTxSize: '16384',
      maxReferenceScriptsSize: '204800',
      stakePoolPledgeInfluence: {numerator: '3', denominator: '10'},
      monetaryExpansion: {numerator: '3', denominator: '1000'},
      treasuryExpansion: {numerator: '1', denominator: '5'},
      minPoolCost: '340000000',
      maxExecutionUnits: {
        perTransaction: {memory: '14000000', cpu: '10000000000'},
        perBlock: {memory: '62000000', cpu: '20000000000'},
      },
      minFeeReferenceScript: {
        coinsPerByte: {numerator: '15', denominator: '1'},
        tierStepBytes: '25600',
        multiplier: '1.2',
      },
    }
    const protocolConfig = createCardanoHaskellConfig(protocolParams, 0)

    it('should throw NoOutputsError when no outputs and no change address', async () => {
      const state = createTransactionBuilder()
      const utxo = createMockUtxo('hash1', 0, {
        [primaryTokenId]: '1000000' as Balance.Quantity,
      })
      const stateWithInput = addInput(state, utxo)

      await expect(
        buildTransaction(stateWithInput, protocolConfig),
      ).rejects.toThrow(NoOutputsError)
    })

    it('should throw error when excluded UTXO is used as input', async () => {
      const state = createTransactionBuilder()
      const utxo = createMockUtxo('hash1', 0, {
        [primaryTokenId]: '1000000' as Balance.Quantity,
      })
      const stateWithInput = addInput(state, utxo)
      const stateWithExclusion = excludeUtxo(
        stateWithInput,
        'hash1' as TransactionHash,
        0,
      )
      const stateWithOutput = addOutput(stateWithExclusion, 'addr_test1', {
        [primaryTokenId]: '500000' as Balance.Quantity,
      })

      await expect(
        buildTransaction(stateWithOutput, protocolConfig),
      ).rejects.toThrow('excluded but used as input')
    })

    it('should throw error when excluded UTXO is used as collateral', async () => {
      const state = createTransactionBuilder()
      const utxo = createMockUtxo('hash1', 0, {
        [primaryTokenId]: '1000000' as Balance.Quantity,
      })
      const stateWithCollateral = addCollateralInput(state, utxo)
      const stateWithExclusion = excludeUtxo(
        stateWithCollateral,
        'hash1' as TransactionHash,
        0,
      )
      const stateWithOutput = addOutput(stateWithExclusion, 'addr_test1', {
        [primaryTokenId]: '500000' as Balance.Quantity,
      })
      const stateWithInput = addInput(stateWithOutput, utxo)

      await expect(
        buildTransaction(stateWithInput, protocolConfig),
      ).rejects.toThrow('excluded but used as collateral')
    })
  })

  describe('buildTransactionCBOR', () => {
    const protocolParams: Pick<
      Chain.Cardano.ProtocolParams,
      | 'keyDeposit'
      | 'linearFee'
      | 'coinsPerUtxoByte'
      | 'poolDeposit'
      | 'epoch'
      | 'maxBlockBodySize'
      | 'maxBlockHeaderSize'
      | 'maxTxSize'
      | 'maxReferenceScriptsSize'
      | 'stakePoolPledgeInfluence'
      | 'monetaryExpansion'
      | 'treasuryExpansion'
      | 'minPoolCost'
      | 'maxExecutionUnits'
      | 'minFeeReferenceScript'
    > = {
      linearFee: {coefficient: '44', constant: '155381'},
      poolDeposit: '500000000',
      keyDeposit: '2000000',
      coinsPerUtxoByte: '4310',
      epoch: 0,
      maxBlockBodySize: '90112',
      maxBlockHeaderSize: '1100',
      maxTxSize: '16384',
      maxReferenceScriptsSize: '204800',
      stakePoolPledgeInfluence: {numerator: '3', denominator: '10'},
      monetaryExpansion: {numerator: '3', denominator: '1000'},
      treasuryExpansion: {numerator: '1', denominator: '5'},
      minPoolCost: '340000000',
      maxExecutionUnits: {
        perTransaction: {memory: '14000000', cpu: '10000000000'},
        perBlock: {memory: '62000000', cpu: '20000000000'},
      },
      minFeeReferenceScript: {
        coinsPerByte: {numerator: '15', denominator: '1'},
        tierStepBytes: '25600',
        multiplier: '1.2',
      },
    }
    const protocolConfig = createCardanoHaskellConfig(protocolParams, 0)

    it('should throw NoOutputsError when no outputs and no change address', async () => {
      const state = createTransactionBuilder()
      const utxo = createMockUtxo('hash1', 0, {
        [primaryTokenId]: '1000000' as Balance.Quantity,
      })
      const stateWithInput = addInput(state, utxo)

      await expect(
        buildTransactionCBOR(stateWithInput, protocolConfig),
      ).rejects.toThrow(NoOutputsError)
    })
  })
})
