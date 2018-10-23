import utxoSumForAddresses from '../mockData/utxoSumForAddresses.json'
import utxoForAddresses from '../mockData/utxoForAddresses.json'
import txHistory from '../mockData/history.json'

type Addresses = Array<string>

export const setIsOnlineCallback = () => null

export const fetchNewTxHistory = (since: number, addresses: Addresses) =>
  Promise.resolve(txHistory)

export const fetchUtxoSum = (addresses: Array<string>) =>
  Promise.resolve(utxoSumForAddresses)

export const fetchUtxo = (addresses: Array<string>) =>
  Promise.resolve(utxoForAddresses)
