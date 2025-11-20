"use client";

import { useState, useEffect, useRef } from "react";
import {
  Upload,
  X,
  Bold,
  Italic,
  List,
  ListOrdered,
  Undo,
  Redo,
  Play,
  Pause,
} from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useRouter } from "next/navigation";

interface QuestionFormProps {
  formData: {
    exam_category: string;
    type: string;
    question: string;
    options: string[];
    correct_answer: number;
    audio: File | null;
    audio_url?: string;
    passage: string;
    difficulty: string;
    time_limit_seconds?: number; // Tambahkan ini
  };
  setFormData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
  isEditMode?: boolean; // Tambahkan ini
}

export default function QuestionForm({
  formData,
  setFormData,
  onSubmit,
  loading = false,
  isEditMode = false, // Tambahkan ini
}: QuestionFormProps) {
  const router = useRouter();
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const editor = useEditor({
    extensions: [StarterKit],
    content: formData.question,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setFormData({ ...formData, question: editor.getHTML() });
    },
  });

  // Update editor when formData.question changes externally
  useEffect(() => {
    if (editor && formData.question !== editor.getHTML()) {
      editor.commands.setContent(formData.question);
    }
  }, [formData.question, editor]);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setFormData({ ...formData, audio: file });

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setAudioPreview(previewUrl);
    }
  };

  const removeAudio = () => {
    setFormData({ ...formData, audio: null, audio_url: undefined });
    if (audioPreview) {
      URL.revokeObjectURL(audioPreview);
      setAudioPreview(null);
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  // Get audio URL for preview - Pindahkan ke sini sebelum useEffect
  const getAudioUrl = () => {
    if (formData.audio && audioPreview) {
      return audioPreview;
    }
    if (formData.audio_url) {
      return formData.audio_url;
    }
    return null;
  };

  const audioUrl = getAudioUrl();

  // Update progress bar in real-time
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration) {
        setDuration(audio.duration);
      }
    };

    const updateDuration = () => {
      setDuration(audio.duration);
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("loadeddata", updateDuration);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("loadeddata", updateDuration);
    };
  }, [audioUrl]);

  // Reset time when audio changes
  useEffect(() => {
    setCurrentTime(0);
    setIsPlaying(false);
  }, [audioUrl]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (audioPreview) {
        URL.revokeObjectURL(audioPreview);
      }
    };
  }, [audioPreview]);

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Exam Category */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Exam Category <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.exam_category}
          onChange={(e) =>
            setFormData({ ...formData, exam_category: e.target.value })
          }
          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-foreground"
          required
        >
          <option value="">Select Category</option>
          <option value="toefl">ETIC</option>
          <option value="ielts">TOAFL</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Question Type */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Question Type
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-foreground"
          >
            <option value="reading">Reading</option>
            <option value="listening">Listening</option>
            <option value="structure">Structure</option>
          </select>
        </div>

        {/* Difficulty Level */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Difficulty Level
          </label>
          <select
            value={formData.difficulty}
            onChange={(e) =>
              setFormData({ ...formData, difficulty: e.target.value })
            }
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-foreground"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Time Limit */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Time Limit{" "}
          <span className="text-foreground-tertiary font-normal">
            (Optional)
          </span>
        </label>
        <select
          value={formData.time_limit_seconds || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              time_limit_seconds: e.target.value
                ? parseInt(e.target.value)
                : undefined,
            })
          }
          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-foreground"
        >
          <option value="">No time limit</option>
          <option value="15">15 seconds</option>
          <option value="30">30 seconds</option>
          <option value="45">45 seconds</option>
          <option value="60">60 seconds (1 minute)</option>
          <option value="90">90 seconds (1.5 minutes)</option>
          <option value="120">120 seconds (2 minutes)</option>
          <option value="180">180 seconds (3 minutes)</option>
        </select>
        <p className="text-xs text-foreground-tertiary mt-2">
          Select time limit for this question
        </p>
      </div>

      {/* Passage (Optional - for Reading questions) */}
      {formData.type === "reading" && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Reading Passage{" "}
            <span className="text-foreground-tertiary font-normal">
              (Optional)
            </span>
          </label>
          <textarea
            value={formData.passage}
            onChange={(e) =>
              setFormData({ ...formData, passage: e.target.value })
            }
            placeholder="Enter the reading passage here (optional, leave empty if not needed)..."
            rows={6}
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-foreground placeholder:text-foreground-tertiary"
          />
          <p className="text-xs text-foreground-tertiary mt-2">
            Leave empty if the question doesn't require a passage
          </p>
        </div>
      )}

      {/* Question Text with Rich Text Editor */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Question Text <span className="text-red-500">*</span>
        </label>

        {/* Toolbar */}
        <div className="border border-border rounded-t-lg bg-surface p-2 flex gap-1 flex-wrap">
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-neutral-100 transition-colors ${
              editor?.isActive("bold") ? "bg-neutral-200" : ""
            }`}
            title="Bold"
          >
            <Bold size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-neutral-100 transition-colors ${
              editor?.isActive("italic") ? "bg-neutral-200" : ""
            }`}
            title="Italic"
          >
            <Italic size={18} />
          </button>
          <div className="w-px bg-border mx-1"></div>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-neutral-100 transition-colors ${
              editor?.isActive("bulletList") ? "bg-neutral-200" : ""
            }`}
            title="Bullet List"
          >
            <List size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-neutral-100 transition-colors ${
              editor?.isActive("orderedList") ? "bg-neutral-200" : ""
            }`}
            title="Numbered List"
          >
            <ListOrdered size={18} />
          </button>
          <div className="w-px bg-border mx-1"></div>
          <button
            type="button"
            onClick={() => editor?.chain().focus().undo().run()}
            className="p-2 rounded hover:bg-neutral-100 transition-colors"
            title="Undo"
          >
            <Undo size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().redo().run()}
            className="p-2 rounded hover:bg-neutral-100 transition-colors"
            title="Redo"
          >
            <Redo size={18} />
          </button>
        </div>

        {/* Editor Content */}
        <EditorContent
          editor={editor}
          className="border border-t-0 border-border rounded-b-lg px-4 py-3 min-h-[120px] prose prose-sm max-w-none focus-within:ring-2 focus-within:ring-primary bg-surface"
        />
        <style jsx global>{`
          .ProseMirror {
            outline: none;
            min-height: 120px;
          }
          .ProseMirror p {
            margin: 0.5em 0;
          }
          .ProseMirror p:first-child {
            margin-top: 0;
          }
          .ProseMirror p:last-child {
            margin-bottom: 0;
          }
          .ProseMirror ul,
          .ProseMirror ol {
            padding-left: 1.5em;
            margin: 0.5em 0;
          }
          .ProseMirror strong {
            font-weight: 600;
          }
          .ProseMirror em {
            font-style: italic;
          }
        `}</style>
      </div>

      {/* Audio Upload (for Listening) */}
      {formData.type === "listening" && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Audio File
          </label>
          {formData.audio || formData.audio_url ? (
            <div className="space-y-3">
              <div className="border border-border rounded-lg p-4 bg-surface">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Upload size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {formData.audio
                          ? formData.audio.name
                          : "Audio uploaded"}
                      </p>
                      <p className="text-xs text-foreground-tertiary">
                        {formData.audio
                          ? `${(formData.audio.size / 1024 / 1024).toFixed(
                              2
                            )} MB`
                          : "Existing audio"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeAudio}
                    className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                  >
                    <X size={20} className="text-foreground-tertiary" />
                  </button>
                </div>

                {/* Audio Player */}
                {audioUrl && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <audio
                      ref={audioRef}
                      src={audioUrl}
                      onEnded={handleAudioEnded}
                      className="hidden"
                    />
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={togglePlayPause}
                        className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors"
                      >
                        {isPlaying ? (
                          <Pause size={18} fill="currentColor" />
                        ) : (
                          <Play size={18} fill="currentColor" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{
                              width: audioRef.current
                                ? `${
                                    (audioRef.current.currentTime /
                                      audioRef.current.duration) *
                                    100
                                  }%`
                                : "0%",
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-foreground-tertiary">
                            {audioRef.current
                              ? `${Math.floor(audioRef.current.currentTime)}s`
                              : "0s"}
                          </span>
                          <span className="text-xs text-foreground-tertiary">
                            {audioRef.current && audioRef.current.duration
                              ? `${Math.floor(audioRef.current.duration)}s`
                              : "--"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
              <input
                type="file"
                accept="audio/*"
                onChange={handleAudioUpload}
                className="hidden"
                id="audio-upload"
              />
              <label htmlFor="audio-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                  <Upload size={32} className="text-foreground-tertiary" />
                  <p className="text-sm font-medium text-foreground">
                    Click to upload audio or drag and drop
                  </p>
                  <p className="text-xs text-foreground-tertiary">
                    MP3, WAV, OGG up to 50MB
                  </p>
                </div>
              </label>
            </div>
          )}
        </div>
      )}

      {/* Multiple Choice Options */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Answer Options <span className="text-red-500">*</span>
        </label>
        <div className="space-y-3">
          {formData.options.map((option, index) => (
            <div key={index} className="flex items-center gap-3">
              <input
                type="radio"
                name="correctAnswer"
                checked={formData.correct_answer === index}
                onChange={() =>
                  setFormData({ ...formData, correct_answer: index })
                }
                className="w-4 h-4 cursor-pointer accent-primary"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${String.fromCharCode(65 + index)}`}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-foreground placeholder:text-foreground-tertiary"
                  required
                />
              </div>
              <span className="text-sm font-medium text-foreground-tertiary min-w-fit">
                {String.fromCharCode(65 + index)}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-foreground-tertiary mt-3">
          Select the correct answer by clicking the radio button
        </p>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? isEditMode
              ? "Updating Question..."
              : "Adding Question..."
            : isEditMode
            ? "Update Question"
            : "Add Question"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="px-6 py-3 border border-border text-foreground font-medium rounded-lg hover:bg-neutral-100 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
