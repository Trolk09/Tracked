import { FormEvent, useState } from "react";
import { useStore, getChapterName, getSubjectName } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { FileWarning, Trash2 } from "lucide-react";

export default function Mistakes() {
  const { state, addMistake, updateMistake, deleteMistake } = useStore();
  const [chapterId, setChapterId] = useState("");
  const [question, setQuestion] = useState("");
  const [correction, setCorrection] = useState("");
  const [reason, setReason] = useState("");
  const [filterChapter, setFilterChapter] = useState("");
  const mistakes = state.mistakes.filter((mistake) => !filterChapter || mistake.chapterId === filterChapter);

  function submit(event: FormEvent) {
    event.preventDefault();
    addMistake({ chapterId, question, correction, reason, date: new Date().toISOString().slice(0, 10) });
    setQuestion("");
    setCorrection("");
    setReason("");
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Digital mistake journal</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Turn wrong questions into revision fuel</h1>
        <p className="mt-2 text-muted-foreground">Every chapter can store wrong questions, corrections, reasons, dates, and resolved status.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <Card className="bg-white/95">
          <CardHeader><CardTitle>Add wrong question</CardTitle></CardHeader>
          <CardContent>
            {state.chapters.length === 0 ? <div className="rounded-3xl border border-dashed p-8 text-center text-muted-foreground">Add chapters first, then attach mistakes to them.</div> : (
              <form onSubmit={submit} className="space-y-3">
                <select className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={chapterId} onChange={(event) => setChapterId(event.target.value)} required>
                  <option value="">Choose chapter</option>
                  {state.chapters.map((chapter) => <option key={chapter.id} value={chapter.id}>{chapter.name} — {getSubjectName(state, chapter.subjectId)}</option>)}
                </select>
                <Textarea value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Question you got wrong" required />
                <Textarea value={correction} onChange={(event) => setCorrection(event.target.value)} placeholder="Correct answer / method" />
                <Input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Why it went wrong" />
                <Button className="w-full">Save mistake</Button>
              </form>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/95">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Mistake log</CardTitle>
            <select className="rounded-md border bg-background px-3 py-2 text-sm" value={filterChapter} onChange={(event) => setFilterChapter(event.target.value)}>
              <option value="">All chapters</option>
              {state.chapters.map((chapter) => <option key={chapter.id} value={chapter.id}>{chapter.name}</option>)}
            </select>
          </CardHeader>
          <CardContent className="space-y-4">
            {mistakes.length === 0 ? <div className="rounded-3xl border border-dashed p-10 text-center text-muted-foreground"><FileWarning className="mx-auto mb-4 h-10 w-10 text-primary" />No mistakes recorded yet.</div> : null}
            {mistakes.map((mistake) => (
              <div key={mistake.id} className={`rounded-3xl border p-5 ${mistake.status === "resolved" ? "bg-purple-50" : "bg-white"}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">{getChapterName(state, mistake.chapterId)} · {mistake.date}</p>
                    <h3 className="mt-2 font-bold">{mistake.question}</h3>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteMistake(mistake.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl bg-emerald-50 p-3 text-sm"><b>Correction:</b><br />{mistake.correction || "Not added"}</div>
                  <div className="rounded-2xl bg-orange-50 p-3 text-sm"><b>Reason:</b><br />{mistake.reason || "Not added"}</div>
                </div>
                <label className="mt-4 flex items-center gap-2 text-sm"><Checkbox checked={mistake.status === "resolved"} onCheckedChange={(checked) => updateMistake(mistake.id, { status: checked ? "resolved" : "open" })} />Resolved after review</label>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
