import { unlockBrowser } from 'src/web3/connect'

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
        <h3>Emanator</h3>

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
