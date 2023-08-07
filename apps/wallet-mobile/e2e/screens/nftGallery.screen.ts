import {by, element} from 'detox'

export const iconSearch = () => element(by.id('iconSearch'))
export const inputSearch = () => element(by.id('inputSearch'))

export const cardNFT = (nftName: string) => element(by.id(`card_nft_${nftName}`))

export const countNftsDisplayedAndroid = async() => {
    let i=1
    const max=10
    let exit = false
   
   try {
     let nft = await element(by.id(/^card_nft_[a-zA-Z0-9_ ]+$/)).atIndex(0).getAttributes()    
     while(!exit && i< max){
        try{
            nft = await element(by.id(/^card_nft_[a-zA-Z0-9_ ]+$/)).atIndex(i).getAttributes()
            console.log(nft)
            i++
        }catch(e){
             exit = true
        }
     }
   } catch (e) {
      console.log('No NFTs found')
   }
   console.log('Total Number of NFTS displayed: ',i)
   return i
}
