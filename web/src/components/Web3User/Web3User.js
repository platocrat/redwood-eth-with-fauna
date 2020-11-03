const Web3User = ({ web3User }) => {
  const { superTokenBalance, isSubscribed } = web3User
  return (
    <div>
      <h2>{'Web3User'}</h2>
      <p>{`superTokenBalance: ${superTokenBalance}`}</p>
      <p>{`isSubscribed: ${isSubscribed}`}</p>
    </div>
  )
}

export default Web3User
