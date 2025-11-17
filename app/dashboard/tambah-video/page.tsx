'use client';

import { useState } from "react";
import { Upload, Video, X } from "lucide-react";

export default function VideoUploadForm() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [uploadDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setVideoFile(e.target.files[0]);
    }
  };

  const removeVideo = () => {
    setVideoFile(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!videoFile || !title.trim() || !duration.trim()) {
      alert("All fields are required!");
      return;
    }

    const newVideoData = {
      videoFile,
      title,
      duration,
      uploadDate,
    };

    console.log("Video saved:", newVideoData);
    alert("Video added!");

    setVideoFile(null);
    setTitle("");
    setDuration("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto space-y-6 p-6 border rounded-xl shadow-sm bg-white"
    >
      {/* Video Preview / Upload Box */}
      <div className="w-full bg-gray-100 border rounded-lg h-48 flex flex-col items-center justify-center text-gray-500">
        {!videoFile ? (
          <label
            htmlFor="video-upload"
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            <Video size={40} className="text-gray-400" />
            <p className="text-sm font-medium">Click to upload video</p>
            <p className="text-xs text-gray-400">MP4, MOV, AVI up to 200MB</p>

            <input
              type="file"
              id="video-upload"
              accept="video/*"
              className="hidden"
              onChange={handleUpload}
            />
          </label>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Video size={40} className="text-blue-500" />
            <p className="text-sm font-medium">{videoFile.name}</p>
            <p className="text-xs text-gray-500">
              {(videoFile.size / 1024 / 1024).toFixed(2)} MB
            </p>

            <button
              type="button"
              onClick={removeVideo}
              className="text-red-600 text-sm flex items-center gap-1 hover:underline"
            >
              <X size={16} /> Remove
            </button>
          </div>
        )}
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Video Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter video title..."
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Duration */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Duration <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="Example: 12:45"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Upload Date (Automatic) */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          Upload Date
        </label>
        <p className="text-gray-700 text-sm">{uploadDate}</p>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white font-medium px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Save Video
        </button>

        <button
          type="button"
          onClick={() => {
            setVideoFile(null);
            setTitle("");
            setDuration("");
          }}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
