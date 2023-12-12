import {Resolver} from '@yoroi/types'

import {useSend} from './SendContext'

export const useChangeReceiver = (nameServer: Resolver.NameServer) => {
  const {nameServerSelectedChanged, targets, selectedTargetIndex} = useSend()
  const {addressRecords} = targets[selectedTargetIndex].receiver

  const address = addressRecords?.[nameServer]

  nameServerSelectedChanged({
    selectedNameServer: nameServer,
    address: address ?? '',
  })
}
