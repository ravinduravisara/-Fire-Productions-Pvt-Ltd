import mongoose from 'mongoose'

let Category
export function getCategoryModel() {
  if (!Category) {
    const schema = new mongoose.Schema({
      name: { type: String, required: true },
      parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null }
    }, { timestamps: true })

    schema.index({ name: 1, parent: 1 }, { unique: true })

    schema.set('toJSON', {
      virtuals: true,
      versionKey: false,
      transform: (_, ret) => {
        ret.id = ret._id
        delete ret._id
        return ret
      }
    })

    Category = mongoose.models.Category || mongoose.model('Category', schema)
  }
  return Category
}

export default getCategoryModel
