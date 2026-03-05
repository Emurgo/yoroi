import {GovernanceProvider, useGovernance} from '@yoroi/staking'

import * as React from 'react'

import {useStrings} from '~/kernel/i18n/useStrings'
import {useModal} from '~/ui/Modal/context/ModalContext'

import {EnterDrepIdModal, HEIGHT_DEFAULT} from './EnterDrepIdModal'

type OnSubmit = (options: {
  hash: string
  type: 'key' | 'script'
  CIP105: boolean
}) => void

export const useOpenDrepIdModal = () => {
  const strings = useStrings()
  const {openModal} = useModal()
  const {manager} = useGovernance()

  const openDrepIdModal = React.useCallback(
    (onSubmit: OnSubmit) => {
      openModal({
        title: strings.staking.enterDRepID,
        content: (
          <GovernanceProvider manager={manager}>
            <EnterDrepIdModal onSubmit={onSubmit} />
          </GovernanceProvider>
        ),
        height: HEIGHT_DEFAULT,
      })
    },
    [manager, openModal, strings.staking.enterDRepID],
  )

  return {openDrepIdModal}
}
