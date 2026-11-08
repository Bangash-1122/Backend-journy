import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const channelObjectId = new mongoose.Types.ObjectId(channelId);

    // Get all video IDs owned by this channel
    const channelVideos = await Video.find({ owner: channelObjectId }).select("_id views");
    const channelVideoIds = channelVideos.map((v) => v._id);

    const totalVideos = channelVideos.length;
    const totalVideoViews = channelVideos.reduce((acc, curr) => acc + (curr.views || 0), 0);

    const [totalSubscribers, totalLikeCount] = await Promise.all([
        Subscription.countDocuments({ channel: channelObjectId }),
        Like.countDocuments({ video: { $in: channelVideoIds } })
    ]);

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
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const channelObjectId = new mongoose.Types.ObjectId(channelId);

    // Private Studio protection: only the channel owner can view their own unpublished videos
    const isOwner = req.user && req.user._id.toString() === channelId.toString();
    const query = { owner: channelObjectId };
    if (!isOwner) {
        query.isPublished = true;
    }

    const videos = await Video.find(query)
        .sort({ createdAt: -1 })
        .populate("owner", "username fullName avatar");

    return res.status(200).json(
        new ApiResponse(200, videos, "Channel videos fetched successfully")
    );
});

export {
    getChannelStats,
    getChannelVideos
};
