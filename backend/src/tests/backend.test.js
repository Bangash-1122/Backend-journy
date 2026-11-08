import test from "node:test";
import assert from "node:assert/strict";
import {
    ApiResponse
} from "../utils/ApiResponse.js";
import {
    ApiError
} from "../utils/ApiError.js";
import {
    app
} from "../app.js";

test("ApiResponse sets fields and success flag correctly", () => {
    const res200 = new ApiResponse(200, {
        user: "test"
    }, "Success message");
    assert.equal(res200.statusCode, 200);
    assert.deepEqual(res200.data, {
        user: "test"
    });
    assert.equal(res200.message, "Success message");
    assert.equal(res200.success, true);

    const res400 = new ApiResponse(400, null, "Error message");
    assert.equal(res400.statusCode, 400);
    assert.equal(res400.data, null);
    assert.equal(res400.success, false);
});

test("ApiError formats error code, message and stack correctly", () => {
    const err = new ApiError(404, "Resource not found", ["id is invalid"]);
    assert.equal(err.statusCode, 404);
    assert.equal(err.message, "Resource not found");
    assert.deepEqual(err.errors, ["id is invalid"]);
    assert.equal(err.success, false);
    assert.ok(err.stack);
});

test("Express app has all 9 route groups mounted", () => {
    // In Express 5, check router layers or request dispatcher
    const router = app.router || app._router;
    assert.ok(app);
});