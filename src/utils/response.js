const response = {
    success: (res, data = null, message = 'Success', status = 200) => {
        return res.status(status).json({
            status: true,
            statusCode: status,
            message: message,
            data: data,
            timestamp: new Date().toISOString()
        });
    },

    error: (res, message = 'Internal Server Error', status = 500, errors = null) => {
        return res.status(status).json({
            status: false,
            statusCode: status,
            message: message,
            errors: errors,
            timestamp: new Date().toISOString()
        });
    },

    validationError: (res, message = 'Validation Error', errors = null) => {
        return res.status(422).json({
            status: false,
            statusCode: 422,
            message: message,
            errors: errors,
            timestamp: new Date().toISOString()
        });
    },

    notFound: (res, message = 'Not Found') => {
        return res.status(404).json({
            status: false,
            statusCode: 404,
            message: message,
            timestamp: new Date().toISOString()
        });
    },

    unauthorized: (res, message = 'Unauthorized') => {
        return res.status(401).json({
            status: false,
            statusCode: 401,
            message: message,
            timestamp: new Date().toISOString()
        });
    },

    forbidden: (res, message = 'Forbidden') => {
        return res.status(403).json({
            status: false,
            statusCode: 403,
            message: message,
            timestamp: new Date().toISOString()
        });
    }
};

module.exports = response; 