import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

   // Validate videoId
    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "Invalid video ID")
    }

    // Normalize pagination values
    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(parseInt(limit, 10) || 10, 100);
    const skip = (pageNumber - 1) * limitNumber;
    
    // Fetch comments from the database
    const comments = await Comment.find({videoId: new mongoose.Types.ObjectId(videoId)})
        .sort({createdAt: -1})
        .skip(skip)
        .limit(limitNumber)
        .lean();

    // Get total count of comments for pagination
    const totalComments = await Comment.countDocuments({videoId: new mongoose.Types.ObjectId(videoId)});
        const totalPages = totalComments ? Math.ceil(totalComments / limitNumber) : 1;

        return res
        .status(200)
        .json(new ApiResponse(200, 
            "Comments fetched successfully",
            {
            comments,
            page: pageNumber,
            limit: limitNumber,
            totalPages,
            totalComments
        }
    ));
});

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params
    const {text} = req.body
    const userId = req.user?._id
    // Validate videoId
    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "Invalid video ID")
    }

     // Validate user session
    if(!userId){
        throw new ApiError(401, "Unauthorized: User ID not found in request")
    }

    // Validate text
    if(!text || typeof text !== "string" || text.trim().length === 0){
        throw new ApiError(400, "Comment text is required")
    }

    const videoObjectId = new mongoose.Types.ObjectId(videoId);
    const userObjectId = new mongoose.Types.ObjectId(userId);

   
    // Create and save the new comment
    const newComment = new Comment({
        videoId: videoObjectId,
        userId: userObjectId,
        text: text.trim()
    });

    await newComment.save();

    return res
        .status(201)
        .json(new ApiResponse(201, "Comment added successfully", newComment));

});

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params
    const {text} = req.body
    const userId = req.user?._id

    // Validate commentId
    if(!mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError(400, "Invalid comment ID")
    }

    // Validate user session
    if(!userId){
        throw new ApiError(401, "Unauthorized: User ID not found in request")
    }

    // Validate text
    if(!text || typeof text !== "string" || text.trim().length === 0){
        throw new ApiError(400, "Comment text is required")
    }

    const commentObjectId = new mongoose.Types.ObjectId(commentId);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Update the comment in the database
    const updatedComment = await Comment.findOneAndUpdate(
        { _id: commentObjectId, userId: userObjectId },
        { text: text.trim() },
        { 
            new: true,
            runValidators: true
        },
    );

    if (!updatedComment) {
        throw new ApiError(404, "Comment not found or you are not authorized to update this comment");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "Comment updated successfully", updatedComment));

});

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params
    const userId = req.user?._id

    // Validate commentId
    if(!mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError(400, "Invalid comment ID")
    }

    // Validate user session
    if(!userId){
        throw new ApiError(401, "Unauthorized: User ID not found in request")
    }

    const commentObjectId = new mongoose.Types.ObjectId(commentId);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Delete the comment from the database
    const deletedComment = await Comment.findOneAndDelete(
        {
            _id: commentObjectId, 
            userId: userObjectId 
        }
    );

    if (!deletedComment) {
        throw new ApiError(404, "Comment not found or you are not authorized to delete this comment");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "Comment deleted successfully", deletedComment));

});

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
    }