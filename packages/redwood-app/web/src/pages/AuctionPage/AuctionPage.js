import AuctionsLayout from 'src/layouts/AuctionsLayout'
import AuctionCell from 'src/components/AuctionCell'

const AuctionPage = ({ id }) => {
  return (
    <AuctionsLayout>
      <AuctionCell id={id} />
    </AuctionsLayout>
  )
}

export default AuctionPage
