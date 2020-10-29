import { Link, routes } from '@redwoodjs/router'

const AuctionPage = ({ auctionAddress }) => {
  return (
    <>
      <h1>AuctionPage</h1>
      <p>
        Find me in <code>./web/src/pages/AuctionPage/AuctionPage.js</code>
      </p>
      <p>
        My default route is named <code>auction</code>, link to me with `
        <Link to={routes.auction({ auctionAddress: '42' })}>Auction 42</Link>`
      </p>
      <p>The parameter passed to me is {auctionAddress}</p>
    </>
  )
}

export default AuctionPage
