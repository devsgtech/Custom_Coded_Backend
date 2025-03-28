const statusCodes = {
    // Success Status Codes
    SUCCESS: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,

    // Client Error Status Codes
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,

    // Server Error Status Codes
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504
};

const statusMessages = {
    // Success Messages
    [statusCodes.SUCCESS]: 'Success',
    [statusCodes.CREATED]: 'Created successfully',
    [statusCodes.ACCEPTED]: 'Accepted',
    [statusCodes.NO_CONTENT]: 'No content',

    // Client Error Messages
    [statusCodes.BAD_REQUEST]: 'Bad request',
    [statusCodes.UNAUTHORIZED]: 'Unauthorized',
    [statusCodes.FORBIDDEN]: 'Forbidden',
    [statusCodes.NOT_FOUND]: 'Not found',
    [statusCodes.METHOD_NOT_ALLOWED]: 'Method not allowed',
    [statusCodes.CONFLICT]: 'Conflict',
    [statusCodes.UNPROCESSABLE_ENTITY]: 'Unprocessable entity',
    [statusCodes.TOO_MANY_REQUESTS]: 'Too many requests',

    // Server Error Messages
    [statusCodes.INTERNAL_SERVER_ERROR]: 'Internal server error',
    [statusCodes.NOT_IMPLEMENTED]: 'Not implemented',
    [statusCodes.BAD_GATEWAY]: 'Bad gateway',
    [statusCodes.SERVICE_UNAVAILABLE]: 'Service unavailable',
    [statusCodes.GATEWAY_TIMEOUT]: 'Gateway timeout'
};

module.exports = {
    statusCodes,
    statusMessages
}; 