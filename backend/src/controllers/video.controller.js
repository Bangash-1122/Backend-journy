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
        description,
        category = "All",
        tags = ""
    } = req.body;

    if (!title || title.trim() === "") {
        throw new ApiError(400, "Title is required");
    }
    if (!description || description.trim() === "") {
        throw new ApiError(400, "Description is required");
    }

    const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if (!videoFileLocalPath) {
        throw new ApiError(400, "Video file is required");
    }
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is required");
    }

    let videoFile;
    let thumbnail;

    try {
        videoFile = await uploadOnCloudinary(videoFileLocalPath, {
            resource_type: "video",
        });
        if (!videoFile?.secure_url && !videoFile?.url) {
            throw new ApiError(500, "Video file upload to Cloudinary failed");
        }

        thumbnail = await uploadOnCloudinary(thumbnailLocalPath, {
            resource_type: "image",
        });
        if (!thumbnail?.secure_url && !thumbnail?.url) {
            // Clean up the already uploaded video if thumbnail upload fails
            await deleteFromCloudinary(videoFile.secure_url || videoFile.url, "video");
            throw new ApiError(500, "Thumbnail upload to Cloudinary failed");
        }
    } catch (err) {
        if (videoFile?.secure_url || videoFile?.url) {
            await deleteFromCloudinary(videoFile.secure_url || videoFile.url, "video");
        }
        throw err;
    }

    const duration = Number(videoFile.duration) || 0;
    const width = Number(videoFile.width) || 0;
    const height = Number(videoFile.height) || 0;
    const isVertical = height > 0 && width > 0 && height > width;
    const isShort = duration > 0 && duration <= 60 && (isVertical || req.body.isShort === "true" || req.body.isShort === true);
    const aspectRatio = isVertical ? "9:16" : "16:9";

    // Ensure secure HTTPS and browser-compatible MP4 format delivery
    let videoDeliveryUrl = videoFile.secure_url || videoFile.url;
    if (videoFile.format && videoFile.format.toLowerCase() !== 'mp4' && videoDeliveryUrl.includes('/upload/')) {
        videoDeliveryUrl = videoDeliveryUrl.replace(/\.[a-zA-Z0-9]+$/, '.mp4');
    }

    const parsedTags = Array.isArray(tags)
        ? tags
        : typeof tags === 'string'
        ? tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [];

    const video = await Video.create({
        videoFile: videoDeliveryUrl,
        thumbnail: thumbnail.secure_url || thumbnail.url,
        title: title.trim(),
        description: description.trim(),
        duration: Math.round(duration),
        category: category.trim() || "All",
        tags: parsedTags,
        isShort: Boolean(isShort),
        aspectRatio,
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
    if (req.user?._id) {
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

    const thumbnailLocalPath = req.file?.path;
    if (thumbnailLocalPath) {
        const newThumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        if (newThumbnail?.url) {
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

const getShortsVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const limitNumber = Math.min(20, Math.max(1, parseInt(limit, 10) || 10));

    const pipeline = [
        {
            $match: {
                isPublished: true,
                $or: [
                    { isShort: true },
                    { duration: { $gt: 0, $lte: 60 } }
                ]
            }
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: "comments"
            }
        },
        {
            $addFields: {
                owner: { $first: "$owner" },
                likesCount: { $size: "$likes" },
                commentsCount: { $size: "$comments" },
                isLiked: req.user?._id
                    ? {
                        $in: [
                            new mongoose.Types.ObjectId(req.user._id),
                            "$likes.likedBy"
                        ]
                    }
                    : false
            }
        },
        {
            $project: {
                likes: 0,
                comments: 0
            }
        }
    ];

    const aggregate = Video.aggregate(pipeline);
    const shorts = await Video.aggregatePaginate(aggregate, {
        page: pageNumber,
        limit: limitNumber
    });

    return res.status(200).json(
        new ApiResponse(200, shorts, "Shorts videos fetched successfully")
    );
});

const getRecommendedVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 12, category } = req.query;
    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const limitNumber = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));

    const matchStage = {
        isPublished: true,
        isShort: { $ne: true }
    };

    if (category && category !== "All") {
        matchStage.category = category;
    }

    const pipeline = [
        { $match: matchStage },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: { $first: "$owner" }
            }
        },
        {
            $sort: { views: -1, createdAt: -1 }
        }
    ];

    const aggregate = Video.aggregate(pipeline);
    const recommendations = await Video.aggregatePaginate(aggregate, {
        page: pageNumber,
        limit: limitNumber
    });

    return res.status(200).json(
        new ApiResponse(200, recommendations, "Recommended videos fetched successfully")
    );
});

const getRelatedVideos = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { limit = 12 } = req.query;
    const limitNumber = Math.min(24, Math.max(1, parseInt(limit, 10) || 12));

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const currentVideo = await Video.findById(videoId).select("category tags owner");
    if (!currentVideo) {
        throw new ApiError(404, "Video not found");
    }

    const videoObjectId = new mongoose.Types.ObjectId(videoId);
    const matchConditions = [
        { isPublished: true },
        { _id: { $ne: videoObjectId } }
    ];

    const relevanceOr = [];
    if (currentVideo.category && currentVideo.category !== "All") {
        relevanceOr.push({ category: currentVideo.category });
    }
    if (currentVideo.tags && currentVideo.tags.length > 0) {
        relevanceOr.push({ tags: { $in: currentVideo.tags } });
    }
    if (currentVideo.owner) {
        relevanceOr.push({ owner: currentVideo.owner });
    }

    if (relevanceOr.length > 0) {
        matchConditions.push({ $or: relevanceOr });
    }

    let relatedVideos = await Video.find({ $and: matchConditions })
        .sort({ views: -1, createdAt: -1 })
        .limit(limitNumber)
        .populate("owner", "username fullName avatar");

    if (relatedVideos.length < limitNumber) {
        const existingIds = [videoObjectId, ...relatedVideos.map((v) => v._id)];
        const fallback = await Video.find({
            isPublished: true,
            _id: { $nin: existingIds }
        })
            .sort({ views: -1, createdAt: -1 })
            .limit(limitNumber - relatedVideos.length)
            .populate("owner", "username fullName avatar");

        relatedVideos = [...relatedVideos, ...fallback];
    }

    return res.status(200).json(
        new ApiResponse(200, relatedVideos, "Related videos fetched successfully")
    );
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    getShortsVideos,
    getRecommendedVideos,
    getRelatedVideos
};