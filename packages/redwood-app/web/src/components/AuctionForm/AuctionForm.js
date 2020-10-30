import {
  Form,
  FormError,
  FieldError,
  Label,
  TextField,
  NumberField,
  Submit,
} from '@redwoodjs/forms'

const AuctionForm = (props) => {
  const onSubmit = (data) => {
    props.onSave(data, props?.auction?.id)
  }

  return (
    <div className="rw-form-wrapper">
      <Form onSubmit={onSubmit} error={props.error}>
        <FormError
          error={props.error}
          wrapperClassName="rw-form-error-wrapper"
          titleClassName="rw-form-error-title"
          listClassName="rw-form-error-list"
        />

        <Label
          name="address"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Address
        </Label>
        <TextField
          name="address"
          defaultValue={props.auction?.address}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />
        <FieldError name="address" className="rw-field-error" />

        <Label
          name="name"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Name
        </Label>
        <TextField
          name="name"
          defaultValue={props.auction?.name}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />
        <FieldError name="name" className="rw-field-error" />

        <Label
          name="description"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Description
        </Label>
        <TextField
          name="description"
          defaultValue={props.auction?.description}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />
        <FieldError name="description" className="rw-field-error" />

        <Label
          name="status"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Status
        </Label>
        <TextField
          name="status"
          defaultValue={props.auction?.status}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />
        <FieldError name="status" className="rw-field-error" />

        <Label
          name="highBid"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          High bid
        </Label>
        <NumberField
          name="highBid"
          defaultValue={props.auction?.highBid}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />
        <FieldError name="highBid" className="rw-field-error" />

        <Label
          name="generation"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Generation
        </Label>
        <NumberField
          name="generation"
          defaultValue={props.auction?.generation}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />
        <FieldError name="generation" className="rw-field-error" />

        <Label
          name="revenue"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Revenue
        </Label>
        <NumberField
          name="revenue"
          defaultValue={props.auction?.revenue}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />
        <FieldError name="revenue" className="rw-field-error" />

        <Label
          name="ownerAddress"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Owner address
        </Label>
        <TextField
          name="ownerAddress"
          defaultValue={props.auction?.ownerAddress}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />
        <FieldError name="ownerAddress" className="rw-field-error" />

        <div className="rw-button-group">
          <Submit disabled={props.loading} className="rw-button rw-button-blue">
            Save
          </Submit>
        </div>
      </Form>
    </div>
  )
}

export default AuctionForm
