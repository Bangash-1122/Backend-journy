import mongoose, {
    isValidObjectId
} from "mongoose";
import {
    Video
} from "../models/video.model.js";
import {
    User
} from "../models/user.model.js";
import {
    ApiError
} from "../utils/ApiError.js";
import {
    ApiResponse
} from "../utils/ApiResponse.js";
import {
    asyncHandler
} from "../utils/asyncHandler.js";
import {
    uploadOnCloudinary,
    deleteFromCloudinary
} from "../utils/cloudinary.js";

const SORT_WHITELIST = ["createdAt", "views", "duration", "title"];

const getAllVideos = asyncHandler(async (req, res) => {
    const {
        page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId
    } = req.query;

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

    const matchStage = {};

    // Only allow viewing unpublished videos if the requesting user is the owner
    const isOwnerQueryingSelf = req.user && userId && req.user._id.toString() === userId.toString();
    if (!isOwnerQueryingSelf) {
        matchStage.isPublished = true;
    }

    if (userId) {
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid user ID");
        }
        matchStage.owner = new mongoose.Types.ObjectId(userId);
    }

    if (query && query.trim() !== "") {
        matchStage.$or = [{
                title: {
                    $regex: query.trim(),
                    $options: "i"
                }
            },
            {
                description: {
                    $regex: query.trim(),
                    $options: "i"
                }
            }
        ];
    }

    const sortField = SORT_WHITELIST.includes(sortBy) ? sortBy : "createdAt";
    const sortDirection = sortType === "asc" ? 1 : -1;
    const sortStage = {
        [sortField]: sortDirection
    };

    // Notice: NO $skip and $limit inside the pipeline here! aggregatePaginate handles pagination.
    const pipeline = [{
            $match: matchStage
        },
        {
            $sort: sortStage
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [{
                    $project: {
                        username: 1,
                        fullName: 1,
                        avatar: 1
                    }
                }]
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner"
                }
            }
        }
    ];

    const aggregate = Video.aggregate(pipeline);
    const videos = await Video.aggregatePaginate(aggregate, {
        page: pageNumber,
        limit: limitNumber
    });

    return res.status(200).json(
        new ApiResponse(200, videos, "Videos fetched successfully")
    );
});

const publishAVideo = asyncHandler(async (req, res) => {
    const {
        title,
        description
    } = req.body;

    if (!title || title.trim() === "") {
        throw new ApiError(400, "Title is required");
    }
    if (!description || description.trim() === "") {
        throw new ApiError(400, "Description is required");
    }

    const videoFileLocalPath = req.files ? .videoFile ? . [0] ? .path;
    const thumbnailLocalPath = req.files ? .thumbnail ? . [0] ? .path;

    if (!videoFileLocalPath) {
        throw new ApiError(400, "Video file is required");
    }
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is required");
    }

    let videoFile;
    let thumbnail;

    try {
        videoFile = await uploadOnCloudinary(videoFileLocalPath);
        if (!videoFile ? .url) {
            throw new ApiError(500, "Video file upload to Cloudinary failed");
        }

        thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        if (!thumbnail ? .url) {
            // Clean up the already uploaded video if thumbnail upload fails
            await deleteFromCloudinary(videoFile.url, "video");
            throw new ApiError(500, "Thumbnail upload to Cloudinary failed");
        }
    } catch (err) {
        if (videoFile ? .url) await deleteFromCloudinary(videoFile.url, "video");
        throw err;
    }

    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title: title.trim(),
        description: description.trim(),
        duration: videoFile.duration || 0,
        owner: req.user._id,
        isPublished: true
    });

    const createdVideo = await Video.findById(video._id).populate("owner", "username fullName avatar");

    return res.status(201).json(
        new ApiResponse(201, createdVideo, "Video published successfully")
    );
});

const getVideoById = asyncHandler(async (req, res) => {
    const {
        videoId
    } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId).populate("owner", "username fullName avatar");

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Protect unpublished videos from unauthorized viewers
    const isOwner = req.user && video.owner && video.owner._id.toString() === req.user._id.toString();
    if (!video.isPublished && !isOwner) {
        throw new ApiError(403, "You are not authorized to view this unpublished video");
    }

    // Increment views
    video.views += 1;
    await video.save({
        validateBeforeSave: false
    });

    // Track user watch history if user is authenticated
    if (req.user ? ._id) {
        await User.findByIdAndUpdate(req.user._id, {
            $addToSet: {
                watchHistory: video._id
            }
        });
    }

    return res.status(200).json(
        new ApiResponse(200, video, "Video fetched successfully")
    );
});

const updateVideo = asyncHandler(async (req, res) => {
    const {
        videoId
    } = req.params;
    const {
        title,
        description
    } = req.body;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video");
    }

    if (title && title.trim() !== "") video.title = title.trim();
    if (description && description.trim() !== "") video.description = description.trim();

    const thumbnailLocalPath = req.file ? .path;
    if (thumbnailLocalPath) {
        const newThumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        if (newThumbnail ? .url) {
            const oldThumbnailUrl = video.thumbnail;
            video.thumbnail = newThumbnail.url;
            if (oldThumbnailUrl) {
                await deleteFromCloudinary(oldThumbnailUrl, "image");
            }
        }
    }

    await video.save();

    const updatedVideo = await Video.findById(videoId).populate("owner", "username fullName avatar");

    return res.status(200).json(
        new ApiResponse(200, updatedVideo, "Video updated successfully")
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
    const {
        videoId
    } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this video");
    }

    // Clean up assets on Cloudinary
    if (video.videoFile) {
        await deleteFromCloudinary(video.videoFile, "video");
    }
    if (video.thumbnail) {
        await deleteFromCloudinary(video.thumbnail, "image");
    }

    await video.deleteOne();

    return res.status(200).json(
        new ApiResponse(200, {
            videoId
        }, "Video deleted successfully")
    );
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const {
        videoId
    } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to toggle publish status");
    }

    video.isPublished = !video.isPublished;
    await video.save({
        validateBeforeSave: false
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            video,
            `Video ${video.isPublished ? "published" : "unpublished"} successfully`
        )
    );
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
};