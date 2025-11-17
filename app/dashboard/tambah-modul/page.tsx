'use client';

import { useState } from "react";
import { Upload, FileText, X } from "lucide-react";

export default function ModuleAddForm() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("reading");
  const [uploadDate] = useState(new Date().toISOString().split("T")[0]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];

      if (file.type !== "application/pdf") {
        alert("Only PDF files are allowed!");
        return;
      }

      setPdfFile(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Module title cannot be empty!");
      return;
    }

    const newModule = {
      title,
      category,
      uploadDate,
      pdfFile,
    };

    console.log("Saved Module:", newModule);
    alert("Module saved!");

    setTitle("");
    setCategory("reading");
    setPdfFile(null);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto mt-6 p-6 bg-white border rounded-xl shadow-sm space-y-6"
    >
      <h2 className="text-xl font-semibold text-gray-900">Add New Module</h2>

      {/* Module Title */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Module Title <span className="text-red-500">*</span>
        </label>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter module title..."
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Category <span className="text-red-500">*</span>
        </label>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="reading">Reading</option>
          <option value="listening">Listening</option>
          <option value="structure">Structure</option>
          <option value="grammar">Grammar</option>
          <option value="writing">Writing</option>
          <option value="vocabulary">Vocabulary</option>
        </select>
      </div>

      {/* Upload PDF */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-3">
          Upload PDF Material
        </label>

        {!pdfFile ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer bg-gray-50">
            <input
              type="file"
              accept="application/pdf"
              onChange={handlePdfUpload}
              className="hidden"
              id="pdf-upload"
            />

            <label htmlFor="pdf-upload" className="cursor-pointer">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Upload size={32} className="text-blue-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">
                  Click to upload PDF or drag & drop
                </p>
                <p className="text-xs text-gray-500">PDF up to 20MB</p>
              </div>
            </label>
          </div>
        ) : (
          <div className="border border-gray-300 rounded-lg p-4 bg-blue-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <FileText size={20} className="text-white" />
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-900">{pdfFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPdfFile(null)}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Upload Date */}
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
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
        >
          Save Module
        </button>

        <button
          type="button"
          onClick={() => {
            setTitle("");
            setCategory("reading");
            setPdfFile(null);
          }}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
