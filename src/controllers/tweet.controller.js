import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { userId, content } = req.body
    
    if (!req.user?._id) {
        throw new ApiError(401, "Unauthorized user cannot create tweet")
    };

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content is required")
    };
    
    const user = await User.findById(userId)
    if (!user) {
        throw new ApiError(404, "User not found")
    };

    const tweet = await Tweet.create({
        content: content.trim(),
        owner: user._id
    });


    res.status(201)
    .json(new ApiResponse(201, "Tweet created successfully", tweet))
});

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.params

    if (!userId || !isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userId")
    }

    const user = await User.findById(userId)
    if (!user) {
        throw new ApiError(404, "User not found")
    };

    const tweets = await Tweet.find({ owner: userId })
    .sort({ createdAt: -1 })
    .populate("owner", "username email avatar fullName")

    res.status(200)
    .json(new ApiResponse(200, "User tweets retrieved successfully", tweets))
});

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params
    const { content } = req.body
    
    if (!tweetId || !isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweetId")
    };

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content is required")
    };

    if (!req.user?._id) {
        throw new ApiError(401, "Unauthorized")
    };

    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    };

    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this tweet")
    }

    tweet.content = content || tweet.content
    await tweet.save()

    res.status(200)
    .json(new ApiResponse(200, "Tweet updated successfully", tweet))
});

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params

    if (!tweetId || !isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweetId")
    };

    if (!req.user?._id) {
        throw new ApiError(401, "Unauthorized")
    };


    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    };

    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this tweet")
    };

    await tweet.remove()
    
    res.status(200)
    .json(new ApiResponse(200, "Tweet deleted successfully", null))
})



export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}