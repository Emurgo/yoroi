import {SafeAreaView} from 'react-native-safe-area-context'
import {View, StyleSheet} from 'react-native'
import {Button, Icon, Spacer, Text} from '../../../components'
import * as React from 'react'
import {useConfirmRawTx as usePromptRootKey} from '../common/hooks'
import {useConfirmHWConnectionModal} from '../common/ConfirmHWConnectionModal'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'
import {Transaction} from '@emurgo/cross-csl-core'
import {cip30LedgerExtensionMaker} from '../../../yoroi-wallets/cardano/cip30/cip30-ledger'
import {useShowHWNotSupportedModal} from '../common/HWNotSupportedModal'
import {useParams} from '../../../kernel/navigation'
import {z} from 'zod'
import {createTypeGuardFromSchema} from '@yoroi/common'
import {useEffect} from 'react'
import {wrappedCsl} from '../../../yoroi-wallets/cardano/wrappedCsl'
import {useQuery} from 'react-query'
import {TouchableOpacity} from 'react-native-gesture-handler'
import {atoms, useTheme} from '@yoroi/theme'
import {formatAdaWithText} from '../../../yoroi-wallets/utils/format'
import {asQuantity} from '../../../yoroi-wallets/utils'
import {at} from 'lodash'
import {ScrollView} from '../../../components/ScrollView/ScrollView'

export type ReviewTransactionParams = {
  cbor: string
  onConfirm: (rootKey: string) => void
  onCancel: () => void
}

const paramsSchema = z.object({
  cbor: z.string(),
  onConfirm: z.function(),
  onCancel: z.function(),
})

const isParams = createTypeGuardFromSchema(paramsSchema)

type TxDetails = {
  body: {
    inputs: Array<{transaction_id: string; index: number}>
    outputs: Array<{address: string; amount: {coin: number}}>
    fee: string
    ttl: string
  }
}

const getTxDetails = async (cbor: string): Promise<TxDetails> => {
  const {csl, release} = wrappedCsl()
  try {
    const tx = await csl.Transaction.fromHex(cbor)
    const jsonString = await tx.toJson()
    return JSON.parse(jsonString)
  } finally {
    release()
  }
}

const useTxDetails = (cbor: string) => {
  return useQuery({queryFn: () => getTxDetails(cbor)})
}

export const ReviewTransaction = () => {
  const params = useParams<ReviewTransactionParams>(isParams)
  const promptRootKey = useConnectorPromptRootKey()
  const signData = useConnectorPromptRootKey()
  const theme = useTheme()
  const {wallet} = useSelectedWallet()
  const [inputsOpen, setInputsOpen] = React.useState(true)
  const [outputsOpen, setOutputsOpen] = React.useState(true)
  const [scrollbarShown, setScrollbarShown] = React.useState(false)

  const {styles} = useStyles()
  const {data} = useTxDetails(params.cbor)

  const signTxWithHW = useSignTxWithHW()
  const signDataWithHW = useSignDataWithHW()

  const handleOnConfirm = async () => {
    const rootKey = await promptRootKey()
    params.onConfirm(rootKey)
  }

  useEffect(() => {
    return () => {
      params.onCancel()
    }
  }, [])

  const inputs = data?.body.inputs ?? []
  const outputs = data?.body.outputs ?? []

  const getUtxoByTxIdAndIndex = (txId: string, index: number) => {
    return wallet.utxos.find((u) => u.tx_hash === txId && u.tx_index === index)
  }

  const isOwnedAddress = (bech32Address: string) => {
    return wallet.internalAddresses.includes(bech32Address) || wallet.externalAddresses.includes(bech32Address)
  }

  return (
    <SafeAreaView
      edges={['top', 'bottom', 'left', 'right']}
      style={{backgroundColor: theme.color.bg_color_low, flex: 1}}
    >
      <ScrollView bounces={false} style={{flex: 1, paddingHorizontal: 16}} onScrollBarChange={setScrollbarShown}>
        <Dropdown open={inputsOpen} onPress={() => setInputsOpen((o) => !o)}>
          <Text style={styles.dropdownText}>{`Inputs (${inputs.length})`}</Text>
        </Dropdown>
        {inputsOpen && <Spacer height={16} />}
        {inputsOpen &&
          inputs.map((input, index) => {
            const receiveUTxO = getUtxoByTxIdAndIndex(input.transaction_id, input.index)
            const address = receiveUTxO?.receiver
            const coin = receiveUTxO?.amount ? asQuantity(receiveUTxO.amount) : null
            const coinText = coin ? formatAdaWithText(coin, wallet.primaryToken) : null
            const assets = coinText ? [coinText] : []

            return (
              <InputOutputRow
                key={index}
                assets={assets.filter(Boolean)}
                txIndex={input.index}
                txHash={input.transaction_id}
                isOwnAddress={!!receiveUTxO}
                address={address}
              />
            )
          })}
        <Spacer height={16} />
        <View style={styles.divider} />
        <Spacer height={16} />
        <View style={styles.feeArea}>
          <FeeChip />
          <Text>{formatAdaWithText(asQuantity(data?.body?.fee ?? '0'), wallet.primaryToken)}</Text>
        </View>
        <Spacer height={16} />
        <Dropdown open={outputsOpen} onPress={() => setOutputsOpen((o) => !o)}>
          <Text style={styles.dropdownText}>{`Outputs (${outputs.length})`}</Text>
        </Dropdown>
        {outputsOpen && <Spacer height={16} />}
        {outputsOpen &&
          outputs.map((output, index) => {
            const address = output.address
            const coin = asQuantity(output.amount.coin)
            const coinText = formatAdaWithText(coin, wallet.primaryToken)
            const assets = coinText ? [coinText] : []

            return (
              <InputOutputRow
                key={index}
                assets={assets.filter(Boolean)}
                isOwnAddress={isOwnedAddress(address)}
                address={address}
              />
            )
          })}
      </ScrollView>
      <View style={[styles.buttonArea, {borderTopWidth: scrollbarShown ? 1 : 0}]}>
        <Button title={'Confirm'} shelleyTheme onPress={handleOnConfirm} />
      </View>
    </SafeAreaView>
  )
}

const Dropdown = ({children, open, onPress}: {children: React.ReactNode; open: boolean; onPress?: () => void}) => {
  const {styles, colors} = useStyles()
  return (
    <TouchableOpacity style={styles.dropdown} onPress={onPress}>
      <View>{children}</View>
      <View>
        <Icon.Chevron size={24} color={colors.dropdownIcon} direction={open ? 'up' : 'down'} />
      </View>
    </TouchableOpacity>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    dropdown: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: 24,
    },
    buttonArea: {
      ...atoms.p_lg,
      borderColor: color.gray_c200,
    },
    divider: {
      height: 1,
      backgroundColor: color.gray_c200,
    },
    dropdownText: {
      ...atoms.font_semibold,
      fontSize: 16,
      lineHeight: 24,
    },
    chip: {
      flexWrap: 'wrap',
    },
    chipText: {
      color: color.gray_cmin,
      paddingRight: 8,
      paddingLeft: 8,
      borderRadius: 12,
      overflow: 'hidden',
      height: 24,
    },
    feeArea: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
  })
  const colors = {
    dropdownIcon: color.gray_c900,
    ownAddress: color.primary_c500,
    foreignAddress: color.gray_c900,
    fee: color.sys_magenta_c500,
  }
  return {styles, colors}
}

const InputOutputRow = ({
  address,
  txHash,
  txIndex,
  isOwnAddress,
  assets,
}: {
  address?: string
  txHash?: string
  txIndex?: number
  isOwnAddress: boolean
  assets: string[]
}) => {
  const {styles, colors} = useStyles()
  const shortAddress = address ? shorten(address, 30) : null
  const shortTxHash = txHash ? shorten(txHash, 30) : null
  return (
    <View>
      <View>{isOwnAddress ? <OwnAddressChip /> : <ForeignAddressChip />}</View>
      <Spacer height={8} />
      {shortAddress !== null && (
        <View>
          <Text>{shortAddress}</Text>
        </View>
      )}
      {shortTxHash !== null && (
        <View>
          <Text>{`${shortTxHash}#${txIndex}`}</Text>
        </View>
      )}
      <Spacer height={4} />
      {assets.map((asset, index) => {
        return (
          <View key={index}>
            <Text style={{textAlign: 'right'}}>{asset}</Text>
          </View>
        )
      })}
    </View>
  )
}

const OwnAddressChip = () => {
  const {styles, colors} = useStyles()
  const backgroundColor = colors.ownAddress
  const text = 'Your address'
  return (
    <View style={styles.chip}>
      <Text style={[styles.chipText, {backgroundColor}]}>{text}</Text>
    </View>
  )
}

const ForeignAddressChip = () => {
  const {styles, colors} = useStyles()
  const backgroundColor = colors.foreignAddress
  const text = 'External address'
  return (
    <View style={styles.chip}>
      <Text style={[styles.chipText, {backgroundColor}]}>{text}</Text>
    </View>
  )
}

const FeeChip = () => {
  const {styles, colors} = useStyles()
  const backgroundColor = colors.fee
  const text = 'Transaction fee'
  return (
    <View style={styles.chip}>
      <Text style={[styles.chipText, {backgroundColor}]}>{text}</Text>
    </View>
  )
}

const shorten = (s: string, n: number) => {
  if (s.length > n) {
    return `${s.substring(0, Math.floor(n / 2))}...${s.substring(s.length - Math.floor(n / 2))}`
  }

  return s
}

const useConnectorPromptRootKey = () => {
  const promptRootKey = usePromptRootKey()

  return React.useCallback(() => {
    return new Promise<string>((resolve, reject) => {
      let shouldResolveOnClose = true

      try {
        promptRootKey({
          onConfirm: (rootKey) => {
            resolve(rootKey)
            shouldResolveOnClose = false
            return Promise.resolve()
          },
          onClose: () => {
            if (shouldResolveOnClose) reject(new Error('User rejected'))
          },
        })
      } catch (error) {
        reject(error)
      }
    })
  }, [promptRootKey])
}

const useSignTxWithHW = () => {
  const {confirmHWConnection, closeModal} = useConfirmHWConnectionModal()
  const {wallet, meta} = useSelectedWallet()

  return React.useCallback(
    (cbor: string, partial?: boolean) => {
      return new Promise<Transaction>((resolve, reject) => {
        let shouldResolveOnClose = true
        confirmHWConnection({
          onConfirm: async ({transportType, deviceInfo}) => {
            try {
              const cip30 = cip30LedgerExtensionMaker(wallet, meta)
              const tx = await cip30.signTx(cbor, partial ?? false, deviceInfo, transportType === 'USB')
              shouldResolveOnClose = false
              return resolve(tx)
            } catch (error) {
              reject(error)
            } finally {
              closeModal()
            }
          },
          onClose: () => {
            if (shouldResolveOnClose) reject(new Error('User rejected'))
          },
        })
      })
    },
    [confirmHWConnection, wallet, meta, closeModal],
  )
}

const useSignDataWithHW = () => {
  const {showHWNotSupportedModal, closeModal} = useShowHWNotSupportedModal()

  return React.useCallback(() => {
    return new Promise<{signature: string; key: string}>((_resolve, reject) => {
      let shouldResolveOnClose = true
      showHWNotSupportedModal({
        onConfirm: () => {
          closeModal()
          shouldResolveOnClose = false
          return reject(new Error('User rejected'))
        },
        onClose: () => {
          if (shouldResolveOnClose) reject(new Error('User rejected'))
        },
      })
    })
  }, [showHWNotSupportedModal, closeModal])
}
