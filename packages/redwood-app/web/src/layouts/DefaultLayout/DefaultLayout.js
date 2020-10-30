import { unlockBrowser } from 'src/web3/connect'
import { Link } from '@redwoodjs/router'

const DefaultLayout = ({ children }) => {
  const onConnect = () => {
    const { walletAddress } = unlockBrowser({
      debug: true,
    })
  }
  return (
    <>
      <div
        style={{
          display: 'flex',
          alignContent: 'space-between',
          width: '100%',
        }}
      >
        <Link to="/">
          <h3>Emanator</h3>
        </Link>

        <div className="rw-button-group">
          <button onClick={onConnect} className="rw-button rw-button-blue">
            Connect
          </button>
        </div>
      </div>
      {children}
    </>
  )
}

export default DefaultLayout
