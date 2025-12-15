import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {ScrollView, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Button} from '~/ui/Button/Button'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'
import {Space} from '~/ui/Space/Space'
import {Text} from '~/ui/Text/Text'

import {VerificationResult} from './useMessageVerification'

type Props = {
  result: VerificationResult
  error: string | null
  onClose: () => void
}

export const MessageVerificationResultModal = ({
  result,
  error,
  onClose,
}: Props) => {
  const strings = useStrings()
  const {palette: p, atoms: ta} = useTheme()

  return (
    <Modal.Content>
      <ScrollView contentContainerStyle={[a.px_lg, a.pb_lg]}>
        <Space.Height.lg />

        {result.extractedMessage && (
          <View style={[a.gap_sm, a.pb_md]}>
            <Text style={[a.body_1_lg_medium, ta.text_gray_max]}>
              Signed Message:
            </Text>
            <View
              style={[{backgroundColor: p.bg_color_min}, a.rounded_sm, a.p_md]}
            >
              <Text style={[a.body_2_md_regular, {color: p.text_gray_medium}]}>
                {result.extractedMessage}
              </Text>
            </View>
          </View>
        )}

        {result.extractedAddress && (
          <View style={[a.gap_sm, a.pb_md]}>
            <Text style={[a.body_1_lg_medium, ta.text_gray_max]}>Address:</Text>
            <Text
              style={[
                a.body_2_md_regular,
                {color: p.text_gray_medium, fontFamily: 'monospace'},
              ]}
            >
              {result.extractedAddress}
            </Text>
          </View>
        )}

        {result.extractedPublicKey && (
          <View style={[a.gap_sm, a.pb_md]}>
            <Text style={[a.body_1_lg_medium, ta.text_gray_max]}>
              Public Key:
            </Text>
            <Text
              style={[
                a.body_2_md_regular,
                {color: p.text_gray_medium, fontFamily: 'monospace'},
              ]}
            >
              {result.extractedPublicKey}
            </Text>
          </View>
        )}

        {result.addressMatches !== undefined && (
          <View style={[a.pb_md]}>
            <Text
              style={[
                a.body_2_md_regular,
                result.addressMatches
                  ? {color: p.green_static}
                  : {color: p.sys_magenta_500},
              ]}
            >
              {result.addressMatches
                ? '✓ Address verified: Signature belongs to this address'
                : '✗ Address mismatch: Signature does not belong to this address'}
            </Text>
          </View>
        )}

        {result.isValid ? (
          <View style={[a.pb_md]}>
            <Text style={[a.body_2_md_regular, {color: p.green_static}]}>
              {strings.transactions.messageSigning.messageSigningVerifySuccess}
            </Text>
          </View>
        ) : (
          <View style={[a.pb_md]}>
            <Text style={[a.body_2_md_regular, {color: p.sys_magenta_500}]}>
              {error ||
                strings.transactions.messageSigning.messageSigningVerifyError}
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal.Footer>
        <Button title={strings.global.close} onPress={onClose} />
      </Modal.Footer>
    </Modal.Content>
  )
}
