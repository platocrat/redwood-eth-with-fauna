import { Link, routes } from '@redwoodjs/router'
import { Flash } from '@redwoodjs/web'

const AuctionsLayout = (props) => {
  return (
    <div className="rw-scaffold">
      <Flash timeout={1000} />
      <header className="rw-header">
        <h1 className="rw-heading rw-heading-primary">Auctions</h1>
        <Link to={routes.newAuction()} className="rw-button rw-button-green">
          <div className="rw-button-icon">+</div> New Auction
        </Link>
      </header>
      <main className="rw-main">{props.children}</main>
    </div>
  )
}

export default AuctionsLayout
