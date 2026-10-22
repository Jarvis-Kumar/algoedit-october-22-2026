

import React, { useState, useCallback, useEffect } from 'react';

interface ImageUploadProps {
  onFileSelect: (file: File | null) => void;
  title: string;
  file?: File | null;
  children?: React.ReactNode;
  compact?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onFileSelect, title, file = null, children, compact = false }) => {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  }, [file]);


  const handleFileChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      const selectedFile = files[0];
      if (selectedFile.type.startsWith('image/')) {
        onFileSelect(selectedFile);
      } else {
        alert('Please select an image file.');
      }
    }
  };
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileChange(e.dataTransfer.files);
  }, []);


  const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      onFileSelect(null);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1.5">
        <label className={`block font-bold text-slate-400 uppercase tracking-widest ${compact ? 'text-[10px]' : 'text-sm'}`}>{title}</label>
        {children}
      </div>
      {preview ? (
        <div className="relative group rounded-xl overflow-hidden shadow-lg border border-white/10 bg-black/40">
          <img src={preview} alt="Preview" className={`w-full object-contain ${compact ? 'max-h-24' : 'max-h-96'}`} />
          <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex space-x-3">
                <label className="px-3 py-1.5 bg-gradient-to-r from-white via-[#E8F0F4] to-[#AFC3CF] hover:brightness-110 text-[#050709] rounded-lg text-xs font-bold cursor-pointer transition-all shadow-sm">
                    Change
                    <input
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e.target.files)}
                    />
                </label>
                <button
                    onClick={handleClear}
                    className="px-3 py-1.5 bg-[#10161B] border border-red-500/30 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                    Remove
                </button>
            </div>
          </div>
        </div>
      ) : (
        <label
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`flex items-center justify-center w-full border-2 border-[#26313A] border-dashed rounded-xl cursor-pointer hover:border-[#8DB8CC] hover:bg-white/[0.02] transition-all ${compact ? 'h-14 px-4' : 'h-64 px-6 pt-5 pb-6'}`}
        >
          {compact ? (
            <div className="flex items-center gap-2 text-slate-400 hover:text-slate-200">
              <svg
                className="h-5 w-5 text-slate-500"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Drag or Click to upload Reference</span>
            </div>
          ) : (
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-500"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-gray-400">
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          )}
          <input
            id="file-upload"
            name="file-upload"
            type="file"
            className="sr-only"
            accept="image/*"
            onChange={(e) => handleFileChange(e.target.files)}
          />
        </label>
      )}
    </div>
  );
};

export default ImageUpload;