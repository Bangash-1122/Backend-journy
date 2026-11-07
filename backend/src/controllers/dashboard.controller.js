import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const { channelId } = req.params

    // Validate channelId
    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }

    const channelObjectId = new mongoose.Types.ObjectId(channelId)

    const [
        totalVideos,
        totalViews,
        totalSubscribers,
        totalLikes
    ] = await Promise.all([
        // Fetch total videos uploaded by the channel
        Video.countDocuments({ owner: channelObjectId }),

        // Total views on all videos of this channel
        Video.aggregate([
            {
                $match: {
                    owner: channelObjectId
                }
            },
            {
                $group: {
                    _id: null,
                    totalViews: { $sum: "$views" }
                }
            }
        ]),

        // Total subscribers to this channel
        Subscription.countDocuments({ channelId: channelObjectId }),

        // Total likes on videos (currently global, not per-channel)
        Like.aggregate([
            {
                $match: {
                    contentType: "Video", // make sure this matches your DB value
                    isLiked: true
                }
            },
            {
                $group: {
                    _id: null,
                    likeCount: { $sum: 1 }
                }
            }
        ])
    ])

    const totalVideoViews = totalViews.length > 0 ? totalViews[0].totalViews : 0
    const totalLikeCount = totalLikes.length > 0 ? totalLikes[0].likeCount : 0

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalVideos,
                totalVideoViews,
                totalSubscribers,
                totalLikeCount
            },
            "Channel stats fetched successfully"
        )
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const { channelId } = req.params

    // Validate channelId
    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }

    const channelObjectId = new mongoose.Types.ObjectId(channelId)

    const videos = await Video
        .find({ owner: channelObjectId })
        .sort({ createdAt: -1 }) // newest first (optional but recommended)

    return res.status(200).json(
        new ApiResponse(
            200,
            videos,
            "Channel videos fetched successfully"
        )
    )
})

export {
    getChannelStats,
    getChannelVideos
}