

export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // remove the "data:image/jpeg;base64," part
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = (error) => reject(error);
    });
};

export const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};

export const getVideoMetadata = (videoFile: File): Promise<{ duration: number; width: number; height: number }> => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
            window.URL.revokeObjectURL(video.src);
            resolve({
                duration: video.duration,
                width: video.videoWidth,
                height: video.videoHeight,
            });
        };
        video.onerror = (e) => {
            reject(new Error("Failed to load video metadata. The file might be corrupted or in an unsupported format."));
        };
        video.src = URL.createObjectURL(videoFile);
    });
};


export const extractFramesFromVideo = (videoFile: File, frameCount: number): Promise<string[]> => {
    return new Promise(async (resolve, reject) => {
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const videoUrl = URL.createObjectURL(videoFile);
        
        if (!context) return reject(new Error('Could not get canvas context'));

        video.muted = true;
        video.playsInline = true;

        video.onloadeddata = async () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const duration = video.duration;
            const interval = duration > 0 && frameCount > 0 ? duration / (frameCount + 1) : 0;
            const frames: string[] = [];
            
            video.pause();

            const captureFrame = (time: number): Promise<string> => {
                return new Promise((resolveCapture, rejectCapture) => {
                    video.onseeked = () => {
                        try {
                            context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                            const dataUrl = canvas.toDataURL('image/jpeg');
                            resolveCapture(dataUrl.split(',')[1]);
                        } catch (e) {
                            rejectCapture(e);
                        }
                    };
                    video.onerror = rejectCapture;
                    video.currentTime = time;
                });
            };
            
            if(interval === 0) { // For very short videos
                 const frame = await captureFrame(0.1);
                 frames.push(frame);
            } else {
                for (let i = 1; i <= frameCount; i++) {
                    try {
                        const time = interval * i;
                        if (time > duration) continue;
                        const frame = await captureFrame(time);
                        frames.push(frame);
                    } catch (e) {
                        console.error("Error capturing frame", e);
                        // Continue to next frame
                    }
                }
            }
            
            URL.revokeObjectURL(videoUrl);
            resolve(frames);
        };

        video.onerror = () => {
            URL.revokeObjectURL(videoUrl);
            reject(new Error("Failed to load video for frame extraction. The format may be unsupported."));
        };

        video.src = videoUrl;
    });
};