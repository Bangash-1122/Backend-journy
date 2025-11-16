import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,  // one who subscribing
        ref: "User",
    },
    channel: {
        type: Schema.Types.ObjectId,  // one to whom 'user' is subscribing
        ref: "User",
    }
}, { timestamps: true });



export const Subscription = mongoose.model("Subscription", subscriptionSchema)