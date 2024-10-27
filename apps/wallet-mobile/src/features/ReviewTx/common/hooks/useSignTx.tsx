import {TransactionWitnessSet} from '@emurgo/cross-csl-core'
import {WalletMeta} from '@yoroi/types/lib/typescript/wallet/meta'
import * as React from 'react'

import {useModal} from '../../../../components/Modal/ModalContext'
import {cip30ExtensionMaker} from '../../../../yoroi-wallets/cardano/cip30/cip30'
import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
import {wrappedCsl} from '../../../../yoroi-wallets/cardano/wrappedCsl'
import {useStrings} from '../../../Discover/common/useStrings'
import {ConfirmRawTxWithOs} from '../../../Swap/common/ConfirmRawTx/ConfirmRawTxWithOs'
import {ConfirmRawTxWithPassword} from '../../../Swap/common/ConfirmRawTx/ConfirmRawTxWithPassword'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'

export const useSignTx = () => {
  const {openModal, closeModal} = useModal()
  const {meta, wallet} = useSelectedWallet()
  const strings = useStrings()
  const modalHeight = 350

  return React.useCallback(
    (cbor: string) => {
      const handleOnConfirm = async (rootKey: string) => {
        console.log('signTx-123')
        const witnesses = await signTx(Buffer.from(cbor).toString('hex'), rootKey, wallet, meta)

        if (!witnesses) throw new Error('kdkdkdk')
        await submitTx(cbor, witnesses, wallet)
        closeModal()
        return
      }

      if (meta.isHW) {
        throw new Error('Not implemented yet')
      }

      if (meta.isEasyConfirmationEnabled) {
        openModal(strings.confirmTx, <ConfirmRawTxWithOs onConfirm={handleOnConfirm} />, modalHeight)
        return
      }

      openModal(strings.confirmTx, <ConfirmRawTxWithPassword onConfirm={handleOnConfirm} />, modalHeight)
    },
    [meta, openModal, strings.confirmTx, wallet, closeModal],
  )
}

export const signTx = async (cbor: string, rootKey: string, wallet: YoroiWallet, meta: WalletMeta) => {
  const cip30 = cip30ExtensionMaker(wallet, meta)
  try {
    return cip30.signTx(rootKey, cbor, false)
  } catch {
    console.log('smksksksksk')
  }
}

export const submitTx = async (cbor: string, witnesses: TransactionWitnessSet, wallet: YoroiWallet) => {
  const {csl, release} = wrappedCsl()

  try {
    const tx = await csl.Transaction.fromHex(cbor)
    const txBody = await tx.body()
    const signedTx = await csl.Transaction.new(txBody, witnesses, undefined)
    const signedTxBytes = await signedTx.toBytes()

    await wallet.submitTransaction(Buffer.from(signedTxBytes).toString('base64'))
  } finally {
    release()
  }
}
