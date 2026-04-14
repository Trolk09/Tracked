import { FormEvent, useState } from "react";
import { chapterStatus, getSubjectName, revisionDate, revisionLabels, RevisionKey, useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Mail, Trash2, Users } from "lucide-react";

const revisionKeys: RevisionKey[] = ["d1", "d3", "d7", "d14", "d30"];

export default function Profile() {
  const { state, updateSettings, addStudent, updateStudent, removeStudent, resetAll } = useStore();
  const [studentName, setStudentName] = useState("");
  const currentProgress = {
    openTasks: state.tasks.filter((task) => !task.done).length,
    chapters: state.chapters.length,
    studyMinutes: state.sessions.reduce((sum, session) => sum + session.durationMinutes, 0),
    weakChapters: state.chapters.filter((chapter) => chapterStatus(state, chapter.id) === "Weak").length,
    confidentChapters: state.chapters.filter((chapter) => chapterStatus(state, chapter.id) === "Confident").length,
  };
  const reminders = [
    ...state.chapters.flatMap((chapter) => revisionKeys.filter((key) => chapter.studied && !chapter.revisions[key]).map((key) => ({ date: revisionDate(chapter, key), title: `${revisionLabels[key]} revision: ${chapter.name}` }))),
    ...state.tasks.filter((task) => !task.done).map((task) => ({ date: task.date, title: `Goal: ${task.title}` })),
    ...state.exams.map((exam) => ({ date: exam.date, title: `Exam: ${exam.title} (${getSubjectName(state, exam.subjectId)})` })),
  ].filter((item) => item.date).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 12);

  function submitStudent(event: FormEvent) {
    event.preventDefault();
    addStudent(studentName);
    setStudentName("");
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Profile, class & reminders</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Set up Tracked for your study life</h1>
        <p className="mt-2 text-muted-foreground">Students can create their class, add classmates or students, and track progress locally. Teacher mode can use the same class progress table.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-white/95">
          <CardHeader><CardTitle>Account mode</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Button variant={state.settings.mode === "student" ? "default" : "outline"} onClick={() => updateSettings({ mode: "student" })}>Student</Button>
              <Button variant={state.settings.mode === "teacher" ? "default" : "outline"} onClick={() => updateSettings({ mode: "teacher" })}>Teacher</Button>
            </div>
            <Input value={state.settings.name} onChange={(event) => updateSettings({ name: event.target.value })} placeholder="Your name" />
            <Input type="email" value={state.settings.email} onChange={(event) => updateSettings({ email: event.target.value })} placeholder="Email for reminders" />
            <Input value={state.settings.className} onChange={(event) => updateSettings({ className: event.target.value })} placeholder="Create or name your class" />
            <Input value={state.settings.syllabusName} onChange={(event) => updateSettings({ syllabusName: event.target.value })} placeholder="Syllabus / board / exam" />
          </CardContent>
        </Card>

        <Card className="bg-white/95">
          <CardHeader><CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5 text-primary" />Scheduled email reminders</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-amber-900">Tracked lists reminder dates here. Real email delivery is not active until an email service is connected, so the app will not pretend messages were sent.</p>
            {state.settings.email ? <p className="rounded-2xl bg-emerald-50 p-3">Prepared for <b>{state.settings.email}</b></p> : <p className="rounded-2xl bg-orange-50 p-3">Add an email address to prepare reminders.</p>}
            <div className="max-h-80 space-y-2 overflow-y-auto">
              {reminders.length === 0 ? <div className="rounded-3xl border border-dashed p-6 text-center text-muted-foreground">No future reminders yet.</div> : null}
              {reminders.map((item, index) => <div key={`${item.date}-${item.title}-${index}`} className="rounded-2xl border bg-white p-3"><b>{item.date}</b><br />{item.title}</div>)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/95">
        <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" />Class progress</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-3xl bg-emerald-50 p-4 text-sm">
            <b>{state.settings.name || "You"}</b> in {state.settings.className || "your class"}: {currentProgress.chapters} chapters, {Math.floor(currentProgress.studyMinutes / 60)}h {currentProgress.studyMinutes % 60}m study time, {currentProgress.weakChapters} weak, {currentProgress.confidentChapters} confident.
          </div>
          <form onSubmit={submitStudent} className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <Input value={studentName} onChange={(event) => setStudentName(event.target.value)} placeholder="Add student or classmate name" />
            <Button>Add student</Button>
          </form>
          <div className="overflow-x-auto rounded-3xl border">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="bg-emerald-50 text-left text-xs uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="p-3">Student</th>
                  <th className="p-3">Open tasks</th>
                  <th className="p-3">Chapters</th>
                  <th className="p-3">Study minutes</th>
                  <th className="p-3">Weak</th>
                  <th className="p-3">Confident</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {state.settings.students.length === 0 ? <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No students added yet. Add names to start tracking class progress.</td></tr> : null}
                {state.settings.students.map((student) => (
                  <tr key={student.id} className="border-t bg-white">
                    <td className="p-3"><Input value={student.name} onChange={(event) => updateStudent(student.id, { name: event.target.value })} /></td>
                    <td className="p-3"><Input type="number" min="0" value={student.openTasks} onChange={(event) => updateStudent(student.id, { openTasks: Number(event.target.value) })} /></td>
                    <td className="p-3"><Input type="number" min="0" value={student.chapters} onChange={(event) => updateStudent(student.id, { chapters: Number(event.target.value) })} /></td>
                    <td className="p-3"><Input type="number" min="0" value={student.studyMinutes} onChange={(event) => updateStudent(student.id, { studyMinutes: Number(event.target.value) })} /></td>
                    <td className="p-3"><Input type="number" min="0" value={student.weakChapters} onChange={(event) => updateStudent(student.id, { weakChapters: Number(event.target.value) })} /></td>
                    <td className="p-3"><Input type="number" min="0" value={student.confidentChapters} onChange={(event) => updateStudent(student.id, { confidentChapters: Number(event.target.value) })} /></td>
                    <td className="p-3"><Button variant="ghost" size="icon" onClick={() => removeStudent(student.id)}><Trash2 className="h-4 w-4" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted-foreground">This first build stores class progress locally in this browser. Shared real-time student accounts can be connected later.</p>
        </CardContent>
      </Card>

      <Card className="border-red-100 bg-red-50/80">
        <CardHeader><CardTitle>Reset local data</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-red-900">This clears subjects, chapters, tasks, flashcards, mistakes, feedback, exams, sessions, class progress, and profile data stored in this browser.</p>
          <Button variant="destructive" onClick={resetAll}>Reset everything</Button>
        </CardContent>
      </Card>
    </div>
  );
}
