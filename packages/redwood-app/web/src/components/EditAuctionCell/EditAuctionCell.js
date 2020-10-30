import { useMutation, useFlash } from '@redwoodjs/web'
import { navigate, routes } from '@redwoodjs/router'
import AuctionForm from 'src/components/AuctionForm'

export const QUERY = gql`
  query FIND_AUCTION_BY_ID($id: Int!) {
    auction: auction(id: $id) {
      id
      address
      name
      description
      createdAt
      status
      highBid
      generation
      revenue
      ownerAddress
    }
  }
`
const UPDATE_AUCTION_MUTATION = gql`
  mutation UpdateAuctionMutation($id: Int!, $input: UpdateAuctionInput!) {
    updateAuction(id: $id, input: $input) {
      id
      address
      name
      description
      createdAt
      status
      highBid
      generation
      revenue
      ownerAddress
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Success = ({ auction }) => {
  const { addMessage } = useFlash()
  const [updateAuction, { loading, error }] = useMutation(
    UPDATE_AUCTION_MUTATION,
    {
      onCompleted: () => {
        navigate(routes.auctions())
        addMessage('Auction updated.', { classes: 'rw-flash-success' })
      },
    }
  )

  const onSave = (input, id) => {
    updateAuction({ variables: { id, input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">
          Edit Auction {auction.id}
        </h2>
      </header>
      <div className="rw-segment-main">
        <AuctionForm
          auction={auction}
          onSave={onSave}
          error={error}
          loading={loading}
        />
      </div>
    </div>
  )
}
