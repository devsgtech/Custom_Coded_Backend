const uploadService = require('../services/uploadService');
const metaService = require('../services/metaService');
const response = require('../utils/response');
const jwtUtils = require('../utils/jwtUtils');
const { uploadVideoSchema, checkVideoStatusSchema } = require('../middleware/Validation');
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
        console.log("req.body",req.body);
        const { error, value } = uploadVideoSchema.validate(req.body);
        if (error) {
            return response.validationError(res, error.details[0].message.replace(/"/g, ''));
        }

        const { token, code_id, text, background_asset_id, overlay_asset_id, font_color_asset_id, font_type_asset_id, upload_path_id, text_alignment } = value;
        console.log("upload_path_id", upload_path_id);
        let text_align = "";
        if (text_alignment == "right") {
            text_align = 'w-text_w-10';
        } else if (text_alignment == "left") {
            text_align = '10';
        } else {
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
            return; // Response already sent by verifyTokenAndRespond
        }
        const user_id = decoded;
        if (code_id !== user_id.generated_code_id) {
            return response.unauthorized(res, "Invalid Code Id");
        }

        // Check if a video already exists for this code_id and delete it BEFORE processing new file
        const existingAttachments = await uploadService.getAttachmentsByCodeId(code_id);
        if (existingAttachments.success && existingAttachments.data && existingAttachments.data.length > 0) {
            for (const attachment of existingAttachments.data) {
                try {
                    if (attachment.uploded_video_path) { // Only if path is not null/empty
                        const videoPath = path.join(__dirname, '..', '..', 'public', attachment.uploded_video_path);
                        if (fs.existsSync(videoPath)) {
                            fs.unlinkSync(videoPath);
                        }
                    }
                } catch (deleteError) {
                    console.error('Error deleting previous video file:', deleteError);
                }
            }
        }

        // 1. Find all chunk files in the upload_path_id directory
        const projectRoot = path.join(__dirname, '..', '..');
        const chunksDir = path.join(projectRoot, 'public', 'videos', 'attachements', upload_path_id);
        if (!fs.existsSync(chunksDir)) {
            return response.validationError(res, `No chunks found for upload_path_id: ${upload_path_id}`);
        }
        let chunkFiles = fs.readdirSync(chunksDir)
            .filter(f => f.startsWith('chunk_'))
            .map(f => ({
                name: f,
                number: parseInt(f.match(/chunk_(\d+)/)?.[1] || '0', 10)
            }))
            .sort((a, b) => a.number - b.number)
            .map(f => f.name);
        if (chunkFiles.length === 0) {
            return response.validationError(res, `No chunk files found in ${chunksDir}`);
        }

        // Clear the video path in DB before starting processing
        await uploadService.updateAttachmentByCodeId(code_id, { uploded_video_path: null });

        // Start video processing in the background
        (async () => {
            try {
                // Log the chunk files to be merged
                console.log('Chunk files to merge:', chunkFiles);
                // 2. Concatenate chunks into a single file (binary merge)
                const mergedFilename = `merged_${code_id}_${Date.now()}` + path.extname(chunkFiles[0]);
                const mergedFilePath = path.join(chunksDir, mergedFilename);
                const writeStream = fs.createWriteStream(mergedFilePath);
                for (const chunkFile of chunkFiles) {
                    const chunkPath = path.join(chunksDir, chunkFile);
                    console.log('Merging chunk:', chunkPath);
                    const data = fs.readFileSync(chunkPath);
                    writeStream.write(data);
                }
                writeStream.end();
                // Wait for the stream to finish
                await new Promise((resolve, reject) => {
                    writeStream.on('finish', resolve);
                    writeStream.on('error', reject);
                });

                // 4. Continue with video processing as before, using mergedFilePath as userVideoPath
                const backgroundPath = path.join(projectRoot, `public${fetched_background_asset_path}`);
                const fontPath = path.join(projectRoot, `public/fonts/${fetched_font_type_asset_path}`);
                const iconPath = path.join(projectRoot, `public/backend_overlay${fetched_overlay_asset_path}`);
                const finalVideoPath = path.join(projectRoot, 'public/finalvideo_2', `${code_id}_${Date.now()}.mp4`);
                const finalVideoDir = path.dirname(finalVideoPath);
                if (!fs.existsSync(finalVideoDir)) {
                    fs.mkdirSync(finalVideoDir, { recursive: true });
                }
                const ffmpegCommand = `ffmpeg -i "${mergedFilePath}" -stream_loop -1 -i "${backgroundPath}" -stream_loop -1 -i "${iconPath}" -filter_complex " [0:v]setpts=PTS-STARTPTS, scale=w='if(lt(a,0.75),min(iw,720))':h='if(lt(a,0.75),min(ih,1280))':force_original_aspect_ratio=decrease[user_scaled]; [1:v]setpts=PTS-STARTPTS[bg]; [2:v]setpts=PTS-STARTPTS[icon]; [bg][user_scaled]overlay=x=(W-w)/2:y=80[tmp1]; [tmp1][icon]overlay=10:10[tmp2]; [tmp2]drawtext=fontfile='${fontPath}':text='${text}':fontcolor='${fetched_font_color_asset_path}':fontsize=28:x='${text_align}':y=h*0.76:box=1:boxcolor=black@0.5:boxborderw=5:line_spacing=1:enable='gte(t,0)'[final]" -map "[final]" -map "0:a?" -t "$(ffprobe -v error -select_streams v:0 -show_entries stream=duration -of default=nw=1:nk=1 \"${mergedFilePath}\")" -c:v libx264 -pix_fmt yuv420p -c:a copy "${finalVideoPath}"`;
                try {
                    const { stdout, stderr } = await execAsync(ffmpegCommand);
                    console.log('FFmpeg processing stdout:', stdout);
                    if (stderr) console.log('FFmpeg processing stderr:', stderr);
                } catch (ffmpegError) {
                    console.error('FFmpeg processing failed:', ffmpegError);
                    // Optionally, update DB with error status
                    return;
                }

                // 5. Save final video path in DB
                const finalVideoRelativePath = path.relative(path.join(projectRoot, 'public'), finalVideoPath).replace(/\\/g, '/');
                await uploadService.updateAttachmentByCodeId(code_id, {
                    uploded_video_path: finalVideoRelativePath
                });

                // 6. Clean up merged file, chunks.txt, and chunk directory (optional)
                // try {
                //     if (fs.existsSync(mergedFilePath)) fs.unlinkSync(mergedFilePath);
                //     if (fs.existsSync(chunksTxtPath)) fs.unlinkSync(chunksTxtPath); // Clean up chunks.txt
                //     // Delete the entire chunk directory
                //     if (fs.existsSync(chunksDir)) fs.rmSync(chunksDir, { recursive: true, force: true });
                // } catch (cleanupError) {
                //     console.error('Cleanup error:', cleanupError);
                // }
            } catch (error) {
                console.error('Error in background video processing:', error);
            }
        })();

        // Respond immediately that processing has started
        return response.success(res, { status: "processing" }, "Video is being processed. Please check status later.");

    } catch (error) {
        console.error('Error in uploadVideo:', error);
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

// Upload video chunk (for chunked upload)
const uploadVideoChunk = async (req, res) => {
    try {
        // const { error, value } = uploadVideoSchema.validate(req.body);
        // Extract fields from form-data
        const { uploadId, chunkNumber, token } = req.body;
        console.log("req.body",req.body)
        const missingFields = [];
        if (!uploadId) missingFields.push('uploadId #####');
        // if (!filename) missingFields.push('filename');
        if (!chunkNumber) missingFields.push('chunkNumber');
        if (!token) missingFields.push('token');
        if (!req.file) missingFields.push('chunk (file)');
        if (missingFields.length > 0) {
            return response.validationError(
                res,
                `Missing required field(s): ${missingFields.join(', ')}`
            );
        }

        // Validate token (admin or user)
        const decoded = jwtUtils.verifyTokenAndRespond(res, token, process.env.JWT_SECRET);
        if (!decoded) {
            return; // Response already sent by verifyTokenAndRespond
        }

        // Save chunk to public/videos/attachements/{uploadId}/chunk_{chunkNumber}.{ext}
        const uploadDir = path.join(__dirname, '..','..', 'public', 'videos', 'attachements', uploadId);
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        // Get file extension from uploaded file's original name
        const ext = path.extname(req.file.originalname) || '';
        const chunkPath = path.join(uploadDir, `chunk_${chunkNumber}${ext}`);
        fs.writeFile(chunkPath, req.file.buffer, (err) => {
            if (err) {
                console.error('Error saving chunk:', err);
                return response.error(res, 'Failed to save chunk');
            }
            return res.json({ status: true, message: 'Chunk uploaded successfully' });
        });
    } catch (error) {
        console.error('Error in uploadVideoChunk:', error);
        return response.error(res, error.message);
    }
};

// Polling API: Check video processing status
const checkVideoStatus = async (req, res) => {
    try {
        // Validate request body using Joi schema
        const { error, value } = checkVideoStatusSchema.validate(req.body);
        if (error) {
            return response.validationError(res, error.details[0].message.replace(/"/g, ''));
        }
        const { token, code_id } = value;
        // 1. Verify token
        const decoded = jwtUtils.verifyTokenAndRespond(res, token, process.env.JWT_SECRET);
        if (!decoded) return; // Response already sent

        // 2. Check code_id matches user
        const user_id = decoded;
        if (code_id !== user_id.generated_code_id) {
            return response.unauthorized(res, "Invalid Code Id");
        }

        // 3. Check DB for video path
        const attachment = await uploadService.getAttachmentsByCodeId(code_id);
        if (!attachment.success || !attachment.data || attachment.data.length === 0) {
            return response.notFound(res, "Code ID not found");
        }
        if (attachment.data[0].uploded_video_path) {
            return res.json({
                status: "done",
                video_url: BASE_URL_LIVE + "/" + attachment.data[0].uploded_video_path
            });
        } else {
            return res.json({ status: "processing", video_url: "" });
        }
    } catch (error) {
        console.error('Error in checkVideoStatus:', error);
        return response.error(res, "Failed to check video status");
    }
};

module.exports = {
    uploadVideo,
    getAttachment,
    getAttachmentsByCodeId,
    uploadVideoChunk,
    checkVideoStatus
}; 