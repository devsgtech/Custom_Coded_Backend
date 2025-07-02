const uploadService = require('../services/uploadService');
const metaService = require('../services/metaService');
const response = require('../utils/response');
const jwtUtils = require('../utils/jwtUtils');
const { uploadVideoSchema } = require('../middleware/Validation');
const { ERROR_MESSAGES, BASE_URL_LIVE } = require('../config/constants');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

// Upload video
const uploadVideo = async (req, res) => {
    try {
        // Validate request body
        const { error, value } = uploadVideoSchema.validate(req.body);
        if (error) {
            return response.validationError(res, error.details[0].message.replace(/"/g, ''));
        }

        const { token, code_id, text ,background_asset_id, overlay_asset_id, font_color_asset_id, font_type_asset_id, text_alignment } = value;
        let text_align = "";
        if(text_alignment == "right"){
            text_align = 'w-text_w-10';
        }else if(text_alignment == "left"){
            text_align = '10';
        }else{
            text_align = '(w-text_w)/2';
        }
        const metas1 = await metaService.getMetaDetails(background_asset_id);
        const fetched_background_asset_path = metas1.data[0].meta_value;
        const metas2 = await metaService.getMetaDetails(overlay_asset_id);
        const fetched_overlay_asset_path = metas2.data[0].meta_value;
        const metas3 = await metaService.getMetaDetails(font_color_asset_id);
        const fetched_font_color_asset_path = metas3.data[0].meta_value;
        const metas4 = await metaService.getMetaDetails(font_type_asset_id);
        const fetched_font_type_asset_path = metas4.data[0].remarks;
        // Verify user token and get user_id from token FIRST
        const decoded = jwtUtils.verifyTokenAndRespond(res, token, process.env.JWT_SECRET);
        if (!decoded) {
            // Delete the uploaded file since token is invalid
            if (req.file && req.file.path) {
                try {
                    fs.unlinkSync(req.file.path);
                    console.log('Deleted uploaded file due to invalid token:', req.file.filename);
                } catch (deleteError) {
                    console.error('Error deleting file:', deleteError);
                }
            }
            return; // Response already sent by verifyTokenAndRespond
        }
        
        const user_id = decoded;
        
        console.log("generated_code_id",user_id.generated_code_id)
        
        // Check if code_id matches the generated_code_id from token
        if (code_id !== user_id.generated_code_id) {
            // Delete the uploaded file since code_id is invalid
            if (req.file && req.file.path) {
                try {
                    fs.unlinkSync(req.file.path);
                    console.log('Deleted uploaded file due to invalid code_id:', req.file.filename);
                } catch (deleteError) {
                    console.error('Error deleting file:', deleteError);
                }
            }
            return response.unauthorized(res, "Invalid Code Id");
        }

        // Check if a video already exists for this code_id and delete it BEFORE processing new file
        const existingAttachments = await uploadService.getAttachmentsByCodeId(code_id);
        if (existingAttachments.success && existingAttachments.data && existingAttachments.data.length > 0) {
            console.log('Found existing videos for code_id:', code_id, 'Deleting old files and updating database...');
            
            // Delete the previous video files from server
            for (const attachment of existingAttachments.data) {
                try {
                    // Use the correct path including 'public' directory
                    const videoPath = path.join(__dirname, '..', '..', 'public', attachment.uploded_video_path);
                    console.log('Attempting to delete video file at:', videoPath);
                    
                    if (fs.existsSync(videoPath)) {
                        fs.unlinkSync(videoPath);
                        console.log('Successfully deleted previous video file:', attachment.uploded_video_path);
                    } else {
                        console.log('Video file not found at path:', videoPath);
                    }
                } catch (deleteError) {
                    console.error('Error deleting previous video file:', deleteError);
                }
            }
        }

        // Now check if new file was uploaded
        if (!req.file) {
            return response.validationError(res, 'No video file uploaded');
        }

        // Check video file size (200MB = 200 * 1024 * 1024 bytes)
        const maxSizeInBytes = 200 * 1024 * 1024; // 200MB
        if (req.file.size > maxSizeInBytes) {
            // Delete the uploaded file since it's too large
            try {
                fs.unlinkSync(req.file.path);
                console.log('Deleted uploaded file due to size limit:', req.file.filename);
            } catch (deleteError) {
                console.error('Error deleting oversized file:', deleteError);
            }
            return response.validationError(res, 'Video size exceeds 200MB limit');
        }
        
        // Create relative path for database storage
        const relativePath = path.join('videos/attachements', req.file.filename).replace(/\\/g, '/');
        console.log("$$$$$",relativePath)

        // Process video with FFmpeg using dynamic template and text
        const projectRoot = path.join(__dirname, '..', '..');
        const backgroundPath = path.join(projectRoot, `public${fetched_background_asset_path}`);
        const fontPath = path.join(projectRoot, `public/fonts/${fetched_font_type_asset_path}`);
        const iconPath = path.join(projectRoot, `public/backend_overlay${fetched_overlay_asset_path}`);
        const userVideoPath = path.join(projectRoot, 'public', relativePath);
        const finalVideoPath = path.join(projectRoot, 'public/finalvideo_2', `${code_id}_${Date.now()}.mp4`);

        // Ensure finalvideo_2 directory exists
        const finalVideoDir = path.dirname(finalVideoPath);
        if (!fs.existsSync(finalVideoDir)) {
            fs.mkdirSync(finalVideoDir, { recursive: true });
        }

        // FFmpeg command with dynamic text overlay
        const ffmpegCommandd = `ffmpeg -i "${backgroundPath}" -i "${userVideoPath}" -i "${iconPath}" -filter_complex "[1:v][0:v] scale2ref=w=iw*0.7:h=ih*0.55 [user_scaled][bg]; [bg][user_scaled] overlay=x='main_w*0.15':y='main_h*0.05' [tmp]; [tmp][2:v] overlay=10:10 [video_with_icons]; [video_with_icons] drawtext=text='${text}':fontcolor=white:fontsize=16:x=main_w*0.02 + (main_w*0.96 - text_w)/2:y=main_h*0.6 + main_h*0.15:box=1:boxcolor=black@0.5:boxborderw=5:line_spacing=4:enable='gte(t,0)'" -map "0:a?" -c:a copy -c:v libx264 -pix_fmt yuv420p "${finalVideoPath}"`;
        const ffmpegCommand = `ffmpeg -i "${userVideoPath}" -stream_loop -1 -i "${backgroundPath}" -stream_loop -1 -i "${iconPath}" -filter_complex " [0:v]setpts=PTS-STARTPTS, scale=w='if(lt(a,0.75),min(iw,720))':h='if(lt(a,0.75),min(ih,1280))':force_original_aspect_ratio=decrease[user_scaled]; [1:v]setpts=PTS-STARTPTS[bg]; [2:v]setpts=PTS-STARTPTS[icon]; [bg][user_scaled]overlay=x=(W-w)/2:y=80[tmp1]; [tmp1][icon]overlay=10:10[tmp2]; [tmp2]drawtext=fontfile='${fontPath}':text='${text}':fontcolor='${fetched_font_color_asset_path}':fontsize=26:x='${text_align}':y=h*0.76:box=1:boxcolor=black@0.5:boxborderw=5:line_spacing=4:enable='gte(t,0)'[final]" -map "[final]" -map "0:a?" -t "$(ffprobe -v error -select_streams v:0 -show_entries stream=duration -of default=nw=1:nk=1 "${userVideoPath}")" -c:v libx264 -pix_fmt yuv420p -c:a copy "${finalVideoPath}"`;

        console.log('Executing FFmpeg command:', ffmpegCommand);

        try {
            const { stdout, stderr } = await execAsync(ffmpegCommand);
            console.log('FFmpeg stdout:', stdout);
            if (stderr) {
                console.log('FFmpeg stderr:', stderr);
            }
            console.log('FFmpeg processing completed successfully');
        } catch (ffmpegError) {
            console.error('FFmpeg processing failed:', ffmpegError);
            // Delete the uploaded file if FFmpeg fails
            try {
                fs.unlinkSync(req.file.path);
                console.log('Deleted uploaded file due to FFmpeg error:', req.file.filename);
            } catch (deleteError) {
                console.error('Error deleting file after FFmpeg error:', deleteError);
            }
            return response.error(res, 'Video processing failed');
        }

        // Create attachment record with final video path
        const finalVideoRelativePath = path.relative(path.join(projectRoot, 'public'), finalVideoPath).replace(/\\/g, '/');
        
        let result;
        if (existingAttachments.success && existingAttachments.data && existingAttachments.data.length > 0) {
            // Update existing record
            result = await uploadService.updateAttachmentByCodeId(code_id, {
                uploded_video_path: finalVideoRelativePath
            });
        } else {
            // Create new record
            result = await uploadService.createAttachment({
                uploded_video_path: finalVideoRelativePath,
                code_id: code_id
            });
        }

        if (!result.success) {
            // Delete both uploaded and final files if database operation fails
            try {
                fs.unlinkSync(req.file.path);
                if (fs.existsSync(finalVideoPath)) {
                    fs.unlinkSync(finalVideoPath);
                }
                console.log('Deleted files due to database error');
            } catch (deleteError) {
                console.error('Error deleting files:', deleteError);
            }
            return response.error(res, result.error);
        }

        // Delete the uploaded video file from attachments folder after successful processing
        try {
            if (req.file && req.file.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
                console.log('Successfully deleted uploaded video file from attachments:', req.file.filename);
            }
        } catch (deleteError) {
            console.error('Error deleting uploaded video file after successful processing:', deleteError);
            // Don't return error here as the main operation was successful
        }

        return response.success(res, {
            uploded_id: result.data.uploded_id,
            uploded_video_path: BASE_URL_LIVE + "/" +  result.data.uploded_video_path,
            final_video_path: BASE_URL_LIVE + "/" +  finalVideoRelativePath
        }, ERROR_MESSAGES.VIDEO_UPLOAD_SUCCESS);

    } catch (error) {
        console.error('Error in uploadVideo:', error);
        // Delete the uploaded file if any error occurs
        if (req.file && req.file.path) {
            try {
                fs.unlinkSync(req.file.path);
                console.log('Deleted uploaded file due to error:', req.file.filename);
            } catch (deleteError) {
                console.error('Error deleting file:', deleteError);
            }
        }
        return response.error(res, ERROR_MESSAGES.VIDEO_UPLOAD_FAIL);
    }
};

// Get attachment by ID
const getAttachment = async (req, res) => {
    try {
        const { uploded_id } = req.params;
        
        const result = await uploadService.getAttachmentById(uploded_id);
        
        if (!result.success) {
            return response.error(res, result.error);
        }

        if (!result.data) {
            return response.notFound(res, ERROR_MESSAGES.VIDEO_NOT_FOUND);
        }

        return response.success(res, result.data);

    } catch (error) {
        console.error('Error in getAttachment:', error);
        return response.error(res, ERROR_MESSAGES.VIDEO_FETCH_FAIL);
    }
};

// Get attachments by code_id
const getAttachmentsByCodeId = async (req, res) => {
    try {
        const { code_id } = req.params;
        
        const result = await uploadService.getAttachmentsByCodeId(code_id);
        
        if (!result.success) {
            return response.error(res, result.error);
        }

        return response.success(res, result.data);

    } catch (error) {
        console.error('Error in getAttachmentsByCodeId:', error);
        return response.error(res, ERROR_MESSAGES.VIDEO_FETCH_FAIL);
    }
};

module.exports = {
    uploadVideo,
    getAttachment,
    getAttachmentsByCodeId
}; 