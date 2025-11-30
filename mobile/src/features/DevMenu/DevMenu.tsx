import {hex} from '@yoroi/common'
import {atoms as a, useTheme} from '@yoroi/theme'

import {useNavigation} from '@react-navigation/native'
import {StackNavigationProp} from '@react-navigation/stack'
import {BigNumber} from 'bignumber.js'
import * as React from 'react'
import {Alert, Text, View} from 'react-native'
import {SystemBars} from 'react-native-edge-to-edge'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useAuth} from '~/features/Auth/context/AuthProvider'
import {usePairing} from '~/features/Pairing/context/PairingProvider'
import {decryptData} from '~/kernel/crypto/decrypt-data'
import {encryptData} from '~/kernel/crypto/encrypt-data'
import {useLanguage} from '~/kernel/i18n/LanguageProvider'
import {LocalizableError} from '~/kernel/i18n/LocalizableError'
import {useStrings} from '~/kernel/i18n/useStrings'
import {MenuRoutes} from '~/kernel/navigation/types'
import {debugStorage} from '~/kernel/storage/debug-storage'
import {rootMMKV, rootSyncStorage} from '~/kernel/storage/storages'
import {Button, ButtonType} from '~/ui/Button/Button'
import {LoadingOverlay} from '~/ui/LoadingOverlay/LoadingOverlay'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {ScrollView} from '~/ui/ScrollView/ScrollView'
import {TextInput} from '~/ui/TextInput/TextInput'

import {useWalletNameOverride} from '../Discover/common/WalletNameOverrideContext'
import {WalletNameOverrideModalContent} from '../Discover/common/WalletNameOverrideModalContent'
import {useWalletManager} from '../WalletManager/context/WalletManagerProvider'
import {useCreateWalletMnemonic} from '../WalletManager/hooks/useCreateWalletMnemonic'
import {CborReviewModalContent} from './CborReviewModalContent'

export function DevMenu() {
  const {isDark, config, basePalette, selectTheme, atoms: ta} = useTheme()
  const {authWithHost, changeAuthSetting} = useAuth()
  const {languageCode, selectLanguage} = useLanguage()
  const strings = useStrings()
  const [isLoading, setIsLoading] = React.useState(false)
  const [showCrash, setShowCrash] = React.useState(false)
  const {createWallet} = useCreateWalletMnemonic()
  const {walletManager} = useWalletManager()

  const showLoadingFor3Seconds = React.useCallback(() => {
    setIsLoading(true)
    const t = setTimeout(() => {
      setIsLoading(false)
      clearTimeout(t)
    }, 3000)
  }, [])

  const {currency, ptActivity} = usePairing()
  const navigation = useNavigation<StackNavigationProp<MenuRoutes>>()
  const {openModal, closeModal} = useModal()
  const [demoText, setDemoText] = React.useState('')
  const {walletNameOverride} = useWalletNameOverride()

  return (
    <SafeAreaView
      style={[a.flex_1, ta.bg_color_max]}
      edges={['left', 'right', 'bottom']}
    >
      <SystemBars style={isDark ? 'light' : 'dark'} />

      <ScrollView
        style={[a.flex_1]}
        contentContainerStyle={[a.gap_sm, a.flex_row, a.flex_wrap, a.p_lg]}
      >
        <Text style={[a.body_2_md_regular, ta.text_gray_max]}>
          base: {basePalette} selectedTheme: {config} currency: {currency}
          ptActivity: {ptActivity.close}
        </Text>

        <Button
          onPress={() => selectTheme(isDark ? 'default-light' : 'default-dark')}
          type={ButtonType.Secondary}
          title={`Toggle ${isDark ? 'Light' : 'Dark'} Theme`}
          style={[a.pt_md, a.p_md, a.rounded_md]}
        />

        <Button
          onPress={() => rootSyncStorage.clear()}
          type={ButtonType.Secondary}
          title="Clear Storage"
          style={[a.pt_md, a.p_md, a.rounded_md]}
        />

        <Button
          onPress={() =>
            selectLanguage(languageCode === 'en-US' ? 'de-DE' : 'en-US')
          }
          type={ButtonType.Secondary}
          title={`Change Language ${languageCode} ${strings.global.available} $${BigNumber(10.12).toString()}`}
          style={[a.pt_md, a.p_md, a.rounded_md]}
        />

        <Button
          onPress={showLoadingFor3Seconds}
          type={ButtonType.Secondary}
          title="Show Loading for 3 Seconds"
          style={[a.pt_md, a.p_md, a.rounded_md]}
        />

        <Button
          onPress={() => setShowCrash(!showCrash)}
          type={ButtonType.Primary}
          title={showCrash ? 'Hide Crash' : 'Show Crash'}
          style={[a.p_md, {borderRadius: 8}]}
        />

        <Button
          onPress={() =>
            openModal({
              title: 'Demo Long Modal',
              canDiscard: true,
              height: 700,
              content: (
                <DevLongContent demoText={demoText} setDemoText={setDemoText} />
              ),
              footer: (
                <View style={[a.flex_row, a.gap_lg]}>
                  <Button
                    style={[a.flex_1]}
                    type={ButtonType.Secondary}
                    onPress={closeModal}
                    title="Cancel"
                  />

                  <Button
                    style={[a.flex_1]}
                    onPress={closeModal}
                    title="Close"
                  />
                </View>
              ),
            })
          }
          type={ButtonType.Secondary}
          title="Open Demo Long Modal"
          style={[a.pt_md, a.p_md, a.rounded_md]}
        />

        <Button
          onPress={() =>
            openModal({
              title: 'Demo Short Modal',
              canDiscard: true,
              height: 300,
              content: <DevShortContent />,
              footer: (
                <View style={[a.flex_row, a.gap_lg]}>
                  <Button
                    style={[a.flex_1]}
                    type={ButtonType.Secondary}
                    onPress={closeModal}
                    title="Cancel"
                  />

                  <Button
                    style={[a.flex_1]}
                    onPress={closeModal}
                    title="Close"
                  />
                </View>
              ),
            })
          }
          type={ButtonType.Secondary}
          title="Open Demo Short Modal"
          style={[a.pt_md, a.p_md, a.rounded_md]}
        />

        <Button
          onPress={() => authWithHost().then(console.log).catch(console.error)}
          type={ButtonType.Secondary}
          title="Auth with Host"
          style={[a.pt_md, a.p_md, a.rounded_md]}
        />

        <Button
          onPress={() => changeAuthSetting('os')}
          type={ButtonType.Secondary}
          title="Set Auth with Host"
          style={[a.pt_md, a.p_md, a.rounded_md]}
        />

        <Button type={ButtonType.Secondary} title="Metrics (Disabled)" />

        <Button
          type={ButtonType.Secondary}
          title="Test Metrics (Disabled)"
          disabled={true}
        />

        <Button
          onPress={() => {
            debugStorage(rootMMKV)
          }}
          type={ButtonType.Secondary}
          title="DebugStorage"
        />

        <Button
          onPress={async () => {
            const startEncrypt = Date.now()
            const encrypted = encryptData({
              plainData: hex.fromUtf8('masterkey'),
              secretKey: hex.fromUtf8('password'),
            })
            console.log('Encryption time:', Date.now() - startEncrypt, 'ms')

            const startDecrypt = Date.now()
            const decrypted = decryptData({
              encryptedData: encrypted,
              secretKey: hex.fromUtf8('password'),
            })
            console.log('Decryption time:', Date.now() - startDecrypt, 'ms')

            console.log('Decrypted result:', decrypted.utf8)
          }}
          type={ButtonType.Secondary}
          title="Decrypt Data"
          style={[a.pt_md, a.p_md, a.rounded_md]}
        />

        <Button
          onPress={() => {
            navigation.navigate('test-list-search')
          }}
          type={ButtonType.Secondary}
          title="Test List Search"
          style={[a.pt_md, a.p_md, a.rounded_md]}
        />

        <Button
          onPress={() => {
            if (walletManager.isSyncActive) {
              walletManager.pauseSyncing()
            } else {
              walletManager.resumeSyncing()
            }
          }}
          type={ButtonType.Secondary}
          title={
            walletManager.isSyncActive ? 'Pause Syncing' : 'Resume Syncing'
          }
          style={[a.pt_md, a.p_md, a.rounded_md]}
        />

        <Button
          onPress={() => {
            openModal({
              title: 'Wallet Name Override',
              canDiscard: true,
              height: 300,
              content: <WalletNameOverrideModalContent />,
            })
          }}
          type={ButtonType.Secondary}
          title={`Wallet Name Override: ${walletNameOverride ?? 'yoroi'}`}
          style={[a.pt_md, a.p_md, a.rounded_md]}
        />

        <Button
          onPress={() => {
            openModal({
              title: 'Custom Transaction',
              canDiscard: true,
              height: 500,
              content: <CborReviewModalContent />,
            })
          }}
          type={ButtonType.Secondary}
          title="Custom Transaction"
          style={[a.pt_md, a.p_md, a.rounded_md]}
        />

        <BuggyComponent showCrash={showCrash} />
      </ScrollView>

      <LoadingOverlay isLoading={isLoading} />

      {/* <BluetoothDeviceManager
        showConnectionStatus
        onDeviceSelect={(deviceId) => {
          console.log('Selected device:', deviceId)
        }}
      /> */}
      <View style={[a.gap_xs]}>
        <Button
          disabled={isLoading}
          onPress={() =>
            createWallet({
              mnemonicPhrase: process.env.EXPO_PUBLIC_WALLET_1_MNEMONIC ?? '',
              name: 'Wallet 1',
              password: '1234567890',
              implementation: 'cardano-cip1852',
              addressMode: 'multiple',
              accountVisual: 0,
            })
          }
          testID="btnRestoreWallet1"
          title="Restore Wallet 1"
        />

        <Button
          disabled={isLoading}
          onPress={() =>
            createWallet({
              mnemonicPhrase: process.env.EXPO_PUBLIC_WALLET_2_MNEMONIC ?? '',
              name: 'Wallet 2',
              password: '1234567890',
              implementation: 'cardano-cip1852',
              addressMode: 'multiple',
              accountVisual: 0,
            })
          }
          testID="btnRestoreWallet2"
          title="Restore Wallet 2"
        />

        <Button
          disabled={isLoading}
          onPress={() =>
            createWallet({
              mnemonicPhrase: process.env.EXPO_PUBLIC_WALLET_3_MNEMONIC ?? '',
              name: 'Wallet 3',
              password: '1234567890',
              implementation: 'cardano-cip1852',
              addressMode: 'multiple',
              accountVisual: 0,
            })
          }
          testID="btnRestoreWallet3"
          title="Restore Wallet 3"
        />
      </View>
    </SafeAreaView>
  )
}

const BuggyComponent = ({showCrash}: {showCrash: boolean}) => {
  if (showCrash) {
    throw new LocalizableError({id: 'api.error.badRequest'})
  }

  return <></>
}

const DevLongContent = ({
  demoText,
  setDemoText,
}: {
  demoText: string
  setDemoText: (t: string) => void
}) => {
  const {atoms: ta} = useTheme()
  const {openModal, closeModal} = useModal()

  return (
    <View style={[a.gap_md]}>
      <Text style={[ta.text_primary_medium, a.body_2_md_regular]}>
        Description
      </Text>

      {Array.from({length: 16}).map((_, idx) => (
        <Text
          style={[ta.text_primary_medium, a.body_2_md_regular]}
          {...{key: `paragraph-${idx}`}}
        >
          Description paragraph
        </Text>
      ))}

      <View>
        <Text style={[ta.text_primary_medium, a.body_2_md_medium]}>Memo</Text>
        <TextInput
          value={demoText}
          onChangeText={setDemoText}
          placeholder="Type here"
          multiline
        />
      </View>

      <Button
        onPress={() =>
          openModal({
            title: 'Queued Short Modal',
            canDiscard: true,
            height: 300,
            content: (
              <View style={[a.gap_md]}>
                <Text style={[ta.text_primary_medium, a.body_2_md_medium]}>
                  This modal was queued!
                </Text>
                <Text style={[ta.text_primary_medium, a.body_2_md_regular]}>
                  This modal opened from the queue when the long modal was
                  closed.
                </Text>
              </View>
            ),
            footer: (
              <View style={[a.flex_row, a.gap_lg]}>
                <Button
                  style={[a.flex_1]}
                  type={ButtonType.Secondary}
                  onPress={closeModal}
                  title="Cancel"
                />

                <Button style={[a.flex_1]} onPress={closeModal} title="Close" />
              </View>
            ),
          })
        }
        type={ButtonType.Secondary}
        title="Queue Short Modal"
        style={[a.pt_lg]}
      />

      <Button
        onPress={() =>
          Alert.alert(
            'CTA Action',
            `Action triggered with memo: "${demoText || 'No memo provided'}"`,
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'OK',
                onPress: () => console.log('User confirmed CTA action'),
              },
            ],
          )
        }
        type={ButtonType.Primary}
        title="Primary CTA Action"
        style={[a.pt_lg]}
      />
    </View>
  )
}

const DevShortContent = () => {
  const {atoms: ta} = useTheme()
  const {openModal, closeModal} = useModal()

  return (
    <View style={[a.gap_md]}>
      <Text style={[ta.text_primary_medium, a.body_2_md_medium]}>
        Short description
      </Text>
      <Text style={[ta.text_primary_medium, a.body_2_md_regular]}>Header</Text>

      <Button
        onPress={() =>
          openModal({
            title: 'Queued Long Modal',
            canDiscard: true,
            height: 700,
            content: (
              <View style={[a.gap_md]}>
                <Text style={[ta.text_primary_medium, a.body_2_md_medium]}>
                  This long modal was queued!
                </Text>
                <Text style={[ta.text_primary_medium, a.body_2_md_regular]}>
                  This modal opened from the queue when the short modal was
                  closed.
                </Text>
                {Array.from({length: 10}).map((_, idx) => (
                  <Text
                    style={[ta.text_primary_medium, a.body_2_md_regular]}
                    {...{key: `queued-paragraph-${idx}`}}
                  >
                    Queued content paragraph {idx + 1}
                  </Text>
                ))}
              </View>
            ),
            footer: (
              <View style={[a.flex_row, a.gap_lg]}>
                <Button
                  style={[a.flex_1]}
                  type={ButtonType.Secondary}
                  onPress={closeModal}
                  title="Cancel"
                />

                <Button style={[a.flex_1]} onPress={closeModal} title="Close" />
              </View>
            ),
          })
        }
        type={ButtonType.Secondary}
        title="Queue Long Modal"
        style={[a.pt_lg]}
      />
    </View>
  )
}
