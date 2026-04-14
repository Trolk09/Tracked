import { FormEvent, useState } from "react";
import { Link } from "wouter";
import { useStore, getSubjectName, revisionDate, revisionLabels, RevisionKey } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Plus, Trash2 } from "lucide-react";

const revisionKeys: RevisionKey[] = ["d1", "d3", "d7", "d14", "d30"];

export default function Syllabus() {
  const { state, addSubject, deleteSubject, addChapter, updateChapter, deleteChapter } = useStore();
  const [subjectName, setSubjectName] = useState("");
  const [chapterName, setChapterName] = useState<Record<string, string>>({});

  function submitSubject(event: FormEvent) {
    event.preventDefault();
    addSubject(subjectName);
    setSubjectName("");
  }

  function submitChapter(event: FormEvent, subjectId: string) {
    event.preventDefault();
    addChapter(subjectId, chapterName[subjectId] || "");
    setChapterName((current) => ({ ...current, [subjectId]: "" }));
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Syllabus & chapter tables</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Build your own syllabus</h1>
        <p className="mt-2 text-muted-foreground">No subjects or chapters are preloaded. Add your own, then track study status, revisions, flashcards, notes, materials, weaknesses, and mistakes.</p>
      </div>

      <Card className="bg-white/90">
        <CardContent className="pt-6">
          <form onSubmit={submitSubject} className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <Input value={subjectName} onChange={(event) => setSubjectName(event.target.value)} placeholder="Add a subject, e.g. Physics" />
            <Button className="gap-2"><Plus className="h-4 w-4" />Add subject</Button>
          </form>
        </CardContent>
      </Card>

      {state.subjects.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed bg-white/70 p-12 text-center text-muted-foreground">
          <BookOpen className="mx-auto mb-4 h-10 w-10 text-primary" />
          Start by adding your first subject. Your chapter tables will appear here individually.
        </div>
      ) : null}

      {state.subjects.map((subject) => {
        const chapters = state.chapters.filter((chapter) => chapter.subjectId === subject.id);
        return (
          <Card key={subject.id} className="overflow-hidden bg-white/95">
            <CardHeader className="flex flex-row items-center justify-between gap-4 bg-slate-950 text-white">
              <div>
                <CardTitle className="text-2xl">{subject.name}</CardTitle>
                <p className="text-sm text-slate-300">{chapters.length} chapter{chapters.length === 1 ? "" : "s"}</p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => deleteSubject(subject.id)}>Delete subject</Button>
            </CardHeader>
            <CardContent className="space-y-5 p-5">
              <form onSubmit={(event) => submitChapter(event, subject.id)} className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <Input value={chapterName[subject.id] || ""} onChange={(event) => setChapterName((current) => ({ ...current, [subject.id]: event.target.value }))} placeholder={`Add a chapter/topic in ${subject.name}`} />
                <Button variant="outline" className="gap-2"><Plus className="h-4 w-4" />Add chapter</Button>
              </form>

              {chapters.length === 0 ? <div className="rounded-3xl border border-dashed p-8 text-center text-sm text-muted-foreground">No chapters in this subject yet.</div> : null}

              {chapters.length > 0 ? (
                <div className="overflow-x-auto rounded-3xl border">
                  <table className="w-full min-w-[1180px] text-sm">
                    <thead className="bg-emerald-50 text-left text-xs uppercase tracking-wide text-slate-600">
                      <tr>
                        <th className="p-3">Chapter</th>
                        <th className="p-3">Studied</th>
                        <th className="p-3">Sources / material</th>
                        <th className="p-3">Notes</th>
                        {revisionKeys.map((key) => <th key={key} className="p-3">{revisionLabels[key]}</th>)}
                        <th className="p-3">Flashcards</th>
                        <th className="p-3">Mistakes</th>
                        <th className="p-3">Weakness / other</th>
                        <th className="p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chapters.map((chapter) => {
                        const flashcardCount = state.flashcards.filter((card) => card.chapterId === chapter.id).length;
                        const mistakeCount = state.mistakes.filter((mistake) => mistake.chapterId === chapter.id).length;
                        return (
                          <tr key={chapter.id} className={chapter.weakness.trim() ? "border-t bg-orange-50/60" : "border-t bg-white"}>
                            <td className="p-3 font-semibold">{chapter.name}<div className="text-xs font-normal text-muted-foreground">{getSubjectName(state, chapter.subjectId)}</div></td>
                            <td className="p-3"><Checkbox checked={chapter.studied} onCheckedChange={(checked) => updateChapter(chapter.id, { studied: Boolean(checked) })} /><div className="mt-1 text-xs text-muted-foreground">{chapter.studiedDate?.slice(0, 10) || "Not yet"}</div></td>
                            <td className="p-3"><Textarea className="min-h-20" value={chapter.sources} onChange={(event) => updateChapter(chapter.id, { sources: event.target.value })} placeholder="Book, PDF, video, notes link" /></td>
                            <td className="p-3"><select className="rounded-md border bg-background px-2 py-2" value={chapter.notesStatus} onChange={(event) => updateChapter(chapter.id, { notesStatus: event.target.value })}><option value="none">No notes</option><option value="draft">Draft</option><option value="complete">Complete</option><option value="needs-review">Needs review</option></select></td>
                            {revisionKeys.map((key) => <td key={key} className="p-3 align-top"><Checkbox disabled={!chapter.studied} checked={chapter.revisions[key]} onCheckedChange={(checked) => updateChapter(chapter.id, { revisions: { ...chapter.revisions, [key]: Boolean(checked) } })} /><div className="mt-1 text-xs text-muted-foreground">{chapter.studied ? revisionDate(chapter, key) : "Study first"}</div></td>)}
                            <td className="p-3"><Link href="/flashcards"><Button size="sm" variant="outline">{flashcardCount} cards</Button></Link></td>
                            <td className="p-3"><Link href="/mistakes"><Button size="sm" variant="outline">{mistakeCount} wrong</Button></Link></td>
                            <td className="p-3"><Textarea className="min-h-20" value={chapter.weakness} onChange={(event) => updateChapter(chapter.id, { weakness: event.target.value })} placeholder="Weak formulas, silly mistakes, needs practice..." /></td>
                            <td className="p-3"><Button size="icon" variant="ghost" onClick={() => deleteChapter(chapter.id)}><Trash2 className="h-4 w-4" /></Button></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
