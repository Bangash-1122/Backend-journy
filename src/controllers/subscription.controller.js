import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    // TODO: toggle subscription
    
      if (!isValidObjectId(channelId)) {
          throw new ApiError(400, "Invalid subscription channel ID")
      }

    const channelUser = await User.findById(channelId)

      if (!channelUser) {
         throw new ApiError(404, "Channel user not found")
      }

       
     const existingSubscription = await Subscription.findOne(
        {
            user: req.user?._id, channel: channelId 
        }
    ) 
     
      if (existingSubscription){
         await existingSubscription.deleteOne()

         return res
         .status(200)
         .json(new ApiResponse(200, "subscription removed successfully"))
      }
     
     // Create new subscription 
    const newSubscription = new Subscription(
        {
            user: req.user?._id, channel: channelId
        }
    )
      await newSubscription.save()

      return res
      .status(201)
      .json(new ApiResponse(201, "Subscribed to channel successfully", newSubscription)) 

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if (!isValidObjectId(channelId)){
        throw new ApiError(400, "Invalid channel ID")
    }

    const subscribers = await Subscription.find(
        { 
            channel: channelId 
        }
    ).populate("user")

     return res 
     .status(200)
     .json(new ApiResponse(200, "Channel subscribers fetched successfully", subscribers))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!isValidObjectId(subscriberId)){
        throw new ApiError(400, "Invalid subscriber Id")
    }

    const subscriptions = await Subscription.find(
        { 
            user: subscriberId 
        }
    ).populate("channel")

    return res
    .status(200)
    .json(new ApiResponse(200, "Subscribed channels fetched successfully", subscriptions))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}