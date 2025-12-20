import mongoose from 'mongoose'

let Product
export function getProductModel() {
  if (!Product) {
    const schema = new mongoose.Schema({
      title: { type: String, required: true },
      description: { type: String },
      imageUrl: { type: String },
      imageUrls: { type: [String], default: [] },
      price: { type: Number, default: 0 },
      category: { type: String },
      subCategory: { type: String }
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

    Product = mongoose.models.Product || mongoose.model('Product', schema)
  }
  return Product
}

export default getProductModel