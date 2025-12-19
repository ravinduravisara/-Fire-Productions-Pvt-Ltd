import mongoose from 'mongoose'

let Service
export function getServiceModel() {
  if (!Service) {
    const schema = new mongoose.Schema({
      name: { type: String, required: true, unique: true },
      description: { type: String, required: true },
      imageUrl: { type: String },
      category: { type: String }, // Acoustic | Music | Films | Entertainment
      order: { type: Number, default: 0 },
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

    Service = mongoose.models.Service || mongoose.model('Service', schema)
  }
  return Service
}

export default getServiceModel
