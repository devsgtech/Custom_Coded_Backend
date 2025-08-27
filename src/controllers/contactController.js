const contactService = require("../services/contactService");
const response = require("../utils/response");
const {
  greetingSchema,
  getMessagesSchema,
  changeStatusSchema,
} = require("../middleware/Validation");
const axios = require("axios");
const { CAPTCHA_VERIFY_URL, ERROR_MESSAGES } = require("../config/constants");
const jwt = require("jsonwebtoken");
const jwtUtils = require("../utils/jwtUtils");

const submitContact = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = greetingSchema.validate(req.body);
    if (error) {
      return response.validationError(
        res,
        error.details[0].message.replace(/"/g, "")
      );
    }

    const {
      contact_name,
      contact_email,
      contact_greeting,
      contact_ip,
      contact_country,
      contact_captcha_token,
    } = value;

    // Step 1: Verify CAPTCHA before proceeding
    const verifyUrl = CAPTCHA_VERIFY_URL;
    const captchaResponse = await axios.post(verifyUrl, null, {
      params: {
        secret: process.env.CAPTCHA_SECRET_KEY,
        response: contact_captcha_token,
        remoteip: contact_ip, // optional
      },
    });
    if (!captchaResponse.data.success) {
      return response.validationError(
        res,
        ERROR_MESSAGES.CAPTCHA_VERIFICATON_FAILED
      );
    }
    const verifiedCaptchaToken = "Verified";

    // Step 2: Create contact record
    const contactId = await contactService.createContact({
      contact_name,
      contact_email,
      contact_greeting,
      contact_ip,
      contact_country,
      contact_captcha_token: verifiedCaptchaToken,
    });

    return response.success(res, null, ERROR_MESSAGES.CONTACT_SUCCESS, 201);
  } catch (error) {
    console.error("Contact submission error:", error);
    return response.error(res, ERROR_MESSAGES.CONTACT_FAIL, 500);
  }
};

const getMessages = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = getMessagesSchema.validate(req.body);
    if (error) {
      return response.validationError(
        res,
        error.details[0].message.replace(/"/g, "")
      );
    }

    const { token, currentPage, itemsPerPage, filters, search } = value;

    // // Verify admin token and get admin_id from token
    // const decoded = jwtUtils.verifyTokenAndRespond(
    //   res,
    //   token,
    //   process.env.JWT_SECRET
    // );
    // const admin_id = decoded?.id;

    // // Verify admin token is valid and session is active
    // const isTokenValid = await contactService.verifyAdminToken(admin_id, token);
    // if (!isTokenValid) {
    //   return response.unauthorized(res, ERROR_MESSAGES.INVALID_OR_EXPIRE_TOKEN);
    // }

    // The service should handle pagination and return both the paginated data and the total count.
    const { messages, totalItems, currentPage: actualPage } = await contactService.getAllMessages(
      currentPage,
      itemsPerPage,
      filters,
      search
    );

    const formattedMessages = messages.map((msg) => ({
      id: msg.contact_id,
      name: msg.contact_name,
      email: msg.contact_email,
      message: msg.contact_greeting,
      status: msg.status,
      country: msg.contact_country,
      ip_address: msg.contact_ip,
      submitted_at: msg.created_on,
    }));

    const allData = {
      messages: formattedMessages,
      totalItems: totalItems,
      totalPages: Math.ceil(totalItems / itemsPerPage),
      currentPage: actualPage
    };

    return response.success(
      res,
      allData,
      "Messages fetched successfully"
    );
  } catch (error) {
    console.error("Error in getMessages:", error);
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return response.unauthorized(res, ERROR_MESSAGES.INVALID_TOKEN);
    }
    return response.error(res, error.message);
  }
};

const changeStatus = async (req, res) => {
  try {
    const { error, value } = changeStatusSchema.validate(req.body);
    if (error) {
      return response.validationError(
        res,
        error.details[0].message.replace(/"/g, "")
      );
    }

    const { token, status, contact_id } = value;

    // const decoded = jwtUtils.verifyTokenAndRespond(
    //   res,
    //   token,
    //   process.env.JWT_SECRET
    // );
    // const admin_id = decoded?.id;

    // const isTokenValid = await contactService.verifyAdminToken(admin_id, token);
    // if (!isTokenValid) {
    //   return response.unauthorized(res, ERROR_MESSAGES.INVALID_OR_EXPIRE_TOKEN);
    // }

    const updatedStatus = await contactService.updateStatus(status, contact_id);

    return response.success(
      res,
      updatedStatus,
      ERROR_MESSAGES.MESSAGE_STATUS_UPDATED
    );
  } catch (error) {
    console.error("Error in changeStatus:", error);
    return response.error(res, ERROR_MESSAGES.MESSAGE_STATUS_UPDATE_FAILED);
  }
};

module.exports = {
  submitContact,
  getMessages,
  changeStatus,
};
