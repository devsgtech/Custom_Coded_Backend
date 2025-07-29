const uploadService = require('../services/uploadService');
const metaService = require('../services/metaService');
const response = require('../utils/response');
const jwtUtils = require('../utils/jwtUtils');
const { uploadVideoSchema, checkVideoStatusSchema } = require('../middleware/Validation');
const { ERROR_MESSAGES, BASE_URL_LIVE } = require('../config/constants');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);
const { execSync } = require('child_process');

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
                // const ffmpegCommand = `ffmpeg -i "${mergedFilePath}" -stream_loop -1 -i "${backgroundPath}" -stream_loop -1 -i "${iconPath}" -filter_complex " [0:v]setpts=PTS-STARTPTS, scale=w='if(lt(a,0.75),min(iw,720))':h='if(lt(a,0.75),min(ih,1280))':force_original_aspect_ratio=decrease[user_scaled]; [1:v]setpts=PTS-STARTPTS[bg]; [2:v]setpts=PTS-STARTPTS[icon]; [bg][user_scaled]overlay=x=(W-w)/2:y=80[tmp1]; [tmp1][icon]overlay=10:10[tmp2]; [tmp2]drawtext=fontfile='${fontPath}':text='${text}':fontcolor='${fetched_font_color_asset_path}':fontsize=28:x='${text_align}':y=h*0.76:box=1:boxcolor=black@0.5:boxborderw=5:line_spacing=1:enable='gte(t,0)'[final]" -map "[final]" -map "0:a?" -t "$(ffprobe -v error -select_streams v:0 -show_entries stream=duration -of default=nw=1:nk=1 \"${mergedFilePath}\")" -c:v libx264 -pix_fmt yuv420p -c:a copy "${finalVideoPath}"`;

                //The below command is given by the client.
                const ffmpegCommand = `ffmpeg -i "${mergedFilePath}" -stream_loop -1 -i "${backgroundPath}" -stream_loop -1 -i "${iconPath}" -filter_complex " [0:v]setpts=PTS-STARTPTS, scale=w=720:h=1280:force_original_aspect_ratio=decrease[user_scaled]; [1:v]setpts=PTS-STARTPTS[bg]; [2:v]setpts=PTS-STARTPTS[icon]; [bg][user_scaled]overlay=x=(W-w)/2:y=80[tmp1]; [tmp1][icon]overlay=10:10[tmp2]; [tmp2]drawtext=fontfile='${fontPath}':text='${text}':fontcolor='${fetched_font_color_asset_path}':fontsize=28:x='${text_align}':y=h*0.7:box=1:boxcolor=black@0.5:boxborderw=5:line_spacing=4:enable='gte(t,0)'[final]" -map "[final]" -map "0:a?" -t "$(ffprobe -v error -select_streams v:0 -show_entries stream=duration -of default=nw=1:nk=1 \"${mergedFilePath}\")" -c:v libx264 -crf 23 -preset veryfast -pix_fmt yuv420p -c:a copy "${finalVideoPath}"`;
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
                try {
                    if (fs.existsSync(mergedFilePath)) fs.unlinkSync(mergedFilePath);
                //     if (fs.existsSync(chunksTxtPath)) fs.unlinkSync(chunksTxtPath); // Clean up chunks.txt
                //     // Delete the entire chunk directory
                    if (fs.existsSync(chunksDir)) fs.rmSync(chunksDir, { recursive: true, force: true });
                } catch (cleanupError) {
                    console.error('Cleanup error:', cleanupError);
                }
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

const uploadMediaToVideoController = async (req, res) => {
  try {
    const accountType = req.user.accountType || 'normal'; // 'normal' or 'premium'
    const photos = req.files['photos'] || [];
    const audio = req.files['audio'] ? req.files['audio'][0] : null;

    // Validation
    const maxPhotos = accountType === 'premium' ? 20 : 10;
    const maxAudioDuration = accountType === 'premium' ? 60 : 30; // seconds

    if (!audio) return res.status(400).json({ error: 'Audio file is required.' });
    if (photos.length === 0) return res.status(400).json({ error: 'At least one photo is required.' });
    if (photos.length > maxPhotos) return res.status(400).json({ error: `Max ${maxPhotos} photos allowed.` });

    // Check audio file size (max 10MB)
    if (audio.size > 10 * 1024 * 1024) return res.status(400).json({ error: 'Audio file too large (max 10MB).' });

    // Check photo file sizes
    for (let photo of photos) {
      if (photo.size > 3 * 1024 * 1024) {
        return res.status(400).json({ error: 'Each photo must be ≤3MB.' });
      }
    }

    // Prepare output directory
    const userId = req.user.id;
    const timestamp = req._uploadTimestamp || Date.now();
    const videoDir = path.join(__dirname, `../../uploads/videos/${userId}/${timestamp}`);
    fs.mkdirSync(videoDir, { recursive: true });
    const videoPath = path.join(videoDir, 'video.mp4');

    // Sort photos by original upload order (optional)
    photos.sort((a, b) => a.originalname.localeCompare(b.originalname));

    // Prepare ffmpeg input file list
    const photoListPath = path.join(videoDir, 'photos.txt');
    let photoListContent = '';
    photos.forEach(photo => {
      photoListContent += `file '${path.resolve(photo.path)}'\n`;
    });
    fs.writeFileSync(photoListPath, photoListContent);

    // Calculate duration per photo
    const durationPerPhoto = audioDuration / photos.length;

    // FFmpeg command to create video from images and audio
    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(photoListPath)
        .inputOptions(['-f concat', '-safe 0'])
        .input(audioPath)
        .outputOptions([
          '-vf', `fps=1/${durationPerPhoto},format=yuv420p,scale=1280:720`,
          '-shortest'
        ])
        .on('end', resolve)
        .on('error', reject)
        .save(videoPath);
    });

    // TODO: Save videoPath (and optionally photo/audio paths) in your DB, e.g., in upload_path_id

    // Respond with video path
    res.json({
      message: 'Video created successfully!',
      videoUrl: `/uploads/videos/${userId}/${timestamp}/video.mp4`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process media and create video.' });
  }
};

// Upload a single photo or audio file (not chunked)
const uploadMediaFileChunkless = async (req, res) => {
  try {
    const { uploadId, fileType, fileNumber, token } = req.body;
    if (!uploadId || !fileType || !token) {
      return res.status(400).json({ error: 'uploadId, fileType, and token are required.' });
    }
    // Validate token (admin or user)
    const decoded = jwtUtils.verifyTokenAndRespond(res, token, process.env.JWT_SECRET);
    if (!decoded) return;
    // Only allow photo or audio
    if (!['photo', 'audio'].includes(fileType)) {
      return res.status(400).json({ error: 'fileType must be photo or audio.' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'File is required.' });
    }
    // Save file to public/videos/attachements/{uploadId}/
    const uploadDir = path.join(__dirname, '..','..', 'public', 'videos', 'attachements', uploadId);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    let filename;
    if (fileType === 'photo') {
      if (!fileNumber) return res.status(400).json({ error: 'fileNumber is required for photo.' });
      const ext = path.extname(req.file.originalname) || '.jpg';
      filename = `photo_${fileNumber}${ext}`;
    } else {
      // audio
      const ext = path.extname(req.file.originalname) || '.mp3';
      filename = `audio${ext}`;
    }
    const filePath = path.join(uploadDir, filename);
    fs.writeFile(filePath, req.file.buffer, (err) => {
      if (err) {
        console.error('Error saving file:', err);
        return res.status(500).json({ error: 'Failed to save file.' });
      }
      return res.json({ status: true, message: 'File uploaded successfully', filename });
    });
  } catch (error) {
    console.error('Error in uploadMediaFileChunkless:', error);
    return res.status(500).json({ error: 'Failed to upload file.' });
  }
};

// Process uploaded photos and audio in a directory into a video
const processMediaToVideoFromPath = async (req, res) => {
  try {
    const { upload_path_id, token } = req.body;
    if (!upload_path_id || !token) {
      return res.status(400).json({ error: 'upload_path_id and token are required.' });
    }
    // Validate token (admin or user)
    const decoded = jwtUtils.verifyTokenAndRespond(res, token, process.env.JWT_SECRET);
    
    if (!decoded) return;
    const userId = typeof decoded === 'object' && decoded.code_id ? decoded.code_id : decoded;
    // Find all files in the directory
    const uploadDir = path.join(__dirname, '..','..', 'public', 'videos', 'attachements', upload_path_id);
    if (!fs.existsSync(uploadDir)) {
      return res.status(400).json({ error: `No files found for upload_path_id: ${upload_path_id}` });
    }
    // Get all photos and audio
    const files = fs.readdirSync(uploadDir);
    const photoFiles = files.filter(f => f.startsWith('photo_')).sort((a, b) => {
      // Sort by fileNumber
      const aNum = parseInt(a.match(/photo_(\d+)/)?.[1] || '0', 10);
      const bNum = parseInt(b.match(/photo_(\d+)/)?.[1] || '0', 10);
      return aNum - bNum;
    });
    const audioFile = files.find(f => f.startsWith('audio'));
    if (photoFiles.length === 0) return res.status(400).json({ error: 'No photos found.' });
    // Determine account type from request body, JWT, or default to 'normal'
    const accountType = req.body.accountType || decoded.accountType || 'normal';
    const maxPhotos = accountType === 'premium' ? 20 : 10;
    const maxAudioDuration = accountType === 'premium' ? 60 : 30;
    if (photoFiles.length > maxPhotos) return res.status(400).json({ error: `Max ${maxPhotos} photos allowed.` });
    // Validate file sizes
    for (let photo of photoFiles) {
      const stat = fs.statSync(path.join(uploadDir, photo));
      if (stat.size > 3 * 1024 * 1024) {
        return res.status(400).json({ error: 'Each photo must be ≤3MB.' });
      }
    }
    // Safely set audioPath only if audioFile is defined
    let audioPath = '';
    if (audioFile) {
      audioPath = path.join(uploadDir, audioFile);
    } else {
      console.warn('audioFile is undefined, proceeding without audio.');
    }
    // Only check audio file size and duration if audioFile is defined and exists
    let audioDuration = 0;
    if (audioFile && fs.existsSync(audioPath)) {
      const audioStat = fs.statSync(audioPath);
      if (audioStat.size > 10 * 1024 * 1024) return res.status(400).json({ error: 'Audio file too large (max 10MB).' });
      // Check audio duration using ffmpeg
      const getAudioDuration = () =>
        new Promise((resolve, reject) => {
          ffmpeg.ffprobe(audioPath, (err, metadata) => {
            if (err) return reject(err);
            resolve(metadata.format.duration);
          });
        });
      audioDuration = await getAudioDuration();
      if (audioDuration > maxAudioDuration) {
        return res.status(400).json({ error: `Audio duration exceeds ${maxAudioDuration} seconds.` });
      }
    } else {
      // No audio file, so duration is 0 and silent video logic will be used
      audioDuration = 0;
    }
    // Prepare output directory for video and images
    const timestamp = Date.now();
    const videoDir = path.join(__dirname, '../../public/finalvideo_2');
    fs.mkdirSync(videoDir, { recursive: true });
    const videoPath = path.join(videoDir, `${userId}_${timestamp}.mp4`);
    // If code_id is provided, check for previous video and delete it before generating new video
    if (req.body.code_id) {
      const previousAttachments = await uploadService.getAttachmentsByCodeId(req.body.code_id);
      if (previousAttachments.success && previousAttachments.data && previousAttachments.data.length > 0) {
        for (const attachment of previousAttachments.data) {
          if (attachment.uploded_video_path) {
            const prevVideoPath = path.join(__dirname, '../../public', attachment.uploded_video_path);
            if (fs.existsSync(prevVideoPath)) {
              try {
                fs.unlinkSync(prevVideoPath);
                console.log('Deleted previous video:', prevVideoPath);
              } catch (e) {
                console.error('Error deleting previous video file:', prevVideoPath, e.message);
              }
            }
          }
        }
        // Clear the video path in the DB for this code_id
        await uploadService.updateAttachmentByCodeId(req.body.code_id, { uploded_video_path: null });
      }
    }
    // Convert all images to PNG and rename to image001.png, image002.png, ... in videoDir
    const renamedImages = [];
    for (let i = 0; i < photoFiles.length; i++) {
      const src = path.join(uploadDir, photoFiles[i]);
      const dest = path.join(videoDir, `image${String(i + 1).padStart(3, '0')}.png`);
      try {
        execSync(`ffmpeg -y -i "${src}" "${dest}"`);
        renamedImages.push(dest);
      } catch (e) {
        console.error(`Failed to convert ${src} to PNG:`, e.message);
      }
    }
    // Debug: List all PNG images in the output directory
    const pngImages = fs.readdirSync(videoDir).filter(f => f.startsWith('image') && f.endsWith('.png'));
    // Check for missing images in the sequence
    let missing = false;
    for (let i = 1; i <= photoFiles.length; i++) {
      const expected = `image${String(i).padStart(3, '0')}.png`;
      if (!pngImages.includes(expected)) {
        console.warn(`Warning: Missing image in sequence: ${expected}`);
        missing = true;
      }
    }
    if (pngImages.length === 0) {
      return res.status(400).json({ error: 'No images found to process.' });
    }
    // Calculate framerate and duration per photo
    let durationPerPhoto, framerate;
    const hasAudio = fs.existsSync(audioPath);
    if (hasAudio) {
      durationPerPhoto = audioDuration / photoFiles.length;
      framerate = 1 / durationPerPhoto;
    } else {
      durationPerPhoto = 2;
      framerate = 0.5;
    }
    // Extract additional parameters from request body
    const { background_asset_id, overlay_asset_id, font_color_asset_id, font_type_asset_id, text, text_alignment } = req.body;
    // Fetch asset paths/values as in uploadVideo
    let text_align = '';
    if (text_alignment === 'right') {
      text_align = 'w-text_w-10';
    } else if (text_alignment === 'left') {
      text_align = '10';
    } else {
      text_align = '(w-text_w)/2';
    }
    const projectRoot = path.join(__dirname, '..', '..');
    const metas1 = await metaService.getMetaDetails(background_asset_id);
    if (!metas1.data || !metas1.data[0] || !metas1.data[0].meta_value) {
      console.error('Invalid background_asset_id or missing asset in DB:', background_asset_id, metas1);
      return res.status(400).json({ error: 'Invalid background_asset_id or missing asset in DB.' });
    }
    const fetched_background_asset_path = metas1.data[0].meta_value;
    const metas2 = await metaService.getMetaDetails(overlay_asset_id);
    if (!metas2.data || !metas2.data[0] || !metas2.data[0].meta_value) {
      console.error('Invalid overlay_asset_id or missing asset in DB:', overlay_asset_id, metas2);
      return res.status(400).json({ error: 'Invalid overlay_asset_id or missing asset in DB.' });
    }
    const fetched_overlay_asset_path = metas2.data[0].meta_value;
    const metas3 = await metaService.getMetaDetails(font_color_asset_id);
    if (!metas3.data || !metas3.data[0] || !metas3.data[0].meta_value) {
      console.error('Invalid font_color_asset_id or missing asset in DB:', font_color_asset_id, metas3);
      return res.status(400).json({ error: 'Invalid font_color_asset_id or missing asset in DB.' });
    }
    const fetched_font_color_asset_path = metas3.data[0].meta_value;
    const metas4 = await metaService.getMetaDetails(font_type_asset_id);
    if (!metas4.data || !metas4.data[0] || !metas4.data[0].remarks) {
      console.error('Invalid font_type_asset_id or missing asset in DB:', font_type_asset_id, metas4);
      return res.status(400).json({ error: 'Invalid font_type_asset_id or missing asset in DB.' });
    }
    const fetched_font_type_asset_path = metas4.data[0].remarks;
    
    const imagePathPrefix = path.join(videoDir, 'image'); // e.g., /finalvideo_2/image
    // Prepare all required paths and variables for the shell command
    const backgroundPath = path.join(projectRoot, `public${fetched_background_asset_path}`);
    const iconPath = path.join(projectRoot, `public/backend_overlay${fetched_overlay_asset_path}`);
    const fontPath = path.join(projectRoot, `public/fonts/${fetched_font_type_asset_path}`);
    const textfilePath = path.join(videoDir, `drawtext_${userId}_${timestamp}.txt`);
    fs.writeFileSync(textfilePath, text, 'utf8');
    const fetchedFontColor = fetched_font_color_asset_path;
    const videoDuration = audioDuration; // or set as needed
    const finalVideoPath = videoPath;
    // Remove existing output file if present
    if (fs.existsSync(finalVideoPath)) {
      fs.unlinkSync(finalVideoPath);
    }
    // Build the ffmpeg shell command
    let ffmpegCmd = `ffmpeg -y -framerate ${framerate} -i "${imagePathPrefix}%03d.png" -stream_loop -1 -i "${backgroundPath}" -stream_loop -1 -i "${iconPath}"`;
    if (hasAudio) ffmpegCmd += ` -i "${audioPath}"`;
    ffmpegCmd += ` -filter_complex "[0:v]setpts=PTS-STARTPTS,scale=w='if(lt(a,0.75),min(iw,720))':h='if(lt(a,0.75),min(ih,1280))':force_original_aspect_ratio=decrease[user_scaled];[1:v]setpts=PTS-STARTPTS[bg];[2:v]format=rgba,colorchannelmixer=aa=1,setpts=PTS-STARTPTS[icon];[bg][user_scaled]overlay=x=(W-w)/2:y=80[tmp1];[tmp1][icon]overlay=10:10[tmp2];[tmp2]drawtext=fontfile='${fontPath}':textfile='${textfilePath}':fontcolor='${fetchedFontColor}':fontsize=28:x='(w-text_w)/2':y=h*0.76:box=1:boxcolor=black@0.5:boxborderw=5:line_spacing=1[final]" -map "[final]"`;
    if (hasAudio) ffmpegCmd += ` -map 3:a`;
    ffmpegCmd += ` -t "${hasAudio ? videoDuration : photoFiles.length * 2}" -c:v libx264 -pix_fmt yuv420p`;
    if (hasAudio) {
      ffmpegCmd += ` -c:a aac -b:a 192k`;
    }
    ffmpegCmd += ` -shortest "${finalVideoPath}"`;
    // Run the command asynchronously and immediately return processing status
    console.log('Running ffmpeg command:', ffmpegCmd);
    exec(ffmpegCmd, async (error, stdout, stderr) => {
      if (error) {
        console.error('Error running ffmpeg command:', error.message);
      } else {
        // Clean up the images and text file after video creation
        fs.readdirSync(videoDir).forEach(f => {
          if (f.startsWith('image') && f.endsWith('.png')) fs.unlinkSync(path.join(videoDir, f));
          if (f.startsWith('drawtext_') && f.endsWith('.txt')) fs.unlinkSync(path.join(videoDir, f));
        });
        // Optionally delete the attachment folder if is_delete_attachment is true
        const is_delete_attachment = true;
        if (is_delete_attachment) {
          try {
            fs.rmSync(uploadDir, { recursive: true, force: true });
            console.log('Deleted attachment folder:', uploadDir);
          } catch (e) {
            console.error('Error deleting attachment folder:', uploadDir, e.message);
          }
        }
        // Store the video path in the database for the provided code_id
        if (req.body.code_id) {
          const relativePath = path.relative(path.join(__dirname, '../../public'), videoPath).replace(/\\/g, '/');
          await uploadService.updateAttachmentByCodeId(req.body.code_id, {
            uploded_video_path: relativePath
          });
        }
      }
    });
    // Immediately respond that processing has started
    return res.json({
      status: "processing",
      message: "Video is being processed. Please check status later"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process media and create video.' });
    }
};

module.exports = {
    uploadVideo,
    getAttachment,
    getAttachmentsByCodeId,
    uploadVideoChunk,
    checkVideoStatus,
    uploadMediaFileChunkless,
    processMediaToVideoFromPath,
    uploadMediaToVideoController
}; 