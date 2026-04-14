import { FormEvent, useMemo, useState } from "react";
import { useStore, getChapterName, getSubjectName } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BookCopy, Eye, EyeOff, Trash2 } from "lucide-react";

export default function Flashcards() {
  const { state, addFlashcard, updateFlashcard, deleteFlashcard } = useStore();
  const [chapterId, setChapterId] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [activeChapter, setActiveChapter] = useState("");
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const selectedChapter = activeChapter || chapterId || state.chapters[0]?.id || "";
  const cards = useMemo(() => state.flashcards.filter((card) => !selectedChapter || card.chapterId === selectedChapter), [state.flashcards, selectedChapter]);

  function submit(event: FormEvent) {
    event.preventDefault();
    addFlashcard({ chapterId, question, answer });
    setQuestion("");
    setAnswer("");
    if (!activeChapter) setActiveChapter(chapterId);
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Chapter flashcards</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Make and review cards</h1>
        <p className="mt-2 text-muted-foreground">Each chapter can have its own flashcards with question, answer, reveal, and mastered status.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <Card className="bg-white/95">
          <CardHeader><CardTitle>Create flashcard</CardTitle></CardHeader>
          <CardContent>
            {state.chapters.length === 0 ? <div className="rounded-3xl border border-dashed p-8 text-center text-muted-foreground">Add a subject and chapter before making flashcards.</div> : (
              <form onSubmit={submit} className="space-y-3">
                <select className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={chapterId} onChange={(event) => setChapterId(event.target.value)} required>
                  <option value="">Choose chapter</option>
                  {state.chapters.map((chapter) => <option key={chapter.id} value={chapter.id}>{chapter.name} — {getSubjectName(state, chapter.subjectId)}</option>)}
                </select>
                <Textarea value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Question" required />
                <Textarea value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Answer" required />
                <Button className="w-full">Add flashcard</Button>
              </form>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/95">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Review deck</CardTitle>
            <select className="rounded-md border bg-background px-3 py-2 text-sm" value={selectedChapter} onChange={(event) => setActiveChapter(event.target.value)}>
              <option value="">All chapters</option>
              {state.chapters.map((chapter) => <option key={chapter.id} value={chapter.id}>{chapter.name}</option>)}
            </select>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {cards.length === 0 ? <div className="md:col-span-2 rounded-3xl border border-dashed p-10 text-center text-muted-foreground"><BookCopy className="mx-auto mb-4 h-10 w-10 text-primary" />No flashcards in this deck yet.</div> : null}
            {cards.map((card) => (
              <div key={card.id} className="rounded-3xl border bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">{getChapterName(state, card.chapterId)}</p>
                    <h3 className="mt-2 font-bold">{card.question}</h3>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteFlashcard(card.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
                <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm">
                  {revealed[card.id] ? card.answer : "Answer hidden. Reveal when you are ready."}
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => setRevealed((current) => ({ ...current, [card.id]: !current[card.id] }))}>{revealed[card.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}Reveal</Button>
                  <label className="flex items-center gap-2 text-sm"><Checkbox checked={card.mastered} onCheckedChange={(checked) => updateFlashcard(card.id, { mastered: Boolean(checked) })} />Mastered</label>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
