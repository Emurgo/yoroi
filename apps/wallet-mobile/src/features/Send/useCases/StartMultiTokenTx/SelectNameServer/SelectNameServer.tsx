import {isNameServer, nameServerName} from '@yoroi/resolver'
import {useTransfer} from '@yoroi/transfer'
import {Resolver} from '@yoroi/types'
import * as React from 'react'
import {ReactNode} from 'react'
import {Animated, StyleSheet} from 'react-native'

import {Spacer} from '../../../../../components/Spacer/Spacer'
import {Text} from '../../../../../components/Text'
import {Warning} from '../../../../../components/Warning/Warning'
import {ButtonGroup} from '../../../common/ButtonGroup/ButtonGroup'
import {useStrings} from '../../../common/strings'

export const SelectNameServer = () => {
  const strings = useStrings()
  const {targets, selectedTargetIndex, nameServerSelectedChanged} = useTransfer()
  const receiver = targets[selectedTargetIndex].receiver
  const {addressRecords} = receiver
  const addressRecordsEntries = toAddressRecordsEntries(addressRecords)
  const labels = addressRecordsEntries.map(([nameServer]) => nameServerName[nameServer])

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
      {shouldShow && <Spacer height={16} />}

      {(waitAnimation || shouldShow) && (
        <>
          <ButtonGroup labels={labels} onSelect={handleOnSelectNameServer} />

          {receiver.selectedNameServer === undefined && shouldShow && (
            <>
              <Spacer height={16} />

              <Warning content={String(strings.manyNameServersWarning(bold))} />
            </>
          )}
        </>
      )}
    </Animated.View>
  )
}

const toAddressRecordsEntries = (addressRecords: Resolver.Receiver['addressRecords']) =>
  Object.entries(addressRecords ?? {}).reduce((acc, [key, value]) => {
    if (isNameServer(key)) {
      acc.push([key, value])
    }
    return acc
  }, [] as [Resolver.NameServer, string][])

const bold = {b: (text: ReactNode) => <Text style={styles.bold}>{text}</Text>}

const styles = StyleSheet.create({
  bold: {
    fontWeight: '500',
    fontFamily: 'Rubik-Medium',
  },
})
