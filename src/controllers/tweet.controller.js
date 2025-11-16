import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


// CREATE TWEET
const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Tweet content is required")
    }

    // Ensure user still exists
    const user = await User.findById(req.user?._id)
    if (!user) {
        throw new ApiError(404, "User not found or deleted")
    }

    const tweet = await Tweet.create({
        content: content.trim(),
        owner: user._id
    })

    return res
        .status(201)
        .json(new ApiResponse(201, "Tweet created successfully", tweet))
})


// GET USER TWEETS WITH POPULATED USER INFO
const getUserTweets = asyncHandler(async (req, res) => {
    const userId = req.user?._id

    if (!userId) {
        throw new ApiError(401, "Unauthorized")
    }

    // Check user existence
    const user = await User.findById(userId)
    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const tweets = await Tweet.find({ owner: userId })
        .sort({ createdAt: -1 })
        .populate("owner", "username email avatar fullName") // using User model

    return res
        .status(200)
        .json(new ApiResponse(200, "User tweets fetched successfully", tweets))
})


// UPDATE TWEET
const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    const { content } = req.body

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Tweet content is required")
    }

    const tweet = await Tweet.findById(tweetId)

    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    if (tweet.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this tweet")
    }

    const user = await User.findById(req.user?._id)
    if (!user) {
        throw new ApiError(400, "User account no longer exists")
    }

    tweet.content = content.trim()
    await tweet.save()

    return res
        .status(200)
        .json(new ApiResponse(200, "Tweet updated successfully", tweet))
})


// DELETE TWEET
const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }

    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new ApiError(400, "Tweet not found")
    }

    if (tweet.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this tweet")
    }

    const user = await User.findById(req.user?._id)
    if (!user) {
        throw new ApiError(400, "User not found")
    }

    await tweet.deleteOne()

    return res
        .status(200)
        .json(new ApiResponse(200, "Tweet deleted successfully"))
})



export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}