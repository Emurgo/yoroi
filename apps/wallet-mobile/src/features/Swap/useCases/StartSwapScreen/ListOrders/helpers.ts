import {
  Address,
  BigNum,
  Costmdls,
  CostModel,
  ExUnitPrices,
  Int,
  Language,
  LinearFee,
  PlutusWitness,
  Transaction,
  TransactionBuilder,
  TransactionBuilderConfigBuilder,
  UnitInterval,
  Value,
} from '@emurgo/csl-mobile-bridge'
import {useSwap} from '@yoroi/swap'
import {BalanceQuantity} from '@yoroi/types/src/balance/token'
import {Buffer} from 'buffer'
import {useCallback} from 'react'
import {useQuery} from 'react-query'

import {useSelectedWallet} from '../../../../../SelectedWallet'
import {HARD_DERIVATION_START} from '../../../../../yoroi-wallets/cardano/constants/common'
import {YoroiWallet} from '../../../../../yoroi-wallets/cardano/types'
import {Quantities} from '../../../../../yoroi-wallets/utils'
import {CardanoMobile} from '../../../../../yoroi-wallets/wallets'

type Options = {
  bech32Address: string
  orderUtxo: string
  collateralUtxo: string
}

export const useCancellationOrderFee = (options: Options) => {
  const {order} = useSwap()
  const wallet = useSelectedWallet()

  const calculateFee = useCallback(
    async (options: Options) => {
      const address = await CardanoMobile.Address.fromBech32(options.bech32Address)
      const bytes = await address.toBytes()
      const addressHex = new Buffer(bytes).toString('hex')
      const cbor = await order.cancel({
        utxos: {collateral: options.collateralUtxo, order: options.orderUtxo},
        address: addressHex,
      })
      const tx = await CardanoMobile.Transaction.fromBytes(Buffer.from(cbor, 'hex'))
      const feeNumber = await tx.body().then((b) => b.fee())
      return Quantities.denominated(
        (await feeNumber.toStr()) as BalanceQuantity,
        wallet.primaryToken.metadata.numberOfDecimals,
      )
    },
    [order, wallet],
  )

  const result = useQuery({
    queryKey: [wallet.id, 'cancellationOrderFee', options.orderUtxo],
    queryFn: () => calculateFee(options),
    suspense: true,
  })

  if (!result.data) throw new Error('invalid state')
  return result.data
}

export const convertBech32ToHex = async (bech32Address: string) => {
  const address = await CardanoMobile.Address.fromBech32(bech32Address)
  const bytes = await address.toBytes()
  return new Buffer(bytes).toString('hex')
}

export const harden = (num: number) => HARD_DERIVATION_START + num

export const getCostModel = async () => {
  const babbageCostModels = await Costmdls.new()
  const v1CostModel = await CostModel.new()
  await Promise.all(operations1.map(async (cost, operation) => v1CostModel.set(operation, await Int.new_i32(cost))))

  const v2CostModel = await CostModel.new()
  await Promise.all(operations2.map(async (cost, operation) => v2CostModel.set(operation, await Int.new_i32(cost))))

  await babbageCostModels.insert(await Language.new_plutus_v1(), v1CostModel)
  await babbageCostModels.insert(await Language.new_plutus_v2(), v2CostModel)

  return babbageCostModels
}

const bigNumFromStr = async (str: string) => {
  const bigNum = await BigNum.from_str(str)
  if (!bigNum) throw new Error('Could not parse big number from string ' + str)
  return bigNum
}

export const getTransactionBuilder = async () => {
  const linearFee = await LinearFee.new(await bigNumFromStr('44'), await bigNumFromStr('155381'))

  const exUnitPrices = await ExUnitPrices.new(
    await UnitInterval.new(await bigNumFromStr('577'), await bigNumFromStr('10000')),
    await UnitInterval.new(await bigNumFromStr('721'), await bigNumFromStr('10000000')),
  )

  const txBuilderCfg = await TransactionBuilderConfigBuilder.new()
    .then((builder) => builder.fee_algo(linearFee))
    .then(async (builder) => builder.pool_deposit(await bigNumFromStr('500000000')))
    .then(async (builder) => builder.key_deposit(await bigNumFromStr('2000000')))
    .then((builder) => builder.max_value_size(4000))
    .then((builder) => builder.max_tx_size(8000))
    .then(async (builder) => builder.coins_per_utxo_word(await bigNumFromStr('34482')))
    .then(async (builder) => builder.ex_unit_prices(exUnitPrices).then((builder) => builder.build()))

  return TransactionBuilder.new(assertRequired(txBuilderCfg, 'Could not build transaction builder'))
}

const operations1 = Object.values({
  'addInteger-cpu-arguments-intercept': 205665,
  'addInteger-cpu-arguments-slope': 812,
  'addInteger-memory-arguments-intercept': 1,
  'addInteger-memory-arguments-slope': 1,
  'appendByteString-cpu-arguments-intercept': 1000,
  'appendByteString-cpu-arguments-slope': 571,
  'appendByteString-memory-arguments-intercept': 0,
  'appendByteString-memory-arguments-slope': 1,
  'appendString-cpu-arguments-intercept': 1000,
  'appendString-cpu-arguments-slope': 24177,
  'appendString-memory-arguments-intercept': 4,
  'appendString-memory-arguments-slope': 1,
  'bData-cpu-arguments': 1000,
  'bData-memory-arguments': 32,
  'blake2b_256-cpu-arguments-intercept': 117366,
  'blake2b_256-cpu-arguments-slope': 10475,
  'blake2b_256-memory-arguments': 4,
  'cekApplyCost-exBudgetCPU': 23000,
  'cekApplyCost-exBudgetMemory': 100,
  'cekBuiltinCost-exBudgetCPU': 23000,
  'cekBuiltinCost-exBudgetMemory': 100,
  'cekConstCost-exBudgetCPU': 23000,
  'cekConstCost-exBudgetMemory': 100,
  'cekDelayCost-exBudgetCPU': 23000,
  'cekDelayCost-exBudgetMemory': 100,
  'cekForceCost-exBudgetCPU': 23000,
  'cekForceCost-exBudgetMemory': 100,
  'cekLamCost-exBudgetCPU': 23000,
  'cekLamCost-exBudgetMemory': 100,
  'cekStartupCost-exBudgetCPU': 100,
  'cekStartupCost-exBudgetMemory': 100,
  'cekVarCost-exBudgetCPU': 23000,
  'cekVarCost-exBudgetMemory': 100,
  'chooseData-cpu-arguments': 19537,
  'chooseData-memory-arguments': 32,
  'chooseList-cpu-arguments': 175354,
  'chooseList-memory-arguments': 32,
  'chooseUnit-cpu-arguments': 46417,
  'chooseUnit-memory-arguments': 4,
  'consByteString-cpu-arguments-intercept': 221973,
  'consByteString-cpu-arguments-slope': 511,
  'consByteString-memory-arguments-intercept': 0,
  'consByteString-memory-arguments-slope': 1,
  'constrData-cpu-arguments': 89141,
  'constrData-memory-arguments': 32,
  'decodeUtf8-cpu-arguments-intercept': 497525,
  'decodeUtf8-cpu-arguments-slope': 14068,
  'decodeUtf8-memory-arguments-intercept': 4,
  'decodeUtf8-memory-arguments-slope': 2,
  'divideInteger-cpu-arguments-constant': 196500,
  'divideInteger-cpu-arguments-model-arguments-intercept': 453240,
  'divideInteger-cpu-arguments-model-arguments-slope': 220,
  'divideInteger-memory-arguments-intercept': 0,
  'divideInteger-memory-arguments-minimum': 1,
  'divideInteger-memory-arguments-slope': 1,
  'encodeUtf8-cpu-arguments-intercept': 1000,
  'encodeUtf8-cpu-arguments-slope': 28662,
  'encodeUtf8-memory-arguments-intercept': 4,
  'encodeUtf8-memory-arguments-slope': 2,
  'equalsByteString-cpu-arguments-constant': 245000,
  'equalsByteString-cpu-arguments-intercept': 216773,
  'equalsByteString-cpu-arguments-slope': 62,
  'equalsByteString-memory-arguments': 1,
  'equalsData-cpu-arguments-intercept': 1060367,
  'equalsData-cpu-arguments-slope': 12586,
  'equalsData-memory-arguments': 1,
  'equalsInteger-cpu-arguments-intercept': 208512,
  'equalsInteger-cpu-arguments-slope': 421,
  'equalsInteger-memory-arguments': 1,
  'equalsString-cpu-arguments-constant': 187000,
  'equalsString-cpu-arguments-intercept': 1000,
  'equalsString-cpu-arguments-slope': 52998,
  'equalsString-memory-arguments': 1,
  'fstPair-cpu-arguments': 80436,
  'fstPair-memory-arguments': 32,
  'headList-cpu-arguments': 43249,
  'headList-memory-arguments': 32,
  'iData-cpu-arguments': 1000,
  'iData-memory-arguments': 32,
  'ifThenElse-cpu-arguments': 80556,
  'ifThenElse-memory-arguments': 1,
  'indexByteString-cpu-arguments': 57667,
  'indexByteString-memory-arguments': 4,
  'lengthOfByteString-cpu-arguments': 1000,
  'lengthOfByteString-memory-arguments': 10,
  'lessThanByteString-cpu-arguments-intercept': 197145,
  'lessThanByteString-cpu-arguments-slope': 156,
  'lessThanByteString-memory-arguments': 1,
  'lessThanEqualsByteString-cpu-arguments-intercept': 197145,
  'lessThanEqualsByteString-cpu-arguments-slope': 156,
  'lessThanEqualsByteString-memory-arguments': 1,
  'lessThanEqualsInteger-cpu-arguments-intercept': 204924,
  'lessThanEqualsInteger-cpu-arguments-slope': 473,
  'lessThanEqualsInteger-memory-arguments': 1,
  'lessThanInteger-cpu-arguments-intercept': 208896,
  'lessThanInteger-cpu-arguments-slope': 511,
  'lessThanInteger-memory-arguments': 1,
  'listData-cpu-arguments': 52467,
  'listData-memory-arguments': 32,
  'mapData-cpu-arguments': 64832,
  'mapData-memory-arguments': 32,
  'mkCons-cpu-arguments': 65493,
  'mkCons-memory-arguments': 32,
  'mkNilData-cpu-arguments': 22558,
  'mkNilData-memory-arguments': 32,
  'mkNilPairData-cpu-arguments': 16563,
  'mkNilPairData-memory-arguments': 32,
  'mkPairData-cpu-arguments': 76511,
  'mkPairData-memory-arguments': 32,
  'modInteger-cpu-arguments-constant': 196500,
  'modInteger-cpu-arguments-model-arguments-intercept': 453240,
  'modInteger-cpu-arguments-model-arguments-slope': 220,
  'modInteger-memory-arguments-intercept': 0,
  'modInteger-memory-arguments-minimum': 1,
  'modInteger-memory-arguments-slope': 1,
  'multiplyInteger-cpu-arguments-intercept': 69522,
  'multiplyInteger-cpu-arguments-slope': 11687,
  'multiplyInteger-memory-arguments-intercept': 0,
  'multiplyInteger-memory-arguments-slope': 1,
  'nullList-cpu-arguments': 60091,
  'nullList-memory-arguments': 32,
  'quotientInteger-cpu-arguments-constant': 196500,
  'quotientInteger-cpu-arguments-model-arguments-intercept': 453240,
  'quotientInteger-cpu-arguments-model-arguments-slope': 220,
  'quotientInteger-memory-arguments-intercept': 0,
  'quotientInteger-memory-arguments-minimum': 1,
  'quotientInteger-memory-arguments-slope': 1,
  'remainderInteger-cpu-arguments-constant': 196500,
  'remainderInteger-cpu-arguments-model-arguments-intercept': 453240,
  'remainderInteger-cpu-arguments-model-arguments-slope': 220,
  'remainderInteger-memory-arguments-intercept': 0,
  'remainderInteger-memory-arguments-minimum': 1,
  'remainderInteger-memory-arguments-slope': 1,
  'sha2_256-cpu-arguments-intercept': 806990,
  'sha2_256-cpu-arguments-slope': 30482,
  'sha2_256-memory-arguments': 4,
  'sha3_256-cpu-arguments-intercept': 1927926,
  'sha3_256-cpu-arguments-slope': 82523,
  'sha3_256-memory-arguments': 4,
  'sliceByteString-cpu-arguments-intercept': 265318,
  'sliceByteString-cpu-arguments-slope': 0,
  'sliceByteString-memory-arguments-intercept': 4,
  'sliceByteString-memory-arguments-slope': 0,
  'sndPair-cpu-arguments': 85931,
  'sndPair-memory-arguments': 32,
  'subtractInteger-cpu-arguments-intercept': 205665,
  'subtractInteger-cpu-arguments-slope': 812,
  'subtractInteger-memory-arguments-intercept': 1,
  'subtractInteger-memory-arguments-slope': 1,
  'tailList-cpu-arguments': 41182,
  'tailList-memory-arguments': 32,
  'trace-cpu-arguments': 212342,
  'trace-memory-arguments': 32,
  'unBData-cpu-arguments': 31220,
  'unBData-memory-arguments': 32,
  'unConstrData-cpu-arguments': 32696,
  'unConstrData-memory-arguments': 32,
  'unIData-cpu-arguments': 43357,
  'unIData-memory-arguments': 32,
  'unListData-cpu-arguments': 32247,
  'unListData-memory-arguments': 32,
  'unMapData-cpu-arguments': 38314,
  'unMapData-memory-arguments': 32,
  'verifyEd25519Signature-cpu-arguments-intercept': 57996947,
  'verifyEd25519Signature-cpu-arguments-slope': 18975,
  'verifyEd25519Signature-memory-arguments': 10,
})

const operations2 = Object.values({
  'addInteger-cpu-arguments-intercept': 205665,
  'addInteger-cpu-arguments-slope': 812,
  'addInteger-memory-arguments-intercept': 1,
  'addInteger-memory-arguments-slope': 1,
  'appendByteString-cpu-arguments-intercept': 1000,
  'appendByteString-cpu-arguments-slope': 571,
  'appendByteString-memory-arguments-intercept': 0,
  'appendByteString-memory-arguments-slope': 1,
  'appendString-cpu-arguments-intercept': 1000,
  'appendString-cpu-arguments-slope': 24177,
  'appendString-memory-arguments-intercept': 4,
  'appendString-memory-arguments-slope': 1,
  'bData-cpu-arguments': 1000,
  'bData-memory-arguments': 32,
  'blake2b_256-cpu-arguments-intercept': 117366,
  'blake2b_256-cpu-arguments-slope': 10475,
  'blake2b_256-memory-arguments': 4,
  'cekApplyCost-exBudgetCPU': 23000,
  'cekApplyCost-exBudgetMemory': 100,
  'cekBuiltinCost-exBudgetCPU': 23000,
  'cekBuiltinCost-exBudgetMemory': 100,
  'cekConstCost-exBudgetCPU': 23000,
  'cekConstCost-exBudgetMemory': 100,
  'cekDelayCost-exBudgetCPU': 23000,
  'cekDelayCost-exBudgetMemory': 100,
  'cekForceCost-exBudgetCPU': 23000,
  'cekForceCost-exBudgetMemory': 100,
  'cekLamCost-exBudgetCPU': 23000,
  'cekLamCost-exBudgetMemory': 100,
  'cekStartupCost-exBudgetCPU': 100,
  'cekStartupCost-exBudgetMemory': 100,
  'cekVarCost-exBudgetCPU': 23000,
  'cekVarCost-exBudgetMemory': 100,
  'chooseData-cpu-arguments': 19537,
  'chooseData-memory-arguments': 32,
  'chooseList-cpu-arguments': 175354,
  'chooseList-memory-arguments': 32,
  'chooseUnit-cpu-arguments': 46417,
  'chooseUnit-memory-arguments': 4,
  'consByteString-cpu-arguments-intercept': 221973,
  'consByteString-cpu-arguments-slope': 511,
  'consByteString-memory-arguments-intercept': 0,
  'consByteString-memory-arguments-slope': 1,
  'constrData-cpu-arguments': 89141,
  'constrData-memory-arguments': 32,
  'decodeUtf8-cpu-arguments-intercept': 497525,
  'decodeUtf8-cpu-arguments-slope': 14068,
  'decodeUtf8-memory-arguments-intercept': 4,
  'decodeUtf8-memory-arguments-slope': 2,
  'divideInteger-cpu-arguments-constant': 196500,
  'divideInteger-cpu-arguments-model-arguments-intercept': 453240,
  'divideInteger-cpu-arguments-model-arguments-slope': 220,
  'divideInteger-memory-arguments-intercept': 0,
  'divideInteger-memory-arguments-minimum': 1,
  'divideInteger-memory-arguments-slope': 1,
  'encodeUtf8-cpu-arguments-intercept': 1000,
  'encodeUtf8-cpu-arguments-slope': 28662,
  'encodeUtf8-memory-arguments-intercept': 4,
  'encodeUtf8-memory-arguments-slope': 2,
  'equalsByteString-cpu-arguments-constant': 245000,
  'equalsByteString-cpu-arguments-intercept': 216773,
  'equalsByteString-cpu-arguments-slope': 62,
  'equalsByteString-memory-arguments': 1,
  'equalsData-cpu-arguments-intercept': 1060367,
  'equalsData-cpu-arguments-slope': 12586,
  'equalsData-memory-arguments': 1,
  'equalsInteger-cpu-arguments-intercept': 208512,
  'equalsInteger-cpu-arguments-slope': 421,
  'equalsInteger-memory-arguments': 1,
  'equalsString-cpu-arguments-constant': 187000,
  'equalsString-cpu-arguments-intercept': 1000,
  'equalsString-cpu-arguments-slope': 52998,
  'equalsString-memory-arguments': 1,
  'fstPair-cpu-arguments': 80436,
  'fstPair-memory-arguments': 32,
  'headList-cpu-arguments': 43249,
  'headList-memory-arguments': 32,
  'iData-cpu-arguments': 1000,
  'iData-memory-arguments': 32,
  'ifThenElse-cpu-arguments': 80556,
  'ifThenElse-memory-arguments': 1,
  'indexByteString-cpu-arguments': 57667,
  'indexByteString-memory-arguments': 4,
  'lengthOfByteString-cpu-arguments': 1000,
  'lengthOfByteString-memory-arguments': 10,
  'lessThanByteString-cpu-arguments-intercept': 197145,
  'lessThanByteString-cpu-arguments-slope': 156,
  'lessThanByteString-memory-arguments': 1,
  'lessThanEqualsByteString-cpu-arguments-intercept': 197145,
  'lessThanEqualsByteString-cpu-arguments-slope': 156,
  'lessThanEqualsByteString-memory-arguments': 1,
  'lessThanEqualsInteger-cpu-arguments-intercept': 204924,
  'lessThanEqualsInteger-cpu-arguments-slope': 473,
  'lessThanEqualsInteger-memory-arguments': 1,
  'lessThanInteger-cpu-arguments-intercept': 208896,
  'lessThanInteger-cpu-arguments-slope': 511,
  'lessThanInteger-memory-arguments': 1,
  'listData-cpu-arguments': 52467,
  'listData-memory-arguments': 32,
  'mapData-cpu-arguments': 64832,
  'mapData-memory-arguments': 32,
  'mkCons-cpu-arguments': 65493,
  'mkCons-memory-arguments': 32,
  'mkNilData-cpu-arguments': 22558,
  'mkNilData-memory-arguments': 32,
  'mkNilPairData-cpu-arguments': 16563,
  'mkNilPairData-memory-arguments': 32,
  'mkPairData-cpu-arguments': 76511,
  'mkPairData-memory-arguments': 32,
  'modInteger-cpu-arguments-constant': 196500,
  'modInteger-cpu-arguments-model-arguments-intercept': 453240,
  'modInteger-cpu-arguments-model-arguments-slope': 220,
  'modInteger-memory-arguments-intercept': 0,
  'modInteger-memory-arguments-minimum': 1,
  'modInteger-memory-arguments-slope': 1,
  'multiplyInteger-cpu-arguments-intercept': 69522,
  'multiplyInteger-cpu-arguments-slope': 11687,
  'multiplyInteger-memory-arguments-intercept': 0,
  'multiplyInteger-memory-arguments-slope': 1,
  'nullList-cpu-arguments': 60091,
  'nullList-memory-arguments': 32,
  'quotientInteger-cpu-arguments-constant': 196500,
  'quotientInteger-cpu-arguments-model-arguments-intercept': 453240,
  'quotientInteger-cpu-arguments-model-arguments-slope': 220,
  'quotientInteger-memory-arguments-intercept': 0,
  'quotientInteger-memory-arguments-minimum': 1,
  'quotientInteger-memory-arguments-slope': 1,
  'remainderInteger-cpu-arguments-constant': 196500,
  'remainderInteger-cpu-arguments-model-arguments-intercept': 453240,
  'remainderInteger-cpu-arguments-model-arguments-slope': 220,
  'remainderInteger-memory-arguments-intercept': 0,
  'remainderInteger-memory-arguments-minimum': 1,
  'remainderInteger-memory-arguments-slope': 1,
  'serialiseData-cpu-arguments-intercept': 1159724,
  'serialiseData-cpu-arguments-slope': 392670,
  'serialiseData-memory-arguments-intercept': 0,
  'serialiseData-memory-arguments-slope': 2,
  'sha2_256-cpu-arguments-intercept': 806990,
  'sha2_256-cpu-arguments-slope': 30482,
  'sha2_256-memory-arguments': 4,
  'sha3_256-cpu-arguments-intercept': 1927926,
  'sha3_256-cpu-arguments-slope': 82523,
  'sha3_256-memory-arguments': 4,
  'sliceByteString-cpu-arguments-intercept': 265318,
  'sliceByteString-cpu-arguments-slope': 0,
  'sliceByteString-memory-arguments-intercept': 4,
  'sliceByteString-memory-arguments-slope': 0,
  'sndPair-cpu-arguments': 85931,
  'sndPair-memory-arguments': 32,
  'subtractInteger-cpu-arguments-intercept': 205665,
  'subtractInteger-cpu-arguments-slope': 812,
  'subtractInteger-memory-arguments-intercept': 1,
  'subtractInteger-memory-arguments-slope': 1,
  'tailList-cpu-arguments': 41182,
  'tailList-memory-arguments': 32,
  'trace-cpu-arguments': 212342,
  'trace-memory-arguments': 32,
  'unBData-cpu-arguments': 31220,
  'unBData-memory-arguments': 32,
  'unConstrData-cpu-arguments': 32696,
  'unConstrData-memory-arguments': 32,
  'unIData-cpu-arguments': 43357,
  'unIData-memory-arguments': 32,
  'unListData-cpu-arguments': 32247,
  'unListData-memory-arguments': 32,
  'unMapData-cpu-arguments': 38314,
  'unMapData-memory-arguments': 32,
  'verifyEcdsaSecp256k1Signature-cpu-arguments': 35892428,
  'verifyEcdsaSecp256k1Signature-memory-arguments': 10,
  'verifyEd25519Signature-cpu-arguments-intercept': 57996947,
  'verifyEd25519Signature-cpu-arguments-slope': 18975,
  'verifyEd25519Signature-memory-arguments': 10,
  'verifySchnorrSecp256k1Signature-cpu-arguments-intercept': 38887044,
  'verifySchnorrSecp256k1Signature-cpu-arguments-slope': 32947,
  'verifySchnorrSecp256k1Signature-memory-arguments': 10,
})

export const assertRequired = <T>(value: T | undefined, message: string): T => {
  if (value === undefined) throw new Error(message)
  return value
}

export const fixScriptHash = async (tx: Transaction) => {
  const builder = await getTransactionBuilder()

  const witnessSet = await tx.witness_set()

  const plutusScripts = assertRequired(await witnessSet.plutus_scripts(), 'Transaction does not contain plutus scripts')
  const plutusData = assertRequired(await witnessSet.plutus_data(), 'Transaction does not contain plutus data')
  const redeemers = assertRequired(await witnessSet.redeemers(), 'Transaction does not contain redeemers')
  const placeholderAddress = assertRequired(
    await Address.from_bech32(DUMMY_ADDRESS),
    'Could not parse placeholder address',
  )

  await builder.add_plutus_script_input(
    await PlutusWitness.new(await plutusScripts.get(0), await plutusData.get(0), await redeemers.get(0)),
    await (await (await tx.body()).inputs()).get(0),
    await Value.new(await bigNumFromStr('5000000')),
  )

  await builder.calc_script_data_hash(await getCostModel())

  await builder.add_change_if_needed(placeholderAddress)

  const dummyTxForCalculatingScriptHash = assertRequired(
    await builder.build(),
    'Could not build placeholder transaction',
  )
  const correctScriptHash = assertRequired(
    await dummyTxForCalculatingScriptHash.script_data_hash(),
    'Script hash is empty',
  )

  const body = await tx.body()
  await body.set_script_data_hash(correctScriptHash)
  return body
}

const DUMMY_ADDRESS =
  'addr1q9l0qrhrvu3nq92ns23g2atns690ge4c325vgzqlg4vru9uym9vrnx7vuq6q9lv984p6feekdusp3yewttl5a65sg6fs9r9gw5'

export const getRequiredSigners = async (tx: Transaction, wallet: YoroiWallet) => {
  const utxos = wallet.allUtxos
  const body = await tx.body()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const inputs = await body.inputs()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const requiredSigners = await body.required_signers()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const collateralInputs = assertRequired(await body.collateral(), 'Transaction does not contain collateral inputs')

  const firstCollateral = await collateralInputs.get(0)
  const txId = await firstCollateral.transaction_id().then((t) => t.to_hex())
  const txIndex = await firstCollateral.index()

  const matchingUtxo = utxos.find((utxo) => utxo.tx_hash === txId && utxo.tx_index === txIndex)
  if (!matchingUtxo) throw new Error('Could not find matching utxo')
  const {receiver} = matchingUtxo
  // TODO: get derivation path for receiver

  return [
    [harden(1852), harden(1815), harden(0), 0, 0],
    [harden(1852), harden(1815), harden(0), 1, 5],
  ]
}

export const getMuesliSwapTransactionAndSigners = async (cbor: string, wallet: YoroiWallet) => {
  const originalTx = assertRequired(await Transaction.from_hex(cbor), 'Could not parse transaction from cbor')
  const fixedTxBody = await fixScriptHash(originalTx)

  const txWithFixedBody = await Transaction.new(fixedTxBody, await originalTx.witness_set(), undefined)
  const newCbor = Buffer.from(await txWithFixedBody.to_bytes()).toString('hex')

  const signers = await getRequiredSigners(txWithFixedBody, wallet)
  return {cbor: newCbor, signers}
}
