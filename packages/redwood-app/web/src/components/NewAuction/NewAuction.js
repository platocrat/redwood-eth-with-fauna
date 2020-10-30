import { useMutation, useFlash } from '@redwoodjs/web'
import { navigate, routes } from '@redwoodjs/router'
import AuctionForm from 'src/components/AuctionForm'

import { QUERY } from 'src/components/AuctionsCell'

const CREATE_AUCTION_MUTATION = gql`
  mutation CreateAuctionMutation($input: CreateAuctionInput!) {
    createAuction(input: $input) {
      id
    }
  }
`

const NewAuction = () => {
  const { addMessage } = useFlash()
  const [createAuction, { loading, error }] = useMutation(
    CREATE_AUCTION_MUTATION,
    {
      onCompleted: () => {
        navigate(routes.auctions())
        addMessage('Auction created.', { classes: 'rw-flash-success' })
      },
      // This refetches the query on the list page. Read more about other ways to
      // update the cache over here:
      // https://www.apollographql.com/docs/react/data/mutations/#making-all-other-cache-updates
      refetchQueries: [{ query: QUERY }],
      awaitRefetchQueries: true,
    }
  )

  const onSave = (input) => {
    createAuction({ variables: { input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">New Auction</h2>
      </header>
      <div className="rw-segment-main">
        <AuctionForm onSave={onSave} loading={loading} error={error} />
      </div>
    </div>
  )
}

export default NewAuction
