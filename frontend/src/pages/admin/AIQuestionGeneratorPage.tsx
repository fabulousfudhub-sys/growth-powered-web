import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sparkles,
  Upload,
  FileText,
  Save,
  Loader2,
  Trash2,
  CheckCircle2,
  Edit2,
  Plus,
} from "lucide-react";
import { api } from "@/lib/api";
import type { Course } from "@/lib/types";
import { toast } from "sonner";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

interface GeneratedQuestion {
  id: string;
  type: string;
  text: string;
  options?: string[];
  correctAnswer: string;
  difficulty: string;
  selected: boolean;
  editing: boolean;
}

const QUESTION_TYPES = [
  { value: "mcq", label: "Multiple Choice" },
  { value: "true_false", label: "True/False" },
  { value: "fill_blank", label: "Fill in the Blank" },
  { value: "short_answer", label: "Short Answer" },
  { value: "essay", label: "Essay" },
];

export default function AIQuestionGeneratorPage() {
  const [content, setContent] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [courseId, setCourseId] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["mcq"]);
  const [difficulty, setDifficulty] = useState("mixed");
  const [count, setCount] = useState(10);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);

  useEffect(() => {
    api
      .getCourses()
      .then(setCourses)
      .catch(() => {});
  }, []);

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const toggleAllQuestions = (value: boolean) => {
    setQuestions((prev) => prev.map((q) => ({ ...q, selected: value })));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      const text = await file.text();
      setContent(text);
      setImageDataUrl(null);
      return;
    }

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageDataUrl(String(reader.result || ""));
        toast.info(
          "Image uploaded. AI will use this image for question generation.",
        );
      };
      reader.readAsDataURL(file);
      return;
    }

    toast.error("Only .txt and image files are allowed.");
    e.target.value = "";
  };

  const handleGenerate = async () => {
    if (!content.trim() && !imageDataUrl) {
      toast.error("Please provide pasted text or upload an image/txt file");
      return;
    }
    if (selectedTypes.length === 0) {
      toast.error("Select at least one question type");
      return;
    }

    setGenerating(true);
    setQuestions([]);

    try {
      const courseCode = courses.find((c) => c.id === courseId)?.code || "";

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/generate-questions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
          body: JSON.stringify({
            content: content.substring(0, 15000),
            imageDataUrl,
            questionTypes: selectedTypes,
            difficulty,
            count,
            courseCode,
          }),
        },
      );

      if (!response.ok) {
        const err = await response
          .json()
          .catch(() => ({ error: "Generation failed" }));
        throw new Error(err.error || `Error ${response.status}`);
      }

      const data = await response.json();

      if (data.questions && Array.isArray(data.questions)) {
        const filtered = data.questions.filter((q: any) =>
          selectedTypes.includes(q.type),
        );
        if (filtered.length !== data.questions.length) {
          toast.warning("Filtered out questions with unselected types.");
        }
        setQuestions(
          filtered.map((q: any) => ({
            ...q,
            id: crypto.randomUUID(),
            selected: true,
            editing: false,
          })),
        );
        toast.success(`Generated ${filtered.length} questions!`);
      } else {
        throw new Error("No questions returned");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to generate questions");
    } finally {
      setGenerating(false);
    }
  };

  const toggleQuestion = (id: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, selected: !q.selected } : q)),
    );
  };

  const removeQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const updateQuestion = (id: string, updates: Partial<GeneratedQuestion>) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...updates } : q)),
    );
  };

  const handleSaveSelected = async () => {
    if (!courseId) {
      toast.error("Please select a course first");
      return;
    }

    const selected = questions.filter((q) => q.selected);
    if (selected.length === 0) {
      toast.error("No questions selected");
      return;
    }

    setSaving(true);
    const results = await Promise.allSettled(
      selected.map((q) =>
        api.createQuestion({
          type: q.type,
          text: q.text,
          options: q.type === "mcq" ? q.options : undefined,
          correctAnswer: q.correctAnswer,
          difficulty: q.difficulty,
          courseId,
        }),
      ),
    );

    const saved = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;
    setSaving(false);

    if (saved > 0) toast.success(`Saved ${saved} questions to the bank!`);
    if (failed > 0) toast.error(`${failed} questions failed to save`);

    // Remove saved questions
    if (saved > 0) {
      setQuestions((prev) => prev.filter((q) => !q.selected));
    }
  };

  const selectedCount = questions.filter((q) => q.selected).length;

  const allSelected =
    questions.length > 0 && selectedCount === questions.length;

  return (
    <div className="space-y-6 animate-slide-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-accent" /> AI Question Generator
        </h1>
        <p className="text-sm text-muted-foreground">
          Upload course content and let AI generate exam questions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        {/* Input Panel */}
        <div className="space-y-4 min-h-0 flex flex-col">
          <Card className="border-border/40 flex flex-col h-full min-h-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Course Content</CardTitle>
              <CardDescription className="text-xs">
                Upload a document or paste content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Upload */}
              <div className="space-y-2">
                <label className="cursor-pointer">
                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/50 transition-all">
                    <Upload className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Upload Document</p>
                      <p className="text-xs text-muted-foreground">
                        TXT or Image only
                      </p>
                    </div>
                    {fileName && (
                      <Badge variant="secondary" className="ml-auto gap-1">
                        <FileText className="w-3 h-3" /> {fileName}
                      </Badge>
                    )}
                  </div>
                  <input
                    type="file"
                    accept=".txt,image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>

              {/* Text Content */}
              <div className="space-y-2">
                <Label>Paste content directly</Label>
                <Textarea
                  rows={8}
                  placeholder="Paste your course notes, textbook content, or learning materials here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="text-sm"
                />
                {imageDataUrl && (
                  <p className="text-xs text-accent">
                    Image source attached for AI analysis.
                  </p>
                )}
                <p className="text-xs text-muted-foreground text-right">
                  {content.length.toLocaleString()} characters
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40 flex flex-col h-full min-h-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Generation Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Course</Label>
                <Select value={courseId} onValueChange={setCourseId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.code} - {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Question Types</Label>
                <div className="flex flex-wrap gap-2">
                  {QUESTION_TYPES.map((t) => (
                    <label
                      key={t.value}
                      className="flex items-center gap-1.5 cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedTypes.includes(t.value)}
                        onCheckedChange={() => toggleType(t.value)}
                      />
                      <span className="text-sm">{t.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mixed">Mixed</SelectItem>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Number of Questions</Label>
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    value={count}
                    onChange={(e) => setCount(parseInt(e.target.value) || 10)}
                  />
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={generating || (!content.trim() && !imageDataUrl)}
                className="w-full gap-2"
                size="lg"
              >
                {generating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {generating ? "Generating..." : "Generate Questions"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Output Panel */}
        <div className="space-y-4 min-h-0 flex flex-col">
          <Card className="border-border/40 flex flex-col h-full min-h-0">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">
                    Generated Questions
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {questions.length > 0
                      ? `${selectedCount} of ${questions.length} selected`
                      : "Questions will appear here"}
                  </CardDescription>
                </div>
                {questions.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAllQuestions(!allSelected)}
                      disabled={saving}
                    >
                      {allSelected ? "Deselect All" : "Select All"}
                    </Button>

                    <Button
                      onClick={handleSaveSelected}
                      disabled={saving || selectedCount === 0 || !courseId}
                      className="gap-2"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Save {selectedCount > 0 ? `(${selectedCount})` : ""}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="h-[70vh] flex flex-col min-h-0">
              {generating && (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-accent" />
                  <p className="text-sm text-muted-foreground">
                    AI is generating questions...
                  </p>
                  <p className="text-xs text-muted-foreground">
                    This may take 15-30 seconds
                  </p>
                </div>
              )}

              {!generating && questions.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
                  <Sparkles className="w-8 h-8" />
                  <p className="text-sm">Upload content and click Generate</p>
                </div>
              )}

              <ScrollArea className="flex-1 min-h-0 overflow-y-auto">
                <div className="space-y-3 pr-3">
                  {questions.map((q, idx) => (
                    <Card
                      key={q.id}
                      className={`border transition-all ${q.selected ? "border-primary/40 bg-primary/5" : "border-border/30 opacity-60"}`}
                    >
                      <CardContent className="pt-3 pb-3 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            <Checkbox
                              checked={q.selected}
                              onCheckedChange={() => toggleQuestion(q.id)}
                              className="mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-mono text-muted-foreground">
                                  Q{idx + 1}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="text-[10px]"
                                >
                                  {q.type}
                                </Badge>
                                <Badge
                                  variant="secondary"
                                  className="text-[10px]"
                                >
                                  {q.difficulty}
                                </Badge>
                              </div>

                              {q.editing ? (
                                <Textarea
                                  value={q.text}
                                  onChange={(e) =>
                                    updateQuestion(q.id, {
                                      text: e.target.value,
                                    })
                                  }
                                  rows={2}
                                  className="text-sm"
                                />
                              ) : (
                                <p className="text-sm">{q.text}</p>
                              )}

                              {q.options && q.options.length > 0 && (
                                <div className="mt-1.5 space-y-0.5">
                                  {q.options.map((opt, i) => (
                                    <p
                                      key={i}
                                      className={`text-xs px-2 py-0.5 rounded ${opt === q.correctAnswer ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium" : "text-muted-foreground"}`}
                                    >
                                      {String.fromCharCode(65 + i)}. {opt}
                                    </p>
                                  ))}
                                </div>
                              )}

                              {!q.options && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  <span className="font-medium">Answer:</span>{" "}
                                  {q.correctAnswer}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                updateQuestion(q.id, { editing: !q.editing })
                              }
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive"
                              onClick={() => removeQuestion(q.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
