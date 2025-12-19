import mongoose from 'mongoose'

let Work
export function getWorkModel() {
  if (!Work) {
    const schema = new mongoose.Schema({
      title: { type: String, required: true },
      description: { type: String },
      imageUrl: { type: String },
      link: { type: String },
      category: { type: String },
      tags: { type: [String], default: [] }
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

    Work = mongoose.models.Work || mongoose.model('Work', schema)
  }
  return Work
}

export default getWorkModel