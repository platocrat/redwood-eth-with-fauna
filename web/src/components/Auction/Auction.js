import { useMutation, useFlash } from '@redwoodjs/web'
import NewAuction from 'src/components/NewAuction'

import styled from 'styled-components'

import { QUERY } from 'src/components/AuctionsCell'

import { bid, settleAndBeginAuction } from 'src/web3/auction'

/* @component */
export const CenteredContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  text-align: center;
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

const getProgressBar = (status, winLength) => {
  let barText = '<TIME LEFT / PROGRESS BAR>'
  let subText = `Auction win time: ${winLength} seconds`
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

const getPromptBox = (
  status,
  isHighBidder,
  highBid,
  winLength,
  auctionAddress
) => {
  const bidAmount = highBid ? Number(highBid) + 5 : '0'
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

  return (
    <CenteredContainer>
      <div className="rw-segment">
        <h1>
          <b>{auction.name}</b>
        </h1>
        <h3>Generation: {auction.currentGeneration}</h3>
        {getProgressBar(status, auction.winLength)}
        {getPromptBox(
          status,
          false,
          auction.highBid,
          auction.winLength,
          auction.address
        )}
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
      </div>
      <nav className="rw-button-group"></nav>
    </CenteredContainer>
  )
}

export default Auction
