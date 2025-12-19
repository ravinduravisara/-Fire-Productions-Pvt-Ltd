import mongoose from 'mongoose'

let ContactMessage
export function getContactMessageModel() {
  if (!ContactMessage) {
    const schema = new mongoose.Schema({
      name: { type: String, required: true },
      email: { type: String, required: true },
      message: { type: String, required: true }
    }, { timestamps: true })

    schema.set('toJSON', {
      virtuals: true,
      versionKey: false,
      transform: (_, ret) => {
        ret.id = ret._id
        delete ret._id
        return ret
      }
    })

    ContactMessage = mongoose.models.ContactMessage || mongoose.model('ContactMessage', schema)
  }
  return ContactMessage
}

export default getContactMessageModel