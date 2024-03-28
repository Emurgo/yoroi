import {by, element} from 'detox'

export const modal_ok_button = () => element(by.id('wallet:receive:oneTimeModal-ok-button'))
export const card_addresslist = (index: string) => element(by.id(`receive:small-address-card-${index}`))
//Address detail card
export const qrCodeImageAddressDetailCard = () => element(by.id('receive:address-detail-card-qr'))
export const titleAddressDetailsCard = () => element(by.id('receive:address-detail-card-title'))
export const requestSpecificAmountLink = () => element(by.id('receive:request-specific-amount-link'))

//request specific anmount screen
export const requestSpecificAmountInput = () => element(by.id('receive:request-specific-amount-ada-input'))
export const generateLinkButton = () => element(by.id('receive:request-specific-amount:generate-link-button'))

//request specific amount qrcode modal
export const qrCodeRequestSpecificAmount = () => element(by.id('receive:specific-amount-qr'))
export const titleRequestSpecificAmount = () => element(by.id('receive:specific-amount-title'))
export const requestSpecificAmountCopyLinkButton = () =>
 element(by.id('receive:request-specific-amount:copy-link-button'))

export const verifyAdaRequestedIsDisplayed = async (adaValue: string) => {
 let attributes: Detox.ElementAttributes | Detox.ElementAttributes[]

 const result = await element(by.id('receive:specific-amount-title')).getAttributes()
 if ('elements' in result) {
  attributes = result.elements
  const matchingNFTs = attributes.filter((qrModal) => {
   return qrModal.label?.toLowerCase().includes(adaValue.toLowerCase())
  })
  if (matchingNFTs.length > 0) return true
 } else {
  attributes = result
  if (attributes.label?.includes(adaValue)) return true
 }

 return false
}
