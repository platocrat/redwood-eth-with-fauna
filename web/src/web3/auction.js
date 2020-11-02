import { parseUnits, formatUnits } from '@ethersproject/units'
import { Contract } from '@ethersproject/contracts'

import SuperfluidSDK from '@superfluid-finance/ethereum-contracts'

import Emanator from 'emanator-contracts/build/contracts/Emanator.json'
import ERC20 from '@superfluid-finance/ethereum-contracts/build/contracts/ERC20.json'

import { getErrorResponse } from './general'
import { unlockBrowser } from './connect'

export const approveAuction = async ({ amount, auctionAddress }) => {
  try {
    const { error, walletProvider, walletAddress } = await unlockBrowser({
      debug: true,
    })
    console.log('Checking approval...')
    const auction = new Contract(
      auctionAddress,
      Emanator.abi,
      walletProvider.getSigner()
    )
    const tokenAddress = await auction.tokenX()
    const token = new Contract(
      tokenAddress,
      ERC20.abi,
      walletProvider.getSigner()
    )
    // Skip approval if unnecessary
    const allowance = await token.allowance(walletAddress, auctionAddress)
    const amountBn = parseUnits('1000000000000', 18)
    if (allowance.gte(amountBn)) return { noApprovalNeeded: true }

    const tx = await token.approve(auctionAddress, amountBn)

    return { tx }
  } catch (err) {
    return {
      ...getErrorResponse(err, 'approve'),
    }
  }
}

export const bid = async ({ amount, auctionAddress }) => {
  try {
    const { error, tx: approvalTx, noApprovalNeeded } = await approveAuction({
      amount,
      auctionAddress,
    })
    if (error) throw error.message
    if (noApprovalNeeded) console.log('No approval needed')
    if (approvalTx) await approvalTx.wait()
    console.log('Bidding...')
    const { walletProvider } = await unlockBrowser({
      debug: true,
    })
    const auction = new Contract(
      auctionAddress,
      Emanator.abi,
      walletProvider.getSigner()
    )
    const bidTx = await auction.bid(parseUnits(amount.toString(), 18))

    return { bidTx }
  } catch (err) {
    console.log(err)
    return {
      ...getErrorResponse(err, 'bid'),
    }
  }
}

export const settleAndBeginAuction = async ({ auctionAddress }) => {
  try {
    const { error, walletProvider, walletAddress } = await unlockBrowser({
      debug: true,
    })
    const auction = new Contract(
      auctionAddress,
      Emanator.abi,
      walletProvider.getSigner()
    )
    const tx = await auction.settleAndBeginAuction()
    return { tx }
  } catch (err) {
    return {
      ...getErrorResponse(err, 'settleAndBeginAuction'),
    }
  }
}

export const getAuctionDetails = async ({ auctionAddress }) => {
  try {
    const { error, walletProvider, walletAddress } = await unlockBrowser({
      debug: true,
    })
    const auction = new Contract(auctionAddress, Emanator.abi, walletProvider)
    const {
      highBid,
      highBidder,
      lastBidTime,
    } = await auction.getCurrentAuctionInfo()
    const endTime = await auction.checkEndTime()
    const auctionBalance = await auction.getAuctionBalance()
    const currentGeneration = await auction.currentGeneration()
    let lastBidTimeFormatted = lastBidTime.toNumber() * 1000
    let endTimeFormatted = endTime.toNumber() * 1000

    if (lastBidTimeFormatted === 0) {
      lastBidTimeFormatted = 'No bids yet'
      endTimeFormatted = lastBidTimeFormatted
    }

    return {
      highBidder,
      highBid: Number(formatUnits(highBid, 18)).toFixed(0),
      currentGeneration,
      endTime: endTimeFormatted,
      lastBidTime: lastBidTimeFormatted,
      auctionBalance: Number(formatUnits(auctionBalance, 18)).toFixed(0),
    }
  } catch (err) {
    return {
      ...getErrorResponse(err, 'getAuctionDetails'),
    }
  }
}
