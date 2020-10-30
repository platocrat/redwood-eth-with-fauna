import { useMutation, useFlash } from '@redwoodjs/web'
import { Link, routes } from '@redwoodjs/router'

import { QUERY } from 'src/components/AuctionsCell'

const DELETE_AUCTION_MUTATION = gql`
  mutation DeleteAuctionMutation($id: Int!) {
    deleteAuction(id: $id) {
      id
    }
  }
`

const MAX_STRING_LENGTH = 150

const truncate = (text) => {
  let output = text
  if (text && text.length > MAX_STRING_LENGTH) {
    output = output.substring(0, MAX_STRING_LENGTH) + '...'
  }
  return output
}

const jsonTruncate = (obj) => {
  return truncate(JSON.stringify(obj, null, 2))
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

const AuctionsList = ({ auctions }) => {
  const { addMessage } = useFlash()
  const [deleteAuction] = useMutation(DELETE_AUCTION_MUTATION, {
    onCompleted: () => {
      addMessage('Auction deleted.', { classes: 'rw-flash-success' })
    },
    // This refetches the query on the list page. Read more about other ways to
    // update the cache over here:
    // https://www.apollographql.com/docs/react/data/mutations/#making-all-other-cache-updates
    refetchQueries: [{ query: QUERY }],
    awaitRefetchQueries: true,
  })

  const onDeleteClick = (id) => {
    if (confirm('Are you sure you want to delete auction ' + id + '?')) {
      deleteAuction({ variables: { id } })
    }
  }

  return (
    <div className="rw-segment rw-table-wrapper-responsive">
      <table className="rw-table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Address</th>
            <th>Name</th>
            <th>Description</th>
            <th>Created at</th>
            <th>Status</th>
            <th>High bid</th>
            <th>Generation</th>
            <th>Revenue</th>
            <th>Owner address</th>
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {auctions.map((auction) => (
            <tr key={auction.id}>
              <td>{truncate(auction.id)}</td>
              <td>{truncate(auction.address)}</td>
              <td>{truncate(auction.name)}</td>
              <td>{truncate(auction.description)}</td>
              <td>{timeTag(auction.createdAt)}</td>
              <td>{truncate(auction.status)}</td>
              <td>{truncate(auction.highBid)}</td>
              <td>{truncate(auction.generation)}</td>
              <td>{truncate(auction.revenue)}</td>
              <td>{truncate(auction.ownerAddress)}</td>
              <td>
                <nav className="rw-table-actions">
                  <Link
                    to={routes.auction({ id: auction.id })}
                    title={'Show auction ' + auction.id + ' detail'}
                    className="rw-button rw-button-small"
                  >
                    Show
                  </Link>
                  <Link
                    to={routes.editAuction({ id: auction.id })}
                    title={'Edit auction ' + auction.id}
                    className="rw-button rw-button-small rw-button-blue"
                  >
                    Edit
                  </Link>
                  <a
                    href="#"
                    title={'Delete auction ' + auction.id}
                    className="rw-button rw-button-small rw-button-red"
                    onClick={() => onDeleteClick(auction.id)}
                  >
                    Delete
                  </a>
                </nav>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AuctionsList
