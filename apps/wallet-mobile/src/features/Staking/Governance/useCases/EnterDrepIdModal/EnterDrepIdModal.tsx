import {useStrings} from '../../common'
import {Linking, StyleSheet, View} from 'react-native'
import {Button, Spacer, Text, TextInput} from '../../../../../components'
import React, {useState} from 'react'
import {COLORS} from '../../../../../theme'
import {useIsValidDRepID} from '@yoroi/staking'
import {isNonNullable} from '@yoroi/common'

type Props = {
  onSubmit?: (drepId: string) => void
}

export const EnterDrepIdModal = ({onSubmit}: Props) => {
  const strings = useStrings()
  const [drepId, setDrepId] = useState('')

  const {error, isFetched, isFetching} = useIsValidDRepID(drepId, {retry: false, enabled: !!drepId})

  const onPress = () => {
    onSubmit?.(drepId)
  }

  const onLinkPress = () => {
    // TODO: Add link to DREPs
    Linking.openURL('https://google.com')
  }

  return (
    <View style={styles.root}>
      <Spacer height={8} />

      <Text style={styles.text}>{strings.enterDRepID}</Text>

      <Spacer height={24} />

      <Text style={[styles.text, styles.link]} onPress={onLinkPress}>
        {strings.findDRepHere}
      </Text>

      <Spacer height={24} />

      <TextInput
        value={drepId}
        onChangeText={(e) => {
          setDrepId(e)
        }}
        multiline
        errorDelay={1000}
        errorText={error?.message}
      />

      <Spacer height={24} />

      <Button
        title={strings.confirm}
        disabled={isNonNullable(error) || drepId.length === 0 || !isFetched || isFetching}
        shelleyTheme
        onPress={onPress}
      />

      <Spacer height={44} />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  text: {
    color: '#242838',
    textAlign: 'center',
    fontFamily: 'Rubik-Regular',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  link: {
    color: COLORS.BLUE_LIGHTER,
    textDecorationLine: 'underline',
  },
})
