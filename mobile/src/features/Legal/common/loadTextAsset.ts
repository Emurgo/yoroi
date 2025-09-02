import {Asset} from 'expo-asset'

export const loadTextAsset = async (assetModule: any): Promise<string> => {
  try {
    const asset = Asset.fromModule(assetModule)
    await asset.downloadAsync()

    if (asset.localUri) {
      const response = await fetch(asset.localUri)
      const text = await response.text()
      return text
    }

    throw new Error('Failed to load asset')
  } catch (error) {
    console.error('Error loading text asset:', error)
    return ''
  }
}
