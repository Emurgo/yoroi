import {expect} from 'chai'
import * as sinon from 'ts-sinon'

import {mockWallet} from '../../storybook/mocks/wallet'
import {TxStatusRequest, TxStatusResponse} from '../legacy/types'
import {fetchTxStatus} from '.'

describe('fetchTxStatus', () => {
  // it means that the tx was sent to node and processed
  it('should return success when depth > 0', async () => {
    // arrange
    const txId = '12366dd454b4793d83d554329245d4bc67659f6f0468bb0e0d41f1ac6f496999'
    const requestShouldBe: TxStatusRequest = {
      txHashes: [txId],
    }
    const wallet = sinon.stubObject(mockWallet, {
      fetchTxStatus: Promise.resolve({
        depth: {'12366dd454b4793d83d554329245d4bc67659f6f0468bb0e0d41f1ac6f496999': 1},
      } as TxStatusResponse),
    })

    // act
    const result = await fetchTxStatus(wallet, txId)

    // assert
    expect(wallet.fetchTxStatus.alwaysCalledWith(requestShouldBe)).to.be.true
    expect(wallet.fetchTxStatus.callCount).to.be.equal(1)
    expect(result).to.be.eql({
      status: 'SUCCESS',
    })
  })

  // the node returned an unrecoverable error i.e utxo already consumed
  it('should return error when submission status has failed', async () => {
    // arrange
    const txId = '12366dd454b4793d83d554329245d4bc67659f6f0468bb0e0d41f1ac6f496999'
    const requestShouldBe: TxStatusRequest = {
      txHashes: [txId],
    }
    const wallet = sinon.stubObject(mockWallet, {
      fetchTxStatus: Promise.resolve({
        depth: {},
        submissionStatus: {
          '12366dd454b4793d83d554329245d4bc67659f6f0468bb0e0d41f1ac6f496999': {status: 'FAILED'},
        },
      } as unknown as TxStatusResponse),
    })

    // act
    const result = await fetchTxStatus(wallet, txId)

    // assert
    expect(wallet.fetchTxStatus.alwaysCalledWith(requestShouldBe)).to.be.true
    expect(wallet.fetchTxStatus.callCount).to.be.equal(1)
    expect(result).to.be.eql({
      status: 'FAILED',
    })
  })

  // unabled to reach the node X times
  it('should return error when max retries failed', async () => {
    // arrange
    const txId = '12366dd454b4793d83d554329245d4bc67659f6f0468bb0e0d41f1ac6f496999'
    const requestShouldBe: TxStatusRequest = {
      txHashes: [txId],
    }
    const wallet = sinon.stubObject(mockWallet, {
      fetchTxStatus: Promise.resolve({
        depth: {},
        submissionStatus: {
          '12366dd454b4793d83d554329245d4bc67659f6f0468bb0e0d41f1ac6f496999': {status: 'MAX_RETRY_REACHED'},
        },
      } as unknown as TxStatusResponse),
    })

    // act
    const result = await fetchTxStatus(wallet, txId)

    // assert
    expect(wallet.fetchTxStatus.alwaysCalledWith(requestShouldBe)).to.be.true
    expect(wallet.fetchTxStatus.callCount).to.be.equal(1)
    expect(result).to.be.eql({
      status: 'MAX_RETRY_REACHED',
    })
  })

  it('should return waiting when does not want to wait for processig', async () => {
    // arrange
    const txId = '12366dd454b4793d83d554329245d4bc67659f6f0468bb0e0d41f1ac6f496999'
    const requestShouldBe: TxStatusRequest = {
      txHashes: [txId],
    }
    const wallet = sinon.stubObject(mockWallet, {
      fetchTxStatus: Promise.resolve({
        depth: {},
        submissionStatus: {'12366dd454b4793d83d554329245d4bc67659f6f0468bb0e0d41f1ac6f496999': {status: 'WAITING'}},
      } as unknown as TxStatusResponse),
    })

    // act
    const result = await fetchTxStatus(wallet, txId)

    // assert
    expect(wallet.fetchTxStatus.alwaysCalledWith(requestShouldBe)).to.be.true
    expect(wallet.fetchTxStatus.callCount).to.be.equal(1)
    expect(result).to.be.eql({
      status: 'WAITING',
    })
  })

  // empty return whould waiting and return waiting
  it('should return waiting when no submission nor depth data is returned', async () => {
    // arrange
    const waitProcessing = true
    const txId = '12366dd454b4793d83d554329245d4bc67659f6f0468bb0e0d41f1ac6f496999'
    const requestShouldBe: TxStatusRequest = {
      txHashes: [txId],
    }
    const wallet = sinon.stubObject(mockWallet, {
      fetchTxStatus: Promise.resolve({
        depth: {},
      } as TxStatusResponse),
    })

    // act
    const result = await fetchTxStatus(wallet, txId, waitProcessing)

    // assert
    expect(wallet.fetchTxStatus.alwaysCalledWith(requestShouldBe)).to.be.true
    expect(wallet.fetchTxStatus.callCount).to.be.equal(5)
    expect(result).to.be.eql({
      status: 'WAITING',
    })
  })

  describe('waitProcessing = true', () => {
    // waited till the end and still not processed
    it('should return waiting after max retries and not processed', async () => {
      // arrange
      const waitProcessing = true
      const txId = '12366dd454b4793d83d554329245d4bc67659f6f0468bb0e0d41f1ac6f496999'
      const requestShouldBe: TxStatusRequest = {
        txHashes: [txId],
      }
      const wallet = sinon.stubObject(mockWallet, {
        fetchTxStatus: Promise.resolve({
          depth: {},
          submissionStatus: {'12366dd454b4793d83d554329245d4bc67659f6f0468bb0e0d41f1ac6f496999': {status: 'WAITING'}},
        } as unknown as TxStatusResponse),
      })

      // act
      const result = await fetchTxStatus(wallet, txId, waitProcessing)

      // assert
      expect(wallet.fetchTxStatus.alwaysCalledWith(requestShouldBe)).to.be.true
      expect(wallet.fetchTxStatus.callCount).to.be.equal(5)
      expect(result).to.be.eql({
        status: 'WAITING',
      })
    })

    it('should return success if processed while waiting', async () => {
      // arrange
      const waitProcessing = true
      const txId = '12366dd454b4793d83d554329245d4bc67659f6f0468bb0e0d41f1ac6f496999'
      const requestShouldBe: TxStatusRequest = {
        txHashes: [txId],
      }
      const wallet = sinon.stubObject(mockWallet)
      wallet.fetchTxStatus
        .onFirstCall()
        .resolves({
          depth: {},
          submissionStatus: {'12366dd454b4793d83d554329245d4bc67659f6f0468bb0e0d41f1ac6f496999': {status: 'WAITING'}},
        } as unknown as TxStatusResponse)
        .onSecondCall()
        .resolves({
          depth: {},
          submissionStatus: {'12366dd454b4793d83d554329245d4bc67659f6f0468bb0e0d41f1ac6f496999': {status: 'SUCCESS'}},
        } as unknown as TxStatusResponse)

      // act
      const result = await fetchTxStatus(wallet, txId, waitProcessing)

      // assert
      expect(wallet.fetchTxStatus.alwaysCalledWith(requestShouldBe)).to.be.true
      expect(wallet.fetchTxStatus.callCount).to.be.equal(2)
      expect(result).to.be.eql({
        status: 'SUCCESS',
      })
    })
    it('should return failed if rejected by the node while waiting', async () => {
      // arrange
      const waitProcessing = true
      const txId = '12366dd454b4793d83d554329245d4bc67659f6f0468bb0e0d41f1ac6f496999'
      const requestShouldBe: TxStatusRequest = {
        txHashes: [txId],
      }
      const wallet = sinon.stubObject(mockWallet)
      wallet.fetchTxStatus
        .onFirstCall()
        .resolves({
          depth: {},
          submissionStatus: {'12366dd454b4793d83d554329245d4bc67659f6f0468bb0e0d41f1ac6f496999': {status: 'WAITING'}},
        } as unknown as TxStatusResponse)
        .onSecondCall()
        .resolves({
          depth: {},
          submissionStatus: {'12366dd454b4793d83d554329245d4bc67659f6f0468bb0e0d41f1ac6f496999': {status: 'FAILED'}},
        } as unknown as TxStatusResponse)

      // act
      const result = await fetchTxStatus(wallet, txId, waitProcessing)

      // assert
      expect(wallet.fetchTxStatus.alwaysCalledWith(requestShouldBe)).to.be.true
      expect(wallet.fetchTxStatus.callCount).to.be.equal(2)
      expect(result).to.be.eql({
        status: 'FAILED',
      })
    })
    it('should return max retries failed if queue was not able to send to the node while waiting', async () => {
      // arrange
      const waitProcessing = true
      const txId = '12366dd454b4793d83d554329245d4bc67659f6f0468bb0e0d41f1ac6f496999'
      const requestShouldBe: TxStatusRequest = {
        txHashes: [txId],
      }
      const wallet = sinon.stubObject(mockWallet)
      wallet.fetchTxStatus
        .onFirstCall()
        .resolves({
          depth: {},
          submissionStatus: {'12366dd454b4793d83d554329245d4bc67659f6f0468bb0e0d41f1ac6f496999': {status: 'WAITING'}},
        } as unknown as TxStatusResponse)
        .onSecondCall()
        .resolves({
          depth: {},
          submissionStatus: {
            '12366dd454b4793d83d554329245d4bc67659f6f0468bb0e0d41f1ac6f496999': {status: 'MAX_RETRY_REACHED'},
          },
        } as unknown as TxStatusResponse)

      // act
      const result = await fetchTxStatus(wallet, txId, waitProcessing)

      // assert
      expect(wallet.fetchTxStatus.alwaysCalledWith(requestShouldBe)).to.be.true
      expect(wallet.fetchTxStatus.callCount).to.be.equal(2)
      expect(result).to.be.eql({
        status: 'MAX_RETRY_REACHED',
      })
    })
  })
})
