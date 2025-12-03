import {YoroiWallet} from '@yoroi/cardano-wallet/types'
import {isNft} from '@yoroi/portfolio'
import {handleApiConfig} from '@yoroi/resolver'
import {Balance, Portfolio} from '@yoroi/types'

/**
 * Extract policy ID from token ID
 * Token format: ${policyId}.${assetNameHex}
 */
function extractPolicyId(tokenId: Portfolio.Token.Id): string | null {
  const parts = tokenId.split('.')
  if (parts.length !== 2) return null
  const [policyId] = parts
  return policyId && policyId.length === 56 ? policyId : null
}

/**
 * Extract ADA handle name from NFT metadata
 * Metadata structure: { filteredMintMetadatum: { "721": { name: "$handle" } } }
 * or simplified: { name: "$handle" }
 */
function extractHandleNameFromMetadata(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== 'object') return null

  const meta = metadata as Record<string, unknown>

  try {
    // Check for filteredMintMetadatum.721.name structure
    const filtered = meta.filteredMintMetadatum
    if (filtered && typeof filtered === 'object') {
      const filteredObj = filtered as Record<string, unknown>
      const cip721 = filteredObj['721']
      if (cip721 && typeof cip721 === 'object') {
        const cip721Obj = cip721 as Record<string, unknown>
        const name = cip721Obj.name
        if (name) {
          const nameStr = Array.isArray(name) ? name.join('') : name
          if (typeof nameStr === 'string' && nameStr) {
            return nameStr
          }
        }
      }
    }

    // Check for direct name property
    const name = meta.name
    if (name) {
      const nameStr = Array.isArray(name) ? name.join('') : name
      if (typeof nameStr === 'string' && nameStr) {
        return nameStr
      }
    }

    return null
  } catch {
    return null
  }
}

/**
 * Get ADA handles owned by a wallet
 */
export function getOwnWalletAdaHandles(
  wallet: YoroiWallet,
): Array<{domain: string; isOwnWallet: true}> {
  const handles: Array<{domain: string; isOwnWallet: true}> = []
  const balances = wallet.balances()

  // Determine which policy ID to use based on network
  const handlePolicyId = wallet.isMainnet
    ? handleApiConfig.mainnet.policyId
    : handleApiConfig.preprod.policyId

  // Iterate through all NFT tokens
  for (const balance of balances.nfts) {
    const tokenInfo = balance.info

    // Extract policy ID from token ID (format: ${policyId}.${assetNameHex})
    const tokenPolicyId = extractPolicyId(tokenInfo.id)
    const idStartsWithPolicyId = tokenInfo.id.startsWith(handlePolicyId)

    // Check if it's an ADA handle NFT by matching policy ID
    const matchesPolicyId =
      tokenPolicyId === handlePolicyId || idStartsWithPolicyId

    if (isNft(tokenInfo) && matchesPolicyId) {
      // Try to get handle name from tokenInfo.name first (already normalized)
      let handleName: string | null = tokenInfo.name || null

      // If not found, try to extract from metadata
      if (!handleName) {
        // balance.info is Balance.TokenInfo which has metadatas, but tokenInfo is Portfolio.Token.Info
        const balanceInfo = balance.info as unknown as Balance.TokenInfo
        const metadata = balanceInfo.metadatas?.mintNft
        if (metadata) {
          handleName = extractHandleNameFromMetadata(metadata)
        }
      }

      if (handleName) {
        handles.push({domain: handleName, isOwnWallet: true})
      }
    }
  }

  return handles
}

/**
 * Get all domains/handles owned by a wallet
 * Currently only supports ADA handles
 * Unstoppable domains support can be added later if they are NFTs
 */
export function getOwnWalletDomains(
  wallet: YoroiWallet,
): Array<{domain: string; isOwnWallet: true}> {
  return getOwnWalletAdaHandles(wallet)
}
