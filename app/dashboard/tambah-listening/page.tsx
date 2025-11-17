'use client';

import { useState } from 'react';
import { Upload, Volume2, X } from 'lucide-react';

export default function ListeningQuestionForm() {
  const [formData, setFormData] = useState({
    question: "",
    audio: null as File | null,
    options: ["", "", "", ""],
    correctAnswer: 0,
    difficulty: "easy",
  });

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFormData({ ...formData, audio: e.target.files[0] });
    }
  };

  const removeAudio = () => {
    setFormData({ ...formData, audio: null });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitted:", formData);
    alert("Listening Question submitted!");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Audio Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-3">
          Audio File <span className="text-red-500">*</span>
        </label>

        {!formData.audio ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer bg-gray-50">
            <input
              type="file"
              accept="audio/*"
              onChange={handleAudioUpload}
              className="hidden"
              id="audio-upload"
            />
            <label htmlFor="audio-upload" className="cursor-pointer">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Upload size={32} className="text-blue-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">
                  Click to upload audio or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">MP3, WAV, OGG up to 50MB</p>
              </div>
            </label>
          </div>
        ) : (
          <div className="border border-gray-300 rounded-lg p-4 bg-blue-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Volume2 size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {formData.audio.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(formData.audio.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={removeAudio}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Question Text */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-3">
          Question Text <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.question}
          onChange={(e) =>
            setFormData({ ...formData, question: e.target.value })
          }
          placeholder="Enter the listening comprehension question here..."
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder:text-gray-400"
        />
      </div>

      {/* Difficulty */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-3">
          Difficulty Level <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 gap-3">
          {["easy", "medium", "hard"].map((level) => (
            <button
              key={level}
              type="button"
              onClick={() =>
                setFormData({ ...formData, difficulty: level })
              }
              className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                formData.difficulty === level
                  ? level === "easy"
                    ? "bg-green-600 text-white"
                    : level === "medium"
                    ? "bg-yellow-600 text-white"
                    : "bg-red-600 text-white"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Options */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-3">
          Answer Options <span className="text-red-500">*</span>
        </label>
        <div className="space-y-3">
          {formData.options.map((option, index) => (
            <div key={index} className="flex items-center gap-3">
              <input
                type="radio"
                checked={formData.correctAnswer === index}
                onChange={() =>
                  setFormData({ ...formData, correctAnswer: index })
                }
                className="w-5 h-5 cursor-pointer accent-blue-600"
              />
              <input
                type="text"
                value={option}
                onChange={(e) =>
                  handleOptionChange(index, e.target.value)
                }
                placeholder={`Option ${String.fromCharCode(65 + index)}`}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
              <span className="text-sm font-semibold text-gray-700 w-6">
                {String.fromCharCode(65 + index)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          type="submit"
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
        >
          Add Listening Question
        </button>
        <button
          type="reset"
          onClick={() =>
            setFormData({
              question: "",
              audio: null,
              options: ["", "", "", ""],
              correctAnswer: 0,
              difficulty: "easy",
            })
          }
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
