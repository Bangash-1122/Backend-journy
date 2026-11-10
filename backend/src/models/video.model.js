import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema({
    videoFile: {
        type: String,  // cloudinary url
        required: true,
    },
    thumbnail:{
        type: String,  // cloudinary url
        required: true
   },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    views: {
        type: Number,
        default: 0   
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    isShort: {
        type: Boolean,
        default: false,
        index: true,
    },
    aspectRatio: {
        type: String,
        default: "16:9",
    },
    category: {
        type: String,
        default: "All",
        index: true,
    },
    tags: [{
        type: String,
        trim: true,
    }],
}, {timestamps: true});

videoSchema.index({ isPublished: 1, isShort: 1, createdAt: -1 });
videoSchema.index({ isPublished: 1, category: 1, views: -1 });
videoSchema.index({ owner: 1, isPublished: 1 });

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);