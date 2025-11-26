import * as React from 'react'

import {SafeArea} from '~/ui/SafeArea/SafeArea'

import {CreatePinInput} from '../shared/CreatePinInput/CreatePinInput'

export const CreatePinScreen: React.FC<Props> = ({onDone}) => {
  return (
    <SafeArea>
      <CreatePinInput onDone={onDone} />
    </SafeArea>
  )
}

type Props = {
  onDone: (pin: string) => void
}
