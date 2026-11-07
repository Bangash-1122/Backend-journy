import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        // Try to get token from cookies first, then from Authorization header
        const token = req.cookies?.accessToken || 
                req.header("Authorization")?.replace("Bearer ", "");
        console.log(token);
        
        if (!token) {
            throw new ApiError(401, "Unauthorized access, token missing");
        }
    
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
        const user = await User.findById(decoded?._id).select("-password -refreshToken");
    
        if (!user) {
            throw new ApiError(401, "Invalid token, user not found");
        }
    
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401,  error?.message || "Invalid access token");
    }

})

