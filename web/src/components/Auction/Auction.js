import { useState, useEffect } from 'react'
import { CountdownCircleTimer } from 'react-countdown-circle-timer'
import { useMutation, useFlash } from '@redwoodjs/web'
import NewAuction from 'src/components/NewAuction'
import Web3UserCell from 'src/components/Web3UserCell/Web3UserCell'
import styled from 'styled-components'


import { QUERY } from 'src/components/AuctionsCell'

import { bid, settleAndBeginAuction, timeLeft } from 'src/web3/auction'
import { unlockBrowser } from 'src/web3/connect'

/* @component */
export const CenteredContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  justify-content: center;
  width: 100%;
  text-align: center;
`
export const CountdownContainer = styled.div`
  display: inline-block;
  align-items: center;
  justify-content: center;
  width: 100%;
  text-align: center;
  color: #004777;
`

const timeTag = (datetime) => {
  return (
    <time dateTime={datetime} title={datetime}>
      {new Date(datetime).toUTCString()}
    </time>
  )
}

const checkboxInputTag = (checked) => {
  return <input type="checkbox" checked={checked} disabled />
}
/* 
const getCountdownComponent = (winLength) => {
  let timeLeft = winLength
  return (
    <>
    <CountdownCircleTimer 
        isPlaying
        duration ={timeLeft}
        initialRemainingTime={timeLeft}
        colors="#A30000"
      />
    </>
)}
*/

const getProgressBar = (status, winLength, timeLeft) => {
  let barText = '<TIME LEFT / PROGRESS BAR>'
  let subText = `Auction win time: ${winLength} seconds. This auction will end in ${timeLeft} seconds.`
  if (status === 'created') barText = 'Waiting for first Bid'
  if (status === 'ended') {
    barText = '🔨 Auction ended ⏳'
    subText = 'Waiting to start the next one'
  }
  return (
    <>
      <h3>{barText}</h3>
      {subText}
    </>
  )
}

const getCountdown = (timeLeft) => {
  return (
    <CountdownContainer>   
    <CountdownCircleTimer 
          isPlaying
          strokeWidth='18'
          duration={timeLeft}
          colors={[
            ['#004777', 0.4],
            ['#F7B801', 0.4],
            ['#A30000', 0.2],
          ]}
          onComplete={() => {
            console.log('Auction completed')
            return [false, 0]
          }} 
        >
        {({ timeLeft}) => (
          <div>
          There are 
          <br /> {timeLeft} 
          <br />seconds
          <br /> remaining
          </div>
        )}
    </CountdownCircleTimer>
    </CountdownContainer> 
  )
}

const getPromptBox = (
  status,
  isHighBidder,
  highBid,
  winLength,
  auctionAddress
) => {
  const bidAmount = typeof highBid === 'number' ? Number(highBid) + 5 : '0'
  let onClick = () => bid({ amount: bidAmount, auctionAddress })
  let estTotal = winLength
  let promptText = `Become the high bidder - Bid ${bidAmount} DAI`
  let buttonText = 'Bid'
  if (status === 'ended') {
    promptText = 'After settlement, a new auction will begin immediately'
    buttonText = 'Settle Auction'
    onClick = () => settleAndBeginAuction({ auctionAddress })
  }
  if (isHighBidder) promptText = 'You are the highest bidder!'

  return (
    <CenteredContainer>
      <p>{promptText}</p>
      <button className="rw-button" disabled={isHighBidder} onClick={onClick}>
        {buttonText}
      </button>
    </CenteredContainer>
  )
}

const Auction = ({ auction }) => {
  const { addMessage } = useFlash()
  const [walletAddress, setWalletAddress] = useState(null)

  const unlockWallet = async () => {
    const { walletAddress: address, error } = await unlockBrowser({
      debug: true,
    })
    if (error) console.log(error)
    setWalletAddress(address)
  }

  useEffect(() => {
    unlockWallet()
  }, [])

  return (
    <>
      <h1>
        <b>{auction.name}</b>
      </h1>
      <h3>Generation: {auction.currentGeneration}</h3>
      {getProgressBar(status, auction.winLength, auction.lastBidTime)}
      <br />
      {getCountdown(auction.winLength)}
      <br />
      {getPromptBox(
        auction.status,
        false,
        auction.highBid,
        auction.winLength,
        auction.address
      )}
      <p></p>
      {walletAddress && (
        <Web3UserCell
          address={walletAddress}
          auctionAddress={auction.address}
        />
      )}
      <p></p>
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">Details</h2>
      </header>
      <table className="rw-table">
        <tbody>
          <tr>
            <th>Curent Auction Revenue</th>
            <td>{auction.auctionBalance}</td>
          </tr>
          <tr>
            <th>High bid</th>
            <td>{auction.highBid}</td>
          </tr>
          <tr>
            <th>High bidder</th>
            <td>{auction.highBidder}</td>
          </tr>
          <tr>
            <th>Last bid time</th>
            <td>
              {typeof auction.lastBidTime === 'string'
                ? auction.lastBidTime
                : timeTag(auction.lastBidTime)}
            </td>
          </tr>
          <tr>
            <th>Auction close time</th>
            <td>
              {typeof auction.endTime === 'string'
                ? auction.endTime
                : timeTag(auction.endTime)}
            </td>
          </tr>
          <tr>
            <th>Description</th>
            <td>{auction.description}</td>
          </tr>
          <tr>
            <th>Address</th>
            <td>{auction.address}</td>
          </tr>
          <tr>
            <th>Owner</th>
            <td>{auction.owner}</td>
          </tr>
          <tr>
            <th>Launch date</th>
            <td>{timeTag(auction.createdAt)}</td>
          </tr>
        </tbody>
      </table>
    </>
  )
}

export default Auction
