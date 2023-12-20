import {isNonNullable} from '@yoroi/common'
import {parseDrepId, useIsValidDRepID} from '@yoroi/staking'
import React from 'react'
import {Linking, StyleSheet, View} from 'react-native'

import {Button, Spacer, Text, TextInput} from '../../../../../components'
import {COLORS} from '../../../../../theme'
import {CardanoMobile} from '../../../../../yoroi-wallets/wallets'
import {useStrings} from '../../common'

type Props = {
  onSubmit?: (drepId: string) => void
}

const FIND_DREPS_LINK = ''

export const EnterDrepIdModal = ({onSubmit}: Props) => {
  const strings = useStrings()
  const [drepId, setDrepId] = React.useState('')

  const {error, isFetched, isFetching} = useIsValidDRepID(drepId, {retry: false, enabled: drepId.length > 0})

  const handleOnPress = () => {
    parseDrepId(drepId, CardanoMobile).then((parsedId) => onSubmit?.(parsedId))
  }

  const handleOnLinkPress = () => {
    Linking.openURL(FIND_DREPS_LINK)
  }

  return (
    <View style={styles.root}>
      <Spacer height={8} />

      <Text style={styles.text}>{strings.enterDrepIDInfo}</Text>

      {FIND_DREPS_LINK.length > 0 && (
        <>
          <Spacer height={24} />

          <Text style={[styles.text, styles.link]} onPress={handleOnLinkPress}>
            {strings.findDRepHere}
          </Text>
        </>
      )}

      <Spacer height={24} />

      <TextInput
        value={drepId}
        onChangeText={(text) => setDrepId(text)}
        multiline
        errorDelay={1000}
        errorText={error?.message}
        label={strings.drepID}
        focusable
        style={{height: 80, fontSize: 16}}
      />

      <Spacer fill />

      <Button
        title={strings.confirm}
        disabled={isNonNullable(error) || drepId.length === 0 || !isFetched || isFetching}
        shelleyTheme
        onPress={handleOnPress}
      />

      <Spacer height={24} />
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
