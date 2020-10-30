import { useMutation, useFlash } from '@redwoodjs/web'
import { Link, routes, navigate } from '@redwoodjs/router'

import { QUERY } from 'src/components/AuctionsCell'

const DELETE_AUCTION_MUTATION = gql`
  mutation DeleteAuctionMutation($id: Int!) {
    deleteAuction(id: $id) {
      id
    }
  }
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
  const [deleteAuction] = useMutation(DELETE_AUCTION_MUTATION, {
    onCompleted: () => {
      navigate(routes.auctions())
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
    <>
      <div className="rw-segment">
        <header className="rw-segment-header">
          <h2 className="rw-heading rw-heading-secondary">
            Auction {auction.id} Detail
          </h2>
        </header>
        <table className="rw-table">
          <tbody>
            <tr>
              <th>Id</th>
              <td>{auction.id}</td>
            </tr>
            <tr>
              <th>Address</th>
              <td>{auction.address}</td>
            </tr>
            <tr>
              <th>Name</th>
              <td>{auction.name}</td>
            </tr>
            <tr>
              <th>Description</th>
              <td>{auction.description}</td>
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
    </>
  )
}

export default Auction
