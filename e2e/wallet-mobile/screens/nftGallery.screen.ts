import {by, element, expect} from 'detox'
import jestExpect from 'expect'

import * as utils from '../general/utils'

export const iconSearch = () => element(by.id('iconSearch'))
export const inputSearch = () => element(by.id('inputSearch'))
export const buttonBack = () => element(by.id('buttonBack'))
export const cardNFT = (nftName: string) => element(by.id(`card_nft_${nftName}`))
export const txtNftCount = () => element(by.id('txtNftCount'))
export const txtNoNftFound = () => element(by.text('No NFTs found'))

export const countNftsDisplayedAndroid = async (max = 10) => {
 let i = 0
 while (i < max) {
  try {
   await expect(element(by.id(/^card_nft_[a-zA-Z0-9_$. ]+$/)).atIndex(i)).toExist()
   i++
  } catch (e) {
   break
  }
 }
 await utils.addMsgToReport(`Total Number of NFTs counted: ${i}`)
 return i
}

export const checkAttributeNftAndroid = async (nftLabel: string, max = 10) => {
 let i = 0

 while (i < max) {
  try {
   await expect(element(by.id(/^card_nft_[a-zA-Z0-9_$. ]+$/)).atIndex(i)).toExist()
   const nftAttributes = await element(by.id(/^card_nft_[a-zA-Z0-9_$. ]+$/))
    .atIndex(i)
    .getAttributes()
   if ('label' in nftAttributes && nftAttributes.label?.toLowerCase().includes(nftLabel.toLowerCase())) return true
   i++
  } catch (e) {
   return false
  }
 }
}

export const countNftsDisplayedIos = async () => {
 let count = 0
 await expect(element(by.id(/^card_nft_[a-zA-Z0-9_.$ ]+$/))).toExist()
 const nftAttributes = await element(by.id(/^card_nft_[a-zA-Z0-9_.$ ]+$/)).getAttributes()
 if ('elements' in nftAttributes) {
  count = nftAttributes.elements.length
 } else {
  jestExpect(nftAttributes.visible).toBe(true)
  count = 1
 }
 await utils.addMsgToReport(`Total Number of NFTs counted: ${count}`)
 return count
}

// Note - use for iOS only
export const getElementAttributes = async (ele: Detox.IndexableNativeElement) => {
 let attributes: Detox.ElementAttributes | Detox.ElementAttributes[]

 const result = await ele.getAttributes()
 if ('elements' in result) {
  attributes = result.elements
 } else {
  attributes = result
 }
 return {
  attributes,
 }
}

export const verifyNftCount = async (ele: Detox.IndexableNativeElement, nftCountExp: number) => {
 const attributes = await ele.getAttributes()
 if ('label' in attributes) {
  await utils.addMsgToReport(`NFT count displayed : ${attributes.label}`)
  await utils.addMsgToReport(`NFT count expected :  ${nftCountExp}`)
  if (attributes.label?.includes(nftCountExp.toString())) {
   return true
  }
 }
 return false
}

export const checkAttributeOfNftIos = async (labelToCheck: string) => {
 let attributes: Detox.ElementAttributes | Detox.ElementAttributes[]

 const result = await element(by.id(/^card_nft_[a-zA-Z0-9_ ]+$/)).getAttributes()
 if ('elements' in result) {
  attributes = result.elements
  const matchingNFTs = attributes.filter((nft) => {
   return nft.label?.toLowerCase().includes(labelToCheck.toLowerCase())
  })
  if (matchingNFTs.length > 0) return true
 } else {
  attributes = result
  if (attributes.label?.includes(labelToCheck)) return true
 }

 return false
}
