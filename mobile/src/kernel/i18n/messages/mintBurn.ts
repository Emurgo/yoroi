import {defineMessages} from 'react-intl'

export const mintBurnMessages = defineMessages({
  tabsMint: {
    id: 'mintBurn.tabs.mint',
    defaultMessage: '!!!Mint',
  },
  tabsMyTokens: {
    id: 'mintBurn.tabs.myTokens',
    defaultMessage: '!!!My Tokens',
  },
  mintTokenType: {
    id: 'mintBurn.mint.tokenType',
    defaultMessage: '!!!Token Type',
  },
  mintTokenTypeFt: {
    id: 'mintBurn.mint.tokenType.ft',
    defaultMessage: '!!!Fungible Token (FT)',
  },
  mintTokenTypeNft: {
    id: 'mintBurn.mint.tokenType.nft',
    defaultMessage: '!!!NFT',
  },
  mintFtTokenName: {
    id: 'mintBurn.mint.ft.tokenName',
    defaultMessage: '!!!Token Name',
  },
  mintFtTokenNamePlaceholder: {
    id: 'mintBurn.mint.ft.tokenNamePlaceholder',
    defaultMessage: '!!!e.g., MyToken',
  },
  mintFtQuantity: {
    id: 'mintBurn.mint.ft.quantity',
    defaultMessage: '!!!Quantity',
  },
  mintFtQuantityPlaceholder: {
    id: 'mintBurn.mint.ft.quantityPlaceholder',
    defaultMessage: '!!!e.g., 1000000',
  },
  mintFtDecimals: {
    id: 'mintBurn.mint.ft.decimals',
    defaultMessage: '!!!Decimals',
  },
  mintFtDecimalsPlaceholder: {
    id: 'mintBurn.mint.ft.decimalsPlaceholder',
    defaultMessage: '!!!e.g., 6',
  },
  mintFtImage: {
    id: 'mintBurn.mint.ft.image',
    defaultMessage: '!!!Image (64x64)',
  },
  mintFtDescription: {
    id: 'mintBurn.mint.ft.description',
    defaultMessage: '!!!Description (Optional)',
  },
  mintFtDescriptionPlaceholder: {
    id: 'mintBurn.mint.ft.descriptionPlaceholder',
    defaultMessage: '!!!Token description',
  },
  mintNftAssetName: {
    id: 'mintBurn.mint.nft.assetName',
    defaultMessage: '!!!Asset Name',
  },
  mintNftAssetNamePlaceholder: {
    id: 'mintBurn.mint.nft.assetNamePlaceholder',
    defaultMessage: '!!!e.g., MyNFT #1',
  },
  mintNftImageUrl: {
    id: 'mintBurn.mint.nft.imageUrl',
    defaultMessage: '!!!Image URL',
  },
  mintNftImageUrlPlaceholder: {
    id: 'mintBurn.mint.nft.imageUrlPlaceholder',
    defaultMessage: '!!!https://... or ipfs://...',
  },
  mintNftName: {
    id: 'mintBurn.mint.nft.name',
    defaultMessage: '!!!Name',
  },
  mintNftNamePlaceholder: {
    id: 'mintBurn.mint.nft.namePlaceholder',
    defaultMessage: '!!!e.g., My Awesome NFT',
  },
  mintNftDescription: {
    id: 'mintBurn.mint.nft.description',
    defaultMessage: '!!!Description (Optional)',
  },
  mintNftDescriptionPlaceholder: {
    id: 'mintBurn.mint.nft.descriptionPlaceholder',
    defaultMessage: '!!!NFT description',
  },
  mintSubmit: {
    id: 'mintBurn.mint.submit',
    defaultMessage: '!!!Mint Token',
  },
  mintSubmitting: {
    id: 'mintBurn.mint.submitting',
    defaultMessage: '!!!Minting...',
  },
  myTokensNoTokens: {
    id: 'mintBurn.myTokens.noTokens',
    defaultMessage: '!!!No tokens found',
  },
  myTokensPolicyId: {
    id: 'mintBurn.myTokens.policyId',
    defaultMessage: '!!!Policy ID',
  },
  myTokensQuantity: {
    id: 'mintBurn.myTokens.quantity',
    defaultMessage: '!!!Quantity',
  },
  myTokensBurnQuantity: {
    id: 'mintBurn.myTokens.burnQuantity',
    defaultMessage: '!!!Burn Quantity',
  },
  myTokensBurn: {
    id: 'mintBurn.myTokens.burn',
    defaultMessage: '!!!Burn',
  },
  myTokensBurning: {
    id: 'mintBurn.myTokens.burning',
    defaultMessage: '!!!Burning...',
  },
  errorsInvalidUrl: {
    id: 'mintBurn.errors.invalidUrl',
    defaultMessage:
      '!!!Invalid image URL. Must start with https://, ipfs://, ar://, or data:',
  },
  errorsInvalidImage: {
    id: 'mintBurn.errors.invalidImage',
    defaultMessage:
      '!!!Invalid image format. Must be PNG, JPEG, GIF, WebP, SVG, or TIFF',
  },
  errorsInvalidQuantity: {
    id: 'mintBurn.errors.invalidQuantity',
    defaultMessage: '!!!Quantity must be a positive number',
  },
  errorsInvalidDecimals: {
    id: 'mintBurn.errors.invalidDecimals',
    defaultMessage: '!!!Decimals must be between 0 and 19',
  },
  errorsMissingFields: {
    id: 'mintBurn.errors.missingFields',
    defaultMessage: '!!!Please fill in all required fields',
  },
})
