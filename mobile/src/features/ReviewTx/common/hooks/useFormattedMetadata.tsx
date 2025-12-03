import {CardanoMobileWrapped} from '@yoroi/cardano-wallet/wrappedCsl'
import {isString} from '@yoroi/common'

import {MetadataJsonSchema} from '@emurgo/cross-csl-core'
import {Buffer} from 'buffer'
import * as React from 'react'

import {FormattedMetadata, TransactionBody} from '../types'

export const formatMetadata = (
  cbor: string | null,
  txBody: TransactionBody,
): FormattedMetadata => {
  const hash = txBody.auxiliary_data_hash ?? null
  let metadata = null
  let allLabels: Record<string, unknown> | null = null
  let scripts: Array<{scriptHash: string; scriptBytes: string}> | null = null

  if (cbor != null && hash != null) {
    CardanoMobileWrapped.cslScope((csl) => {
      const tx = csl.Transaction.fromHex(cbor)
      const auxiliaryData = tx.auxiliaryData()

      if (!auxiliaryData) return

      // Extract all metadata labels
      const txMetadata = auxiliaryData.metadata()
      if (txMetadata) {
        const labels: Record<string, unknown> = {}
        const keys = txMetadata.keys()

        for (let i = 0; i < keys.len(); i++) {
          const key = keys.get(i)
          if (!key) continue

          const metadatum = txMetadata.get(key)
          if (!metadatum) continue

          try {
            const decodedMetadata = csl.decodeMetadatumToJsonStr(
              metadatum,
              MetadataJsonSchema.BasicConversions,
            )
            const labelStr = key.toStr()
            labels[labelStr] = JSON.parse(decodedMetadata)

            // Extract CIP-674 metadata for backward compatibility
            if (labelStr === '674') {
              const msg = [parseMsg(JSON.parse(decodedMetadata)?.msg ?? [''])]
              metadata = {msg}
            }
          } catch {
            // If decoding fails, store raw value as hex
            try {
              labels[key.toStr()] = Buffer.from(metadatum.toBytes()).toString(
                'hex',
              )
            } catch {
              // Ignore if even hex conversion fails
            }
          }
        }

        if (Object.keys(labels).length > 0) {
          allLabels = labels
        }
      }

      // Extract scripts from auxiliary data
      const nativeScripts = auxiliaryData.nativeScripts()
      const plutusScripts = auxiliaryData.plutusScripts()

      if (nativeScripts || plutusScripts) {
        scripts = []

        if (nativeScripts) {
          for (let i = 0; i < nativeScripts.len(); i++) {
            const script = nativeScripts.get(i)
            if (!script) continue

            try {
              scripts.push({
                scriptHash: script.hash().toHex(),
                scriptBytes: Buffer.from(script.toBytes()).toString('hex'),
              })
            } catch {
              // Ignore if extraction fails
            }
          }
        }

        if (plutusScripts) {
          for (let i = 0; i < plutusScripts.len(); i++) {
            const script = plutusScripts.get(i)
            if (!script) continue

            try {
              scripts.push({
                scriptHash: script.hash().toHex(),
                scriptBytes: Buffer.from(script.toBytes()).toString('hex'),
              })
            } catch {
              // Ignore if extraction fails
            }
          }
        }

        if (scripts.length === 0) {
          scripts = null
        }
      }
    })
  }

  return {
    hash,
    metadata,
    allLabels,
    scripts,
  }
}

const parseMsg = (msg: Array<string> | string): string => {
  const messageToParse = Array.isArray(msg) ? msg.join('') : msg

  try {
    const parsed: unknown = JSON.parse(messageToParse)
    if (isString(parsed)) return parsed
    return JSON.stringify(parsed)
  } catch {
    return messageToParse
  }
}

export const useFormattedMetadata = ({
  cbor,
  txBody,
}: {
  cbor: string | null
  txBody: TransactionBody | null
}) => {
  return React.useMemo(() => {
    if (txBody == null) {
      return {hash: null, metadata: null, allLabels: null, scripts: null}
    }
    return formatMetadata(cbor, txBody)
  }, [cbor, txBody])
}
