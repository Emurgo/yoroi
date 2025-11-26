import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {ScrollView} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useShareWalletLink} from '~/features/Settings/hooks/useShareWalletLink'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Button, ButtonType} from '~/ui/Button/Button'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Text} from '~/ui/Text/Text'

import {ShareWalletPasswordModal} from '../../components/ShareWalletPasswordModal'
import {ShareWalletResultScreen} from './ShareWalletResultScreen'
import {ShowShareWalletDisclaimer} from './ShowShareWalletDisclaimer'

export const ShareWalletScreen = () => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()
  const {openModal, closeModal} = useModal()
  const {
    meta: {isReadOnly, isHW},
  } = useSelectedWallet()
  const {generateFullWalletLink, generateReadOnlyWalletLink} =
    useShareWalletLink()
  const [generatedLink, setGeneratedLink] = React.useState<string | null>(null)
  const [walletType, setWalletType] = React.useState<
    'full' | 'readonly' | null
  >(null)
  const [disclaimerAccepted, setDisclaimerAccepted] = React.useState(false)

  const showFullWalletOption = !isReadOnly && !isHW

  const handleShareFullWallet = React.useCallback(() => {
    openModal({
      title: strings.settings.shareWallet.enterPassword,
      content: (
        <ShareWalletPasswordModal
          onSuccess={async (password) => {
            closeModal()
            try {
              const link = await generateFullWalletLink(password)
              setGeneratedLink(link)
              setWalletType('full')
            } catch (error) {
              // Error is handled by the hook
            }
          }}
        />
      ),
      height: 400,
    })
  }, [openModal, closeModal, generateFullWalletLink, strings])

  const handleShareReadOnlyWallet = React.useCallback(async () => {
    try {
      const link = await generateReadOnlyWalletLink()
      setGeneratedLink(link)
      setWalletType('readonly')
    } catch (error) {
      // Error is handled by the hook
    }
  }, [generateReadOnlyWalletLink])

  if (!disclaimerAccepted) {
    return (
      <ShowShareWalletDisclaimer
        onAccepted={() => setDisclaimerAccepted(true)}
      />
    )
  }

  if (generatedLink && walletType) {
    return (
      <ShareWalletResultScreen link={generatedLink} walletType={walletType} />
    )
  }

  return (
    <SafeAreaView
      edges={['bottom', 'right', 'left']}
      style={[ta.bg_color_max, a.flex_1, a.pt_lg]}
    >
      <ScrollView
        bounces={false}
        style={a.flex_1}
        contentContainerStyle={[a.px_lg, a.gap_lg]}
      >
        <Text style={[a.body_1_lg_regular, ta.text_gray_max]}>
          {strings.settings.shareWallet.description}
        </Text>

        {showFullWalletOption && (
          <Button
            title={strings.settings.shareWallet.fullWallet}
            onPress={handleShareFullWallet}
            type={ButtonType.Primary}
          />
        )}

        <Button
          title={strings.settings.shareWallet.readOnlyWallet}
          onPress={handleShareReadOnlyWallet}
          type={
            showFullWalletOption ? ButtonType.Secondary : ButtonType.Primary
          }
        />
      </ScrollView>
    </SafeAreaView>
  )
}
