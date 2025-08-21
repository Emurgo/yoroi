export type HWDeviceInfo = {
  bip44AccountPublic: string
  hwFeatures: HWFeatures
}

export type HWFeatures = {
  vendor: string
  model: string
  deviceId: string | null | undefined
  // for establishing a connection through BLE
  deviceObj: HWDeviceObj | null | undefined
  // for establishing a connection through USB
  serialHex?: string
}

export type HWDeviceObj = {
  vendorId: number
  productId: number
}
