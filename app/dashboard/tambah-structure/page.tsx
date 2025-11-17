'use client';

import { useState } from 'react';

export default function StructureQuestionForm() {
  const [formData, setFormData] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    difficulty: "easy",
  });

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Structure Question Submitted:", formData);
    alert("Structure question added!");
  };

  const resetForm = () => {
    setFormData({
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      difficulty: "easy",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Structure Question */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-3">
          Structure Question <span className="text-red-500">*</span>
        </label>

        <textarea
          value={formData.question}
          onChange={(e) =>
            setFormData({ ...formData, question: e.target.value })
          }
          placeholder="Example: 'The teacher _____ the assignment yesterday.'"
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-blue-500
                     bg-white placeholder:text-gray-400"
        />

        <p className="text-xs text-gray-500 mt-1">
          Contoh: “The committee ______ the proposal last week.”
        </p>
      </div>

      {/* Difficulty Level */}
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

      {/* Answer Options */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-3">
          Answer Options <span className="text-red-500">*</span>
        </label>

        <div className="space-y-3">
          {formData.options.map((option, index) => (
            <div key={index} className="flex items-center gap-3">

              {/* Correct Answer Selector */}
              <input
                type="radio"
                checked={formData.correctAnswer === index}
                onChange={() =>
                  setFormData({ ...formData, correctAnswer: index })
                }
                className="w-5 h-5 cursor-pointer accent-blue-600"
              />

              {/* Option Text */}
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${String.fromCharCode(65 + index)}`}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-blue-500
                           bg-white"
              />

              <span className="text-sm font-semibold text-gray-700 w-6">
                {String.fromCharCode(65 + index)}
              </span>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-500 mt-3">
          Pilih jawaban yang paling tepat secara struktur/grammar.
        </p>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          type="submit"
          className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium
                     rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Structure Question
        </button>

        <button
          type="button"
          onClick={resetForm}
          className="px-6 py-3 border border-gray-300 text-gray-700 font-medium
                     rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>

    </form>
  );
}
