import mongoose from 'mongoose'

let ImageAsset
export function getImageAssetModel() {
  if (!ImageAsset) {
    const schema = new mongoose.Schema({
      filename: { type: String, required: true },
      contentType: { type: String, required: true },
      size: { type: Number, required: true },
      data: { type: Buffer, required: true }
    }, { timestamps: true })

    schema.set('toJSON', {
      virtuals: true,
      versionKey: false,
      transform: (_, ret) => {
        ret.id = ret._id
        delete ret._id
        delete ret.data
        return ret
      }
    })

    ImageAsset = mongoose.models.ImageAsset || mongoose.model('ImageAsset', schema)
  }
  return ImageAsset
}

export default getImageAssetModel
