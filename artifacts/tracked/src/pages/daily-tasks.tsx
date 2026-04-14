import { FormEvent, useMemo, useState } from "react";
import { useStore, dateKey, getSubjectName, revisionDate, revisionLabels, RevisionKey } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { CalendarDays, Plus, Trash2 } from "lucide-react";

const revisionKeys: RevisionKey[] = ["d1", "d3", "d7", "d14", "d30"];

export default function DailyTasks() {
  const { state, addTask, updateTask, deleteTask, updateChapter } = useStore();
  const [selectedDate, setSelectedDate] = useState(dateKey());
  const [title, setTitle] = useState("");
  const [frequency, setFrequency] = useState<"once" | "daily" | "weekly">("once");
  const today = dateKey();

  const visibleTasks = useMemo(() => state.tasks.filter((task) => {
    if (task.date === selectedDate) return true;
    if (!task.done && task.date < selectedDate && selectedDate >= today) return true;
    if (task.frequency === "daily" && task.date <= selectedDate) return true;
    if (task.frequency === "weekly" && task.date <= selectedDate) {
      return new Date(`${task.date}T12:00:00`).getDay() === new Date(`${selectedDate}T12:00:00`).getDay();
    }
    return false;
  }), [state.tasks, selectedDate, today]);

  const revisionsForDate = state.chapters.flatMap((chapter) => revisionKeys.filter((key) => chapter.studied && revisionDate(chapter, key) === selectedDate).map((key) => ({ chapter, key })));
  const exams = state.exams.filter((exam) => exam.date === selectedDate);

  function submit(event: FormEvent) {
    event.preventDefault();
    addTask({ title, date: selectedDate, frequency });
    setTitle("");
    setFrequency("once");
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Daily tasks & goals</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">Plan by date</h1>
          <p className="mt-2 text-muted-foreground">Changing the date shows that day’s goals, carried-forward tasks, revisions, and exams.</p>
        </div>
        <label className="rounded-2xl bg-white/90 p-3 text-sm font-medium shadow-sm">
          Selected date
          <Input className="mt-2" type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
        </label>
      </div>

      <Card className="bg-white/90">
        <CardContent className="pt-6">
          <form onSubmit={submit} className="grid gap-3 md:grid-cols-[1fr_160px_auto]">
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Add a task or future goal for this date" />
            <select className="rounded-md border bg-background px-3 py-2 text-sm" value={frequency} onChange={(event) => setFrequency(event.target.value as "once" | "daily" | "weekly")}>
              <option value="once">Once</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
            <Button className="gap-2"><Plus className="h-4 w-4" />Add goal</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="bg-white/90">
          <CardHeader><CardTitle>Tasks and goals for {selectedDate}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {visibleTasks.length === 0 ? <div className="rounded-3xl border border-dashed p-8 text-center text-muted-foreground">No goals for this date yet.</div> : null}
            {visibleTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3 rounded-2xl border bg-white p-4">
                <Checkbox checked={task.done} onCheckedChange={(checked) => updateTask(task.id, { done: Boolean(checked) })} />
                <div className="min-w-0 flex-1">
                  <p className={`font-medium ${task.done ? "line-through text-muted-foreground" : ""}`}>{task.title}</p>
                  <p className="text-xs text-muted-foreground">{task.date < selectedDate && !task.done ? "Carried forward from " : "Planned for "}{task.date} · {task.frequency}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white/90">
          <CardHeader><CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-primary" />Revision plan shown for this date</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {revisionsForDate.length === 0 && exams.length === 0 ? <div className="rounded-3xl border border-dashed p-8 text-center text-muted-foreground">No revision or exam item on this date.</div> : null}
            {revisionsForDate.map(({ chapter, key }) => (
              <div key={`${chapter.id}-${key}`} className="flex items-center gap-3 rounded-2xl bg-yellow-50 p-4">
                <Checkbox checked={chapter.revisions[key]} onCheckedChange={(checked) => updateChapter(chapter.id, { revisions: { ...chapter.revisions, [key]: Boolean(checked) } })} />
                <div><p className="font-semibold">{revisionLabels[key]} revision: {chapter.name}</p><p className="text-xs text-muted-foreground">Email reminder scheduled if email delivery is connected</p></div>
              </div>
            ))}
            {exams.map((exam) => <div key={exam.id} className="rounded-2xl bg-red-50 p-4"><b>Exam:</b> {exam.title} <span className="text-sm text-muted-foreground">({getSubjectName(state, exam.subjectId)})</span></div>)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
