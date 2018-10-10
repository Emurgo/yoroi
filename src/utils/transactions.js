//@flow

import moment from 'moment'

// Fixme: Get real values and put it into config somewhere
export const confirmationsToAssuranceLevel = (confirmations: number) => {
  if (confirmations < 5) {
    return 'LOW'
  }

  if (confirmations < 9) {
    return 'MEDIUM'
  }

  return 'HIGH'
}

// TODO(ppershing): probably belongs to utils/localization once we have it
export const printAda = (amount: number) => {
  // 1 ADA = 1 000 000 micro ada
  return (amount / 1000000).toFixed(6)
}


export const processTxHistoryData = (data: any, ownAddresses: Array<string>) => {
  const ownInputs = data.inputs_address.map((address, index) => {
    return {
      address,
      amount: parseInt(data.inputs_amount[index], 10),
    }
  }).filter((input) => ownAddresses.includes(input.address))

  const ownOutputs = data.outputs_address.map((address, index) => {
    return {
      address,
      amount: parseInt(data.outputs_amount[index], 10),
    }
  }).filter((input) => ownAddresses.includes(input.address))

  const hasOnlyOwnInputs = ownInputs.length === data.inputs_address
  const hasOnlyOwnOutputs = ownOutputs.length === data.outputs_address
  const isIntraWallet = hasOnlyOwnInputs && hasOnlyOwnOutputs

  const incomingAmount = ownOutputs.reduce((reduce, output) => reduce + output.amount, 0)
  const outgoingAmount = ownInputs.reduce((reduce, input) => reduce + input.amount, 0)

  const resultTxAmount = incomingAmount - outgoingAmount

  return {
    id: data.hash,
    fromAddresses: data.inputs_address,
    toAddresses: data.outputs_address,
    amount: resultTxAmount,
    confirmations: parseInt(data.best_block_num, 10) - parseInt(data.block_num, 10),
    type: resultTxAmount >= 0 ? 'RECEIVED' : 'SENT',
    isIntraWallet,
    timestamp: moment(data.time),
    updatedAt: moment(data.last_update),
  }
}

