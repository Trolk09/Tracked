import { FormEvent, useState } from "react";
import { useStore, getChapterName, getSubjectName, startOfWeek } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquareText, Star } from "lucide-react";

export default function Feedback() {
  const { state, addFeedback } = useStore();
  const [chapterId, setChapterId] = useState("");
  const [confidence, setConfidence] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [notes, setNotes] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    addFeedback({ weekStart: startOfWeek(), chapterId, confidence, notes });
    setNotes("");
    setConfidence(3);
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Weekly feedback</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Rate chapter confidence</h1>
        <p className="mt-2 text-muted-foreground">Weak ratings automatically add a weekend review goal. History stays visible for reflection.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <Card className="bg-white/95">
          <CardHeader><CardTitle>Submit feedback</CardTitle></CardHeader>
          <CardContent>
            {state.chapters.length === 0 ? <div className="rounded-3xl border border-dashed p-8 text-center text-muted-foreground">Add chapters first, then submit weekly feedback.</div> : (
              <form onSubmit={submit} className="space-y-4">
                <select className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={chapterId} onChange={(event) => setChapterId(event.target.value)} required>
                  <option value="">Choose chapter</option>
                  {state.chapters.map((chapter) => <option key={chapter.id} value={chapter.id}>{chapter.name} — {getSubjectName(state, chapter.subjectId)}</option>)}
                </select>
                <div>
                  <p className="mb-2 text-sm font-semibold">Confidence rating</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((value) => <Button key={value} type="button" variant={confidence === value ? "default" : "outline"} size="icon" onClick={() => setConfidence(value as 1 | 2 | 3 | 4 | 5)}><Star className="h-4 w-4" /></Button>)}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">1-2 = weak, 3 = improving, 4-5 = confident.</p>
                </div>
                <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="What felt easy, weak, confusing, or worth revising?" />
                <Button className="w-full">Save feedback</Button>
              </form>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/95">
          <CardHeader><CardTitle>Feedback history</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {state.feedback.length === 0 ? <div className="rounded-3xl border border-dashed p-10 text-center text-muted-foreground"><MessageSquareText className="mx-auto mb-4 h-10 w-10 text-primary" />No feedback submitted yet.</div> : null}
            {state.feedback.slice().reverse().map((item) => (
              <div key={item.id} className={`rounded-3xl border p-5 ${item.confidence <= 2 ? "bg-orange-50" : item.confidence >= 4 ? "bg-emerald-50" : "bg-white"}`}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">Week of {item.weekStart}</p>
                    <h3 className="mt-1 font-bold">{getChapterName(state, item.chapterId)}</h3>
                  </div>
                  <div className="rounded-full bg-white px-3 py-1 text-sm font-bold shadow-sm">{item.confidence}/5</div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{item.notes || "No notes added."}</p>
                {item.confidence <= 2 ? <p className="mt-3 rounded-2xl bg-white p-3 text-sm text-orange-900">Weak chapter: a weekend review goal was added to Daily Tasks & Goals.</p> : null}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
