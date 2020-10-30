import AuctionsLayout from 'src/layouts/AuctionsLayout'
import EditAuctionCell from 'src/components/EditAuctionCell'

const EditAuctionPage = ({ id }) => {
  return (
    <AuctionsLayout>
      <EditAuctionCell id={id} />
    </AuctionsLayout>
  )
}

export default EditAuctionPage
