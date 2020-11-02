import { parseUnits } from '@ethersproject/units'
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
    const amountBn = parseUnits(amount.toString(), 18)
    if (amountBn.lt(allowance)) {
      return console.log('No approval needed')
    }

    console.log('Approval needed.')
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
    const { error, tx: approvalTx } = await approveAuction({
      amount,
      auctionAddress,
    })
    if (error) throw error.message

    const { walletProvider } = await unlockBrowser({
      debug: true,
    })
    const auction = new Contract(
      auctionAddress,
      Emanator.abi,
      walletProvider.getSigner()
    )
    const bidTx = await auction.bid(parseUnits(amount.toString(), 18))

    return { bidTx, approvalTx }
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
    console.log(err)
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
    const currentGeneration = await auction.currentGeneration()
    const {
      highBid,
      highBidder,
      lastBidTime,
    } = await auction.getCurrentAuctionInfo()
    const endTime = auction.checkEndTime()
    const auctionBalance = await auction.getAuctionBalance()
    return { endTime, auctionBalance, highBid, highBidder, lastBidTime }
  } catch (err) {
    console.log(err)
    return {
      ...getErrorResponse(err, 'getAuctionDetails'),
    }
  }
}
