import {useSyncStorageToState} from '@yoroi/common'

import * as React from 'react'

import {agreementDate} from '~/kernel/constants'
import {legalAgreementStorageKeyManager} from '~/kernel/storage/storages'

export const useLegalAgreement = () => {
  const [legalAgreement, setLegalAgreement, resetLegalAgreement] =
    useSyncStorageToState(legalAgreementStorageKeyManager)

  const agree = React.useCallback(() => {
    setLegalAgreement({
      ...legalAgreement,
      latestAcceptedAgreementsDate: agreementDate,
    })
  }, [legalAgreement, setLegalAgreement])

  return React.useMemo(
    () => ({legalAgreement, setLegalAgreement, resetLegalAgreement, agree}),
    [legalAgreement, setLegalAgreement, resetLegalAgreement, agree],
  )
}
