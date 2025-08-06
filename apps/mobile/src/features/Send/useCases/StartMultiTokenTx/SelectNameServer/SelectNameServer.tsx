import {isNameServer, nameServerName} from '@yoroi/resolver'
import {useTransfer} from '@yoroi/transfer'
import {Resolver} from '@yoroi/types'
import * as React from 'react'
import {Animated} from 'react-native'

import {ButtonGroup} from '~/features/Send/common/ButtonGroup/ButtonGroup'
import {useBold} from '~/hooks/useBold'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Space} from '~/ui/Space/Space'
import {WarningBanner} from '~/ui/WarningBanner/WarningBanner'

export const SelectNameServer = () => {
  const strings = useStrings()
  const bold = useBold()
  const {targets, selectedTargetIndex, nameServerSelectedChanged} =
    useTransfer()
  const receiver = targets[selectedTargetIndex].receiver
  const {addressRecords} = receiver
  const addressRecordsEntries = toAddressRecordsEntries(addressRecords)
  const labels = addressRecordsEntries.map(
    ([nameServer]) => nameServerName[nameServer],
  )

  const shouldShow = addressRecordsEntries.length > 1

  const [animatedValue] = React.useState(new Animated.Value(0))
  const [waitAnimation, setWaitAnimation] = React.useState(false)

  React.useEffect(() => {
    animatedValue.stopAnimation()
    if (shouldShow) {
      setWaitAnimation(true)
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start()
    } else {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => setWaitAnimation(false))
    }
  }, [animatedValue, shouldShow])

  const handleOnSelectNameServer = (index: number) => {
    const [nameServer] = addressRecordsEntries[index]
    nameServerSelectedChanged(nameServer)
  }

  return (
    <Animated.View style={{opacity: animatedValue}}>
      {shouldShow && <Space.Height.md />}

      {(waitAnimation || shouldShow) && (
        <>
          <ButtonGroup labels={labels} onSelect={handleOnSelectNameServer} />

          {receiver.selectedNameServer === undefined && shouldShow && (
            <>
              <Space.Height.md />

              <WarningBanner
                content={String(strings.send.manyNameServersWarning(bold))}
              />
            </>
          )}
        </>
      )}
    </Animated.View>
  )
}

const toAddressRecordsEntries = (
  addressRecords: Resolver.Receiver['addressRecords'],
) =>
  Object.entries(addressRecords ?? {}).reduce(
    (acc, [key, value]) => {
      if (isNameServer(key)) {
        acc.push([key, value])
      }
      return acc
    },
    [] as [Resolver.NameServer, string][],
  )
