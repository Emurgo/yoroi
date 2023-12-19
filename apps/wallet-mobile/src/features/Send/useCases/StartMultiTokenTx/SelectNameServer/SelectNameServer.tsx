import {isNameServer, nameServerName} from '@yoroi/resolver'
import {Resolver} from '@yoroi/types'
import * as React from 'react'
import {Animated, StyleSheet, Text, View} from 'react-native'

import {Icon} from '../../../../../components/Icon'
import {Spacer} from '../../../../../components/Spacer/Spacer'
import {ButtonGroup} from '../../../common/ButtonGroup/ButtonGroup'
import {useSend} from '../../../common/SendContext'
import {useStrings} from '../../../common/strings'

export const SelectNameServer = () => {
  const {targets, selectedTargetIndex, nameServerSelectedChanged} = useSend()
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
      {(waitAnimation || shouldShow) && (
        <>
          <ShowManyAddressWarning />

          <Spacer height={4} />

          <ButtonGroup labels={labels} onSelect={handleOnSelectNameServer} />

          <Spacer height={4} />
        </>
      )}
    </Animated.View>
  )
}

export const ShowManyAddressWarning = () => {
  const strings = useStrings()

  return (
    <View style={styles.notice}>
      <Icon.Info size={30} color="#ECBA09" />

      <Spacer height={8} />

      <Text style={styles.text}>{strings.manyNameServersWarning}</Text>
    </View>
  )
}

const toAddressRecordsEntries = (addressRecords: Resolver.Receiver['addressRecords']) =>
  Object.entries(addressRecords ?? {}).reduce((acc, [key, value]) => {
    if (isNameServer(key)) {
      acc.push([key, value])
    }
    return acc
  }, [] as [Resolver.NameServer, string][])

const styles = StyleSheet.create({
  notice: {
    backgroundColor: '#FDF7E2',
    padding: 12,
  },
  text: {
    fontFamily: 'Rubik-Medium',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 22,
  },
})
