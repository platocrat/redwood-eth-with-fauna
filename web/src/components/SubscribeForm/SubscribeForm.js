import {
  Form,
  FormError,
  FieldError,
  Label,
  TextField,
  NumberField,
  Submit,
} from '@redwoodjs/forms'

const SubscribeForm = (props) => {
  const onSubmit = async (data) => {
    props.onSave()
  }
  console.log(props.loading)

  return (
    <div className="rw-form-wrapper">
      <Form onSubmit={onSubmit} error={props.error}>
        <p>
          You are not subscribed to the IDA, you will receive tokens, but they
          won't appear in your balance until you subscribe
        </p>
        <FormError
          error={props.error}
          wrapperClassName="rw-form-error-wrapper"
          titleClassName="rw-form-error-title"
          listClassName="rw-form-error-list"
        />
        <div className="rw-button-group">
          <Submit disabled={props.loading} className="rw-button rw-button-blue">
            Subscribe
          </Submit>
        </div>
      </Form>
    </div>
  )
}

export default SubscribeForm
