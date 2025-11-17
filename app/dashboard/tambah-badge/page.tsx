'use client';

import { useState } from "react";
import { Upload, Image as ImageIcon, X } from "lucide-react";

export default function BadgeAddForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];

      if (!file.type.startsWith("image/")) {
        alert("Only image files are allowed!");
        return;
      }

      setIconFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Badge name cannot be empty!");
      return;
    }

    const badgeData = {
      title,
      description,
      iconFile,
    };

    console.log("Saved Badge:", badgeData);
    alert("Badge added!");

    setTitle("");
    setDescription("");
    setIconFile(null);
    setPreviewUrl(null);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto mt-6 p-6 bg-white border rounded-xl shadow-sm space-y-6"
    >
      <h2 className="text-xl font-semibold text-gray-900">Add New Badge</h2>

      {/* Badge Icon Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-3">
          Badge Icon <span className="text-red-500">*</span>
        </label>

        {!previewUrl ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition cursor-pointer bg-gray-50">
            <input
              type="file"
              accept="image/*"
              onChange={handleIconUpload}
              id="icon-upload"
              className="hidden"
            />

            <label htmlFor="icon-upload" className="cursor-pointer">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Upload size={32} className="text-blue-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">
                  Click to upload icon
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, SVG up to 5MB</p>
              </div>
            </label>
          </div>
        ) : (
          <div className="border border-gray-300 rounded-lg p-4 bg-blue-50 relative">
            <img
              src={previewUrl}
              alt="Badge Icon"
              className="w-20 h-20 object-contain mx-auto"
            />

            <button
              type="button"
              onClick={() => {
                setIconFile(null);
                setPreviewUrl(null);
              }}
              className="absolute top-2 right-2 p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Badge Title */}
      <div>
        <label className="text-sm font-medium text-gray-900 mb-2 block">
          Badge Title <span className="text-red-500">*</span>
        </label>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Quick Learner"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Badge Description */}
      <div>
        <label className="text-sm font-medium text-gray-900 mb-2 block">
          Description <span className="text-red-500">*</span>
        </label>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Complete 10 questions"
          rows={3}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          type="submit"
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
        >
          Save Badge
        </button>

        <button
          type="button"
          onClick={() => {
            setTitle("");
            setDescription("");
            setIconFile(null);
            setPreviewUrl(null);
          }}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
