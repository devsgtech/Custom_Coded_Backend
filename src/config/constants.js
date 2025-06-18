// const BASE_URL_LIVE = 'http://localhost:5000';
const BASE_URL_LIVE          = 'https://customcodedweb-api.orientaloutsourcing.com';
const CAPTCHA_VERIFY_URL     = 'https://www.google.com/recaptcha/api/siteverify';

const ERROR_MESSAGES = {
  CAPTCHA_VERIFICATON_FAILED: 'Captcha verification failed.',
  CONTACT_SUCCESS: 'Contact form submitted successfully',
  CONTACT_FAIL: 'Failed to submit contact form',
  INVALID_EMAIL_OR_PASSWORD: 'Invalid email or password',
  LOGIN_SUCCESS: 'Admin Login Successful',
  CATEGORY_SUCCESS: 'Categories fetched successfully',
  INVALID_OR_EXPIRE_TOKEN: 'Invalid or expired token',
  INVALID_TOKEN: 'Invalid token',
  TOKEN_EXPIRED: 'Token has expired',
  TOKEN_MALFORMED: 'Token is malformed',
  TOKEN_INVALID_SIGNATURE: 'Token signature is invalid',
  TOKEN_INVALID_ISSUER: 'Token issuer is invalid',
  TOKEN_INVALID_AUDIENCE: 'Token audience is invalid',
  TOKEN_INVALID_ALGORITHM: 'Token algorithm is invalid',
  TOKEN_MISSING: 'Token is missing',
  CREATE_CATEGORY_SUCCESS: 'Category created successfully',
  FAQ_SUCCESS: 'FAQ created successfully',
  FAQ_UPDATE_SUCCESS: 'FAQ updated successfully',
  FAQ_DELETE_SUCCESS: 'FAQ deleted successfully',
  FAQ_FETCH_SUCCESS: 'FAQs fetched successfully',
  META_FETCH_SUCCESS: 'Metas fetched successfully',
  META_NOT_FOUND: 'Meta data not found',
  META_SUCCESS: 'Meta created successfully',
  CODE_SUCCESS: 'Code id created successfully',
  INVALID_CATEGORY_ID: 'Invalid Category ID',
  INVALID_CODE_ID: 'Invalid Credentials, please try again',
  INVALID_CODE: 'Invalid Credentials, please try again',
  // INVALID_CODE_ID: 'Invalid Code ID',
  // INVALID_CODE: 'Invalid Code',
  USER_LOGIN_SUCCESS: 'User Login Successful',
  VIDEO_UPLOAD_SUCCESS: 'Video uploaded successfully',
  VIDEO_UPLOAD_FAIL: 'Failed to upload video',
  VIDEO_NOT_FOUND: 'Video not found',
  VIDEO_FETCH_FAIL: 'Failed to fetch video',
  VIDEO_SIZE_EXCEEDED: 'Video size exceeds 100MB limit',
  INVALID_VIDEO_TYPE: 'Invalid video file type. Only mp4, mov, avi, wmv, flv, and mkv files are allowed'
};

const GeneralLogTypes = Object.freeze({
  AUTH_FAIL: 'Auth_Fail',
  MFA_FAIL: 'MFA_Fail',
  LOGIN: 'Login',
  LOGOUT: 'Logout',
  PERMISSION_CHANGE: 'Permission Change',
  UPDATE_SETTINGS: 'Update Settings',
  CLICK: 'Click',
  PREFERENCE_CHANGE: 'Preference Change',
  PURCHASE: 'Purchase',
  IP_BAN: 'IP_Ban',
  HONEYPOT_TRIGGERED: 'Honeypot_Triggered',
});

const SessionTime = Object.freeze({
  ADMIN_JWT_TOKEN_EXPIRE_TIME: '24h',
  ADMIN_TOKEN_EXPIRY_TIME: 24,
  USER_JWT_TOKEN_EXPIRE_TIME: '24h',
  USER_TOKEN_EXPIRY_TIME: 24,
});

module.exports = {
  BASE_URL_LIVE,
  CAPTCHA_VERIFY_URL,
  ERROR_MESSAGES,
  GeneralLogTypes,
  SessionTime
};