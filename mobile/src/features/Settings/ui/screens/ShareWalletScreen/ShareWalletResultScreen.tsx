import {atoms as a} from '@yoroi/theme'

import * as Clipboard from 'expo-clipboard'
import * as React from 'react'
import {ScrollView} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Button, ButtonType} from '~/ui/Button/Button'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {ShareQRCodeCard} from '~/ui/ShareQRCodeCard/ShareQRCodeCard'

type Props = {
  link: string
  walletType: 'full' | 'readonly'
}

export const ShareWalletResultScreen = ({link, walletType}: Props) => {
  const strings = useStrings()
  const [copied, setCopied] = React.useState(false)

  const handleCopyLink = React.useCallback(async () => {
    await Clipboard.setStringAsync(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [link])

  const qrTitle =
    walletType === 'full'
      ? strings.settings.shareWallet.fullWalletLink
      : strings.settings.shareWallet.readOnlyWalletLink

  return (
    <SafeArea>
      <ScrollView
        bounces={false}
        style={a.flex_1}
        contentContainerStyle={[a.px_lg, a.gap_lg, a.pb_lg]}
      >
        <ShareQRCodeCard
          qrContent={link}
          shareContent={link}
          title={qrTitle}
          onLongPress={handleCopyLink}
          shareLabel={strings.settings.shareWallet.shareQRCode}
          testID="share-wallet-qr-code"
        />
      </ScrollView>

      <SafeArea.Footer>
        <Button
          title={
            copied
              ? strings.settings.shareWallet.linkCopied
              : strings.settings.shareWallet.copyLink
          }
          onPress={handleCopyLink}
          type={ButtonType.Primary}
        />
      </SafeArea.Footer>
    </SafeArea>
  )
}
