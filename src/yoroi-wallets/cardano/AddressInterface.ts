export interface YoroiAddressInfoInterface<KeyHashes> {
  address: string
  getKeyHashes: () => Promise<KeyHashes | null>
}
