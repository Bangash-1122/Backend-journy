import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,  // one who is subscribing
        ref: "User",
        required: true,
    },
    channel: {
        type: Schema.Types.ObjectId,  // one to whom 'user' is subscribing
        ref: "User",
        required: true,
    }
}, { timestamps: true });

// Prevent duplicate subscriptions
subscriptionSchema.index({ user: 1, channel: 1 }, { unique: true });

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
