import React, { useState, useCallback } from 'react';
import { fileToDataUrl } from '../utils/fileUtils';

interface VideoUploadProps {
  onFileSelect: (file: File | null) => void;
  title: string;
}

const VideoUpload: React.FC<VideoUploadProps> = ({ onFileSelect, title }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const handleFileChange = async (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('video/')) {
        onFileSelect(file);
        setFileName(file.name);
        try {
            const dataUrl = await fileToDataUrl(file);
            setPreview(dataUrl);
        } catch(e) {
            alert("Could not create video preview.");
            console.error(e);
        }
      } else {
        alert('Please select a video file.');
      }
    }
  };
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => { e.preventDefault(); e.stopPropagation(); }, []);
  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => { 
      e.preventDefault(); 
      e.stopPropagation(); 
      handleFileChange(e.dataTransfer.files);
    }, []);

  const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      setPreview(null);
      setFileName('');
      onFileSelect(null);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-300 mb-2">{title}</label>
      {preview ? (
        <div className="relative group">
          <video src={preview} controls loop className="w-full h-auto max-h-64 object-contain rounded-lg shadow-lg bg-black" />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
            <button
              onClick={handleClear}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
            >
              Remove Video
            </button>
          </div>
        </div>
      ) : (
        <label
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="flex justify-center w-full h-48 px-6 pt-5 pb-6 border-2 border-[#26313A] border-dashed rounded-2xl cursor-pointer hover:border-[#8DB8CC] bg-[#10161B]/40 transition-colors"
        >
          <div className="space-y-1 text-center">
            <svg className="mx-auto h-10 w-10 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            <div className="flex text-sm text-gray-400">
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">MP4, MOV, WEBM</p>
          </div>
          <input
            id={`video-upload-${title.replace(/\s/g, '')}`}
            name="video-upload"
            type="file"
            className="sr-only"
            accept="video/*"
            onChange={(e) => handleFileChange(e.target.files)}
          />
        </label>
      )}
    </div>
  );
};

export default VideoUpload;