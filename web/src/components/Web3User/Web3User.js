import { useState } from 'react'

import {
  Form,
  Label,
  TextField,
  TextAreaField,
  FieldError,
  Submit,
} from '@redwoodjs/forms'

import SubscribeForm from 'src/components/SubscribeForm/SubscribeForm'

import { subscribeToIDA } from 'src/web3/auction'

const Web3User = ({ web3User, auctionAddress }) => {
  const { superTokenBalance, isSubscribed } = web3User

  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(!isSubscribed)

  const handleError = (error) => {
    setError(error.message)
    setLoading(false)
  }

  const onSubscribe = async () => {
    setLoading(true)
    setError(null)
    const { tx, error: submitError } = await subscribeToIDA({ auctionAddress })
    if (submitError) return handleError(submitError)
    await tx.wait()
    setShowForm(false)
    setLoading(false)
  }

  return (
    <div>
      <h2>{'Web3User'}</h2>
      <p>{`superTokenBalance: ${superTokenBalance}`}</p>
      <div>
        {showForm && (
          <SubscribeForm error={error} loading={loading} onSave={onSubscribe} />
        )}
      </div>
    </div>
  )
}

export default Web3User
