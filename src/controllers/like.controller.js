import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const like = await Like.findOne({user: req.user?._id, video: videoId})

    if (like) {
        await like.deleteOne()
        return res
        .status(200)
        .json(new ApiResponse(200, "Video unliked successfully"))
    }

    const newLike = new Like({
        user: req.user?._id,
        video: videoId
    })

    await newLike.save()
    return res
        .status(201)
        .json(new ApiResponse(201, "Video liked successfully"))
     
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }

    const like = await Like.findOne({user: req.user?._id, comment: commentId})

    if (like) {
        await like.deleteOne()
        return res
        .status(200)
        .json(new ApiResponse(200, "Comment unliked successfully"))
    }

    const newLike = new Like({
        user: req.user?._id,
        comment: commentId
    })

    await newLike.save()
    return res
        .status(201)
        .json(new ApiResponse(201, "Comment liked successfully"))

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }

    const like = await Like.findOne({user: req.user?._id, tweet: tweetId})

    if (like) {
        await like.deleteOne()
        return res
        .status(200)
        .json(new ApiResponse(200, "Tweet unliked successfully"))
    }
    
    const newLike = new Like({
        user: req.user?._id,
        tweet: tweetId
    })

    await newLike.save()
    return res
        .status(201)
        .json(new ApiResponse(201, "Tweet liked successfully"))

});

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const likedVideos = await Like.find({user: req.user?._id, 
        video: {$ne: null}})
        .populate('video')

    return res
        .status(200)
        .json(new ApiResponse(200,  "Liked videos fetched successfully", likedVideos))

})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}