<<<<<<< Updated upstream
const metaService = require('../services/metaService');
const response = require('../utils/response');
const jwt = require('jsonwebtoken');
const { createmetaSchema, getmetaSchema } = require('../middleware/Validation');
const { BASE_URL_LIVE, ERROR_MESSAGES } = require('../config/constants');
const ipBanService = require('../services/ipBanService');

// Get all Metas
const getmetaList = async (req, res) => {
    try {
        const { error, value } = getmetaSchema.validate(req.body);
        if (error) {
            return response.validationError(res, error.details[0].message.replace(/"/g, ''));
        }
        const {meta_group,ip_address} = value;
        const checkIpBanned = await ipBanService.checkIpBanned(ip_address);
        
        console.log("metaGroup",meta_group);
        const metas = await metaService.getAllMetas(meta_group);

        if (metas.success) {
            const processedMetas = metas.data.map(item => {
                if (item.meta_key === "image_array_one_preview" || item.meta_key === "image_array_two_preview") {
                    return {
                        ...item,
                        meta_value: item.meta_value
                            .split(',')
                            .map(path => `${BASE_URL_LIVE}${path.trim()}`)
                    };
                }
                if (item.meta_key === "font_types_array_preview") {
                    return {
                        ...item,
                        meta_value: item.meta_value
                            .split(',')
                            .map(path => `${path.trim()}`)
                    };
                }

                if (item.meta_key === "page_logo_preview" || item.meta_key === "page_background_image_preview" || 
                    item.meta_key === "video_preview" || item.meta_key === "favicon_website_info" || 
                    item.meta_key === "logo_website_info" || item.meta_key === "backgroundVideo_home" ||
                    item.meta_key ==="backgroundImage_shop"|| item.meta_key === "backgroundImage_faq" ||
                    item.meta_key === "backgroundImage_contact") {
                    return {
                        ...item,
                        meta_value: `${BASE_URL_LIVE}${item.meta_value.trim()}`
                    };
                }

                return item;
            });
            const simplifiedObject = processedMetas.reduce((acc, item) => {
                acc[item.meta_key] = item.meta_value;
                return acc;
              }, {});
            return response.success(res, { success: true, data: {
                meta:simplifiedObject,
                checkIpBanned:checkIpBanned
            } }, ERROR_MESSAGES.META_FETCH_SUCCESS);
        } else {
            return response.success(res, { success: false, data: [] }, ERROR_MESSAGES.META_NOT_FOUND);
        }
    } catch (error) {
        console.error('Error in getMetaList:', error);
        return response.error(res, error.message);
=======
const metaService = require("../services/metaService");
const response = require("../utils/response");
const jwt = require("jsonwebtoken");
const {
  createmetaSchema,
  getmetaSchema,
  fetchAdminUsersSchema,
  updateMetaSchema,
  findMetaById,
  deleteMetaSchema,
  addMetaAssetSchema
} = require("../middleware/Validation");
const { BASE_URL_LIVE, ERROR_MESSAGES } = require("../config/constants");
const ipBanService = require("../services/ipBanService");
const multer = require("multer");
const fs = require("fs");
// const path = require("path");

// Get all Metas
const getmetaList = async (req, res) => {
  try {
    const { error, value } = getmetaSchema.validate(req.body);
    if (error) {
      return response.validationError(
        res,
        error.details[0].message.replace(/"/g, "")
      );
>>>>>>> Stashed changes
    }
    const { meta_group, ip_address } = value;
    const checkIpBanned = await ipBanService.checkIpBanned(ip_address);

    console.log("metaGroup", meta_group);
    const metas = await metaService.getAllMetas(meta_group);

    if (metas.success) {
      const processedMetas = metas.data.map((item) => {
        if (
          item.meta_key === "image_array_one_preview" ||
          item.meta_key === "image_array_two_preview"
        ) {
          return {
            ...item,
            meta_value: item.meta_value
              .split(",")
              .map((path) => `${BASE_URL_LIVE}/public${path.trim()}`),
          };
        }
        if (item.meta_key === "font_types_array_preview") {
          return {
            ...item,
            meta_value: item.meta_value
              .split(",")
              .map((path) => `${path.trim()}`),
          };
        }
        if (
          item.meta_key === "page_logo_preview" ||
          item.meta_key === "page_background_image_preview" ||
          item.meta_key === "video_preview" ||
          item.meta_key === "favicon_website_info" ||
          item.meta_key === "logo_website_info" ||
          item.meta_key === "backgroundVideo_home" ||
          item.meta_key === "backgroundImage_shop" ||
          item.meta_key === "backgroundImage_faq" ||
          item.meta_key === "backgroundImage_contact"
        ) {
          return {
            ...item,
            meta_value: `${BASE_URL_LIVE}/public${item.meta_value.trim()}`,
          };
        }

        return item;
      });
      const simplifiedObject = processedMetas.reduce((acc, item) => {
        acc[item.meta_key] = item.meta_value;
        return acc;
      }, {});
      return response.success(
        res,
        {
          success: true,
          data: {
            meta: simplifiedObject,
            checkIpBanned: checkIpBanned,
          },
        },
        ERROR_MESSAGES.META_FETCH_SUCCESS
      );
    } else {
      return response.success(
        res,
        { success: false, data: [] },
        ERROR_MESSAGES.META_NOT_FOUND
      );
    }
  } catch (error) {
    console.error("Error in getMetaList:", error);
    return response.error(res, error.message);
  }
};

const fetchAllMetaList = async (req, res) => {
  try {
    const { error, value } = fetchAdminUsersSchema.validate(req.body);

    if (error) {
      return response.validationError(
        res,
        error.details[0].message.replace(/"/g, "")
      );
    }

    const { currentPage, itemsPerPage, filters, search } = value;

    const metaList = await metaService.fetchAllMetas(
      currentPage,
      itemsPerPage,
      filters,
      search
    );
    return response.success(res, metaList, ERROR_MESSAGES.META_FETCH_SUCCESS);
  } catch (error) {
    console.error(ERROR_MESSAGES.META_FETCH_FAIL, error);
    return response.error(res, ERROR_MESSAGES.META_FETCH_FAIL);
  }
};

// const fetchMetaById = async (req, res) => {
//   try {
//     const { error, value } = findMetaSchema.validate(req.body);
//     if(error) {
//       return response.validationError(res, error.details[0].message.replace(/"/g, ""));
//     }
//     const {meta_id} = value;
//     const meta = await metaService.fetchMetaById(meta_id);
//     return response.success(res, meta, ERROR_MESSAGES.META_FETCH_SUCCESS);
//   } catch {
//     console.error(ERROR_MESSAGES.META_FETCH_FAIL, error);
//     return response.error(res, ERROR_MESSAGES.META_FETCH_FAIL);
//   }
// }

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let dir = "public/assets/"; // Default directory

    if (req.body.meta_key === "overlay_video_path") {
      dir = "public/overlay/";
    } else if (req.body.meta_key === "template") {
      dir = "punlic/template/"
    } else if (req.body.meta_key === "image_array_one_preview") {
      dir = "public/images/image_array_one/";
    } else if (req.body.meta_key === "image_array_two_preview") {
      dir = "public/images/image_array_two/";
    } else if (req.body.meta_key === "background_video_path") {
      dir = "public/background/";
    } else if (req.body.meta_key === "font_type") {
      dir = "public/fonts/";
    } else if (file.mimetype.startsWith("image/")) {
      dir = "public/images/";
    } else if (file.mimetype.startsWith("video/")) {
      dir = "public/videos/";
    }

    // Create directory if it doesn't exist
    if (!require("fs").existsSync(dir)) {
      require("fs").mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

const updateMeta = async (req, res) => {
  try {
    const { error, value } = updateMetaSchema.validate(req.body);
    if (error) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return response.validationError(
        res,
        error.details[0].message.replace(/"/g, "")
      );
    }

    const { meta_id, meta_key, meta_value } = value;
    let final_meta_value;

    if (req.file) {
      const newFilePath = req.file.path
        .replace(/\\/g, "/")
        .replace("public", "");
      console.log("newFilePath ----------", newFilePath);
      const existingMetaResult = await metaService.fetchMetaById(meta_id);

      if (existingMetaResult.success && existingMetaResult.data.length > 0) {
        const oldDbMetaValue = existingMetaResult.data[0].meta_value;

        if (
          meta_key === "image_array_one_preview" ||
          meta_key === "image_array_two_preview"
        ) {
          let path_array = oldDbMetaValue
            ? oldDbMetaValue.split(",").map((p) => p.trim())
            : [];
          const index_to_replace = path_array.indexOf(meta_value);

          if (index_to_replace !== -1) {
            path_array[index_to_replace] = newFilePath;
            final_meta_value = path_array.join(",");

            const relativeOldPath = "public/" + meta_value;
            if (fs.existsSync(relativeOldPath)) {
              try {
                fs.unlinkSync(relativeOldPath);
              }
 catch (err) {
                console.error(
                  `Error deleting old file ${relativeOldPath}:`,
                  err
                );
              }
            }
          } else {
            fs.unlinkSync(req.file.path);
            return response.error(
              res,
              "The file specified in 'meta_value' was not found in the existing file list."
            );
          }
        } else {
          const oldFilePath = oldDbMetaValue;
          if (oldFilePath) {
            const relativePath = "public/" + oldFilePath;
            if (fs.existsSync(relativePath)) {
              try {
                fs.unlinkSync(relativePath);
              }
 catch (err) {
                console.error(`Error deleting file ${relativePath}:`, err);
              }
            }
          }
          final_meta_value = newFilePath;
        }
      } else {
        final_meta_value = newFilePath;
      }

      const updatedMeta = await metaService.updateMetaAsset(
        meta_id,
        final_meta_value
      );

      if (updatedMeta.success) {
        return response.success(res, updatedMeta, "Meta updated successfully");
      } else {
        if (req.file) fs.unlinkSync(req.file.path);
        return response.error(
          res,
          updatedMeta.message || "Failed to update meta."
        );
      }
    } else {
      const updatedMeta = await metaService.updateMetaAsset(
        meta_id,
        meta_value
      );
      if (updatedMeta.success) {
        return response.success(
          res,
          updatedMeta.data,
          "Meta updated successfully"
        );
      } else {
        return response.error(
          res,
          updatedMeta.message || "Failed to update meta."
        );
      }
    }
  }
 catch (error) {
    console.error("Error in updateMeta:", error);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    return response.error(res, "An internal server error occurred.");
  }
};

// Create meta
const createmeta = async (req, res) => {
<<<<<<< Updated upstream
    try {
        // Validate request body
        const { error, value } = createmetaSchema.validate(req.body);
        if (error) {
            return response.validationError(res, error.details[0].message.replace(/"/g, ''));
        }

        const { token, meta_data } = value;

        // Verify admin token and get admin_id from token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin_id = decoded.id;
        console.log("admin_id",admin_id);

        // Verify admin token
        const isTokenValid = await metaService.verifyAdminToken(admin_id, token);
        if (!isTokenValid) {
            return response.unauthorized(res, ERROR_MESSAGES.INVALID_OR_EXPIRE_TOKEN);
        }

        const metaId = await metaService.createMeta({ 
            meta_key: meta_data.meta_key, 
            meta_value: meta_data.meta_value,
            meta_group: meta_data.meta_group,
            is_delete: 0,
            admin_id: admin_id
        });
        return response.success(res, { id: metaId, ...meta_data }, ERROR_MESSAGES.META_SUCCESS);
    } catch (error) {
        console.error('Error in createMeta:', error);
        if (error.name === 'JsonWebTokenError') {
            return response.unauthorized(res, ERROR_MESSAGES.INVALID_TOKEN);
        }
        return response.error(res, error.message);
=======
  try {
    // Validate request body
    const { error, value } = createmetaSchema.validate(req.body);
    if (error) {
      return response.validationError(
        res,
        error.details[0].message.replace(/"/g, "")
      );
>>>>>>> Stashed changes
    }

    const { token, meta_data } = value;

    // Verify admin token and get admin_id from token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin_id = decoded.id;
    console.log("admin_id", admin_id);

    // Verify admin token
    const isTokenValid = await metaService.verifyAdminToken(admin_id, token);
    if (!isTokenValid) {
      return response.unauthorized(res, ERROR_MESSAGES.INVALID_OR_EXPIRE_TOKEN);
    }

    const metaId = await metaService.createMeta({
      meta_key: meta_data.meta_key,
      meta_value: meta_data.meta_value,
      meta_group: meta_data.meta_group,
      meta_remarks: meta_data.meta_remarks ? meta_data.meta_remarks : null,
      is_delete: 0,
      admin_id: admin_id,
    });
    return response.success(
      res,
      { id: metaId, ...meta_data },
      ERROR_MESSAGES.META_SUCCESS
    );
  }
 catch (error) {
    console.error("Error in createMeta:", error);
    if (error.name === "JsonWebTokenError") {
      return response.unauthorized(res, ERROR_MESSAGES.INVALID_TOKEN);
    }
    return response.error(res, error.message);
  }
};

<<<<<<< Updated upstream
module.exports = {
    getmetaList,
    createmeta
    
}; 
=======
const getTemplatesList = async (req, res) => {
  try {
    // --- Fetch color list from metaService ---
    let color_list = [];
    let background_list = [];
    let overlay_list = [];
    let template_list = [];
    let font_type_list = [];
    try {
      const metas = await metaService.getAllMetas("9,10,11,12,13");
      if (metas.success && Array.isArray(metas.data)) {
        color_list = metas.data
          .filter((item) => item.meta_key === "font_color")
          .map((item) => ({
            id: item.meta_id,
            type: item.meta_key,
            color_code: item.meta_value,
            name: item.remarks || "",
          }));
        background_list = metas.data
          .filter((item) => item.meta_key === "background_video_path")
          .map((item) => ({
            id: item.meta_id,
            type: item.meta_key,
            path: `${BASE_URL_LIVE}${item.meta_value.trim()}`,
            name: item.remarks || "",
          }));
        overlay_list = metas.data
          .filter((item) => item.meta_key === "overlay_video_path")
          .map((item) => ({
            id: item.meta_id,
            type: item.meta_key,
            path: `${BASE_URL_LIVE}${item.meta_value.trim()}`,
            name: item.remarks || "",
          }));
        template_list = metas.data
          .filter((item) => item.meta_key === "template")
          .map((item) => ({
            id: item.meta_id,
            type: item.meta_key,
            path: `${BASE_URL_LIVE}${item.meta_value.trim()}`,
            name: item.remarks || "",
          }));
        font_type_list = metas.data
          .filter((item) => item.meta_key === "font_type")
          .map((item) => ({
            id: item.meta_id,
            type: item.meta_key,
            path: `${BASE_URL_LIVE}${item.meta_value.trim()}`,
            name: item.remarks || "",
          }));
      }
    }
 catch (metaError) {
      console.error("Error fetching color list:", metaError);
    }
    // --- End color list logic ---

    return res.json({
      status: true,
      color_list,
      background_list,
      overlay_list,
      template_list,
      font_type_list,
    });
  }
 catch (error) {
    console.error("Error in getTemplatesList:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to fetch templates",
      error: error.message,
    });
  }
};

const deleteMeta = async (req, res) => {
  try {
    const { error, value } = deleteMetaSchema.validate(req.body);
    if (error) {
      return response.validationError(
        res,
        error.details[0].message.replace(/"/g, "")
      );
    }

    const { meta_id, meta_value } = value;
    const existingMetaResult = await metaService.fetchMetaById(meta_id);

    if (!existingMetaResult.success || existingMetaResult.data.length === 0) {
      return response.error(res, "Meta not found.");
    }

    const oldDbMetaValue = existingMetaResult.data[0].meta_value;
    const meta_key = existingMetaResult.data[0].meta_key;

    if (
      meta_key === "image_array_one_preview" ||
      meta_key === "image_array_two_preview"
    ) {
      let path_array = oldDbMetaValue
        ? oldDbMetaValue.split(",").map((p) => p.trim())
        : [];
      const index_to_remove = path_array.indexOf(meta_value);

      if (index_to_remove !== -1) {
        path_array.splice(index_to_remove, 1);
        const final_meta_value = path_array.join(",");

        const relativeOldPath = "public/" + meta_value;
        if (fs.existsSync(relativeOldPath)) {
          try {
            fs.unlinkSync(relativeOldPath);
          }
 catch (err) {
            console.error(
              `Error deleting old file ${relativeOldPath}:`,
              err
            );
          }
        }
        const updatedMeta = await metaService.updateMetaAsset(
          meta_id,
          final_meta_value
        );
        if (updatedMeta.success) {
          return response.success(res, updatedMeta, "Meta asset deleted successfully");
        } else {
          return response.error(
            res,
            updatedMeta.message || "Failed to update meta."
          );
        }
      } else {
        return response.error(
          res,
          "The file specified in 'meta_value' was not found in the existing file list."
        );
      }
    } else {
      const relativePath = "public/" + oldDbMetaValue;
      if (fs.existsSync(relativePath)) {
        try {
          fs.unlinkSync(relativePath);
        }
 catch (err) {
          console.error(`Error deleting file ${relativePath}:`, err);
        }
      }
      const deletedMeta = await metaService.deleteMeta(meta_id);
      if (deletedMeta.success) {
        return response.success(res, null, "Meta deleted successfully");
      } else {
        return response.error(
          res,
          deletedMeta.message || "Failed to delete meta."
        );
      }
    }
  }
 catch (error) {
    console.error("Error in deleteMeta:", error);
    return response.error(res, "An internal server error occurred.");
  }
};

const addMetaAsset = async (req, res) => {
  try {
    const { error, value } = addMetaAssetSchema.validate(req.body);
    if (error) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return response.validationError(
        res,
        error.details[0].message.replace(/"/g, "")
      );
    }

    const { meta_id, meta_key } = value;
    let final_meta_value;

    if (req.file) {
      const newFilePath = req.file.path
        .replace(/\\/g, "/")
        .replace("public", "");
      const existingMetaResult = await metaService.fetchMetaById(meta_id);

      if (existingMetaResult.success && existingMetaResult.data.length > 0) {
        const oldDbMetaValue = existingMetaResult.data[0].meta_value;

        if (
          meta_key === "image_array_one_preview" ||
          meta_key === "image_array_two_preview"
        ) {
          let path_array = oldDbMetaValue
            ? oldDbMetaValue.split(",").map((p) => p.trim())
            : [];
          path_array.push(newFilePath);
          final_meta_value = path_array.join(",");

        } else {
          final_meta_value = newFilePath;
        }
      } else {
        final_meta_value = newFilePath;
      }

      const updatedMeta = await metaService.updateMetaAsset(
        meta_id,
        final_meta_value
      );

      if (updatedMeta.success) {
        return response.success(res, updatedMeta, "Meta updated successfully");
      } else {
        if (req.file) fs.unlinkSync(req.file.path);
        return response.error(
          res,
          updatedMeta.message || "Failed to update meta."
        );
      }
    } else {
        return response.error(
          res,
          "No file uploaded"
        );
    }
  } catch (error) {
    console.error("Error in addMetaAsset:", error);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    return response.error(res, "An internal server error occurred.");
  }
};

module.exports = {
  getmetaList,
  createmeta,
  getTemplatesList,
  fetchAllMetaList,
  updateMeta,
  deleteMeta,
  addMetaAsset,
  // fetchMetaById,
  upload,
};
>>>>>>> Stashed changes
