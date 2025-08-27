const response = require("../utils/response");
const jwtUtils = require("../utils/jwtUtils");
const { ERROR_MESSAGES } = require("../config/constants");
const {
  fetchAdminUsersSchema,
  createAdminUserSchema,
} = require("../middleware/Validation");
const accountService = require("../services/accountService");
const { statusCodes } = require("../utils/statusCodes");

const fetchAdminUsers = async (req, res) => {
  try {
    const { error, value } = fetchAdminUsersSchema.validate(req.body);

    if (error) {
      return response.validationError(
        res,
        error.details[0].message.replace(/"/g, "")
      );
    }

    console.log("IP address--------", req.socket.remoteAddress);

    const { token, currentPage, itemsPerPage, filters, search } = value;
    // const decoded = jwtUtils.verifyTokenAndRespond(
    //   res,
    //   token,
    //   process.env.JWT_SECRET
    // );
    // const admin_id = decoded?.id;

    // // Verify admin token
    // const isTokenValid = await accountService.verifyAdminToken(admin_id, token);
    // if (!isTokenValid) {
    //   return response.unauthorized(res, ERROR_MESSAGES.INVALID_OR_EXPIRE_TOKEN);
    // }

    const adminUsers = await accountService.fetchAdminUsers(
      currentPage,
      itemsPerPage,
      filters,
      search
    );
    return response.success(
      res,
      adminUsers,
      ERROR_MESSAGES.ACCOUNT_USERS_SUCCESS
    );
  } catch (error) {
    console.error(ERROR_MESSAGES.ACCOUNT_USERS_FAIL, error);
    return response.error(res, ERROR_MESSAGES.ACCOUNT_USERS_FAIL);
  }
};

const createAdminUser = async (req, res) => {
  try {
    const { error, value } = createAdminUserSchema.validate(req.body);
    if (error) {
      return response.validationError(
        res,
        error.details[0].message.replace(/"/g, "")
      );
    }

    const { name, email, password, confirmPassword, role, security_questions } =
      value;

    if (password !== confirmPassword) {
      return response.error(
        res,
        "Passwords do not match",
        statusCodes.BAD_REQUEST
      );
    }

    const result = await accountService.createAdminUsers(
      name,
      email,
      password,
      role,
      security_questions
    );

    console.log(result);

    if (!result.status) {
      return response.error(res);
    }

    return response.success(res, result.data);
  } catch (error) {
    console.error(ERROR_MESSAGES.CREATE_ADMIN_USER_FAIL, error);
    return response.error(res, ERROR_MESSAGES.CREATE_ADMIN_USER_FAIL);
  }
};

const adminUserUpdate = async (req, res) => {
  try {
    const adminId = req.user.id;
    const updatedData = req.body;

    const result = await accountService.updateAdminUser(adminId, updatedData);

    if (result.affectedRows === 0) {
      return response.notFound(res, ERROR_MESSAGES.ADMIN_USER_NOT_FOUND);
    }

    return response.success(
      res,
      null,
      ERROR_MESSAGES.ADMIN_USER_UPDATE_SUCCESS
    );
  } catch (error) {
    console.error("Error updating admin user:", error);
    return response.error(
      res,
      {
        message: error.message,
        stack: error.stack,
        code: error.code,
        sqlMessage: error.sqlMessage,
        sqlState: error.sqlState,
      },
      500
    );
  }
};

const fetchSecurityQuestions = async (req, res) => {
  try {
    const securityQuestions = await accountService.fetchSecurityQuestions();
    return response.success(
      res,
      securityQuestions,
      ERROR_MESSAGES.SECURITY_QUESTIONS_SUCCESS
    );
  } catch (error) {
    console.error(ERROR_MESSAGES.SECURITY_QUESTIONS_FAIL, error);
    return response.error(res, ERROR_MESSAGES.SECURITY_QUESTIONS_FAIL);
  }
};

module.exports = {
  fetchAdminUsers,
  createAdminUser,
  adminUserUpdate,
  fetchSecurityQuestions,
};
