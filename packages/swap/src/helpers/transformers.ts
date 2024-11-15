import AssetFingerprint from '@emurgo/cip14-js'
import {AssetNameUtils} from '@emurgo/yoroi-lib/dist/internals/utils/assets'

export const asTokenFingerprint = ({
  policyId,
  assetNameHex = '',
}: {
  policyId: string
  assetNameHex: string | undefined
}) => {
  const assetFingerprint = AssetFingerprint.fromParts(
    Buffer.from(policyId, 'hex'),
    Buffer.from(assetNameHex, 'hex'),
  )
  return assetFingerprint.fingerprint()
}

export const asTokenName = (hex: string) => {
  const {asciiName, hexName} = AssetNameUtils.resolveProperties(hex)
  return asciiName ?? hexName
}
