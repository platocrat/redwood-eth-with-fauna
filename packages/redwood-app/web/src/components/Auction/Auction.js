import { useMutation, useFlash } from '@redwoodjs/web'
import { Link, routes, navigate } from '@redwoodjs/router'

import styled from 'styled-components'

import { QUERY } from 'src/components/AuctionsCell'

/* @component */
export const CenteredContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  text-align: center;
`

const jsonDisplay = (obj) => {
  return (
    <pre>
      <code>{JSON.stringify(obj, null, 2)}</code>
    </pre>
  )
}

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

const Auction = ({ auction }) => {
  const { addMessage } = useFlash()

  return (
    <CenteredContainer>
      <div className="rw-segment">
        <h1>
          Auction for <i>{auction.name}</i>
        </h1>

        <header className="rw-segment-header">
          <h2 className="rw-heading rw-heading-secondary">Details</h2>
        </header>
        <table className="rw-table">
          <tbody>
            <tr>
              <th>Description</th>
              <td>{auction.description}</td>
            </tr>
            <tr>
              <th>Win Time (seconds)</th>
              <td>{auction.winLength}</td>
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
              <th>Created at</th>
              <td>{timeTag(auction.createdAt)}</td>
            </tr>
            <tr>
              <th>Status</th>
              <td>{auction.status}</td>
            </tr>
            <tr>
              <th>High bid</th>
              <td>{auction.highBid}</td>
            </tr>
            <tr>
              <th>Generation</th>
              <td>{auction.generation}</td>
            </tr>
            <tr>
              <th>Revenue</th>
              <td>{auction.revenue}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <nav className="rw-button-group"></nav>
    </CenteredContainer>
  )
}

export default Auction
