import { useMemo, useState } from "react";
import { useStore, dateKey, getSubjectName, revisionDate, revisionLabels, RevisionKey } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight } from "lucide-react";

const revisionKeys: RevisionKey[] = ["d1", "d3", "d7", "d14", "d30"];

type CalendarEvent = { date: string; title: string; color: "green" | "yellow" | "purple" | "blue" | "red"; detail: string };

function monthGrid(anchor: Date) {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}

export default function CalendarPage() {
  const { state, addExam, deleteExam } = useStore();
  const [month, setMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(dateKey());
  const [examTitle, setExamTitle] = useState("");
  const [examSubject, setExamSubject] = useState("");

  const events: CalendarEvent[] = useMemo(() => {
    const revisionEvents = state.chapters.flatMap((chapter) => {
      const studied = chapter.studied && chapter.studiedDate ? [{ date: chapter.studiedDate.slice(0, 10), title: `Studied ${chapter.name}`, color: "green" as const, detail: "Chapter marked studied" }] : [];
      const revisions = revisionKeys.filter((key) => chapter.studied).map((key) => ({ date: revisionDate(chapter, key), title: `${revisionLabels[key]} ${chapter.name}`, color: chapter.revisions[key] ? "purple" as const : "yellow" as const, detail: chapter.revisions[key] ? "Revision done" : "Revision due" }));
      return [...studied, ...revisions];
    });
    const tasks = state.tasks.map((task) => ({ date: task.date, title: task.title, color: task.done ? "purple" as const : "blue" as const, detail: task.done ? "Goal done" : `Goal due (${task.frequency})` }));
    const exams = state.exams.map((exam) => ({ date: exam.date, title: exam.title, color: "red" as const, detail: `Exam · ${getSubjectName(state, exam.subjectId)}` }));
    return [...revisionEvents, ...tasks, ...exams].filter((event) => event.date);
  }, [state]);

  const days = monthGrid(month);
  const selectedEvents = events.filter((event) => event.date === selectedDate);
  const colorClass = { green: "bg-emerald-500", yellow: "bg-yellow-400", purple: "bg-purple-500", blue: "bg-sky-500", red: "bg-red-500" };

  function changeMonth(delta: number) {
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  }

  function submitExam(event: React.FormEvent) {
    event.preventDefault();
    addExam({ title: examTitle, date: selectedDate, subjectId: examSubject || undefined });
    setExamTitle("");
    setExamSubject("");
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Revision calendar</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">Future plan by month</h1>
          <p className="mt-2 text-muted-foreground">Green means studied, yellow means due, purple means done. Tasks and exams are included too.</p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl bg-white/90 p-2 shadow-sm">
          <Button variant="ghost" size="icon" onClick={() => changeMonth(-1)}><ChevronLeft className="h-4 w-4" /></Button>
          <div className="min-w-44 text-center font-bold">{month.toLocaleString(undefined, { month: "long", year: "numeric" })}</div>
          <Button variant="ghost" size="icon" onClick={() => changeMonth(1)}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="bg-white/95">
          <CardContent className="p-4">
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase tracking-wide text-muted-foreground">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <div key={day} className="p-2">{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {days.map((day) => {
                const key = dateKey(day);
                const dayEvents = events.filter((event) => event.date === key);
                const inMonth = day.getMonth() === month.getMonth();
                return (
                  <button key={key} onClick={() => setSelectedDate(key)} className={`min-h-28 rounded-3xl border p-3 text-left transition hover:-translate-y-1 hover:shadow-md ${selectedDate === key ? "border-primary bg-emerald-50" : "bg-white"} ${inMonth ? "opacity-100" : "opacity-40"}`}>
                    <div className="font-black">{day.getDate()}</div>
                    <div className="mt-2 space-y-1">
                      {dayEvents.slice(0, 3).map((event, index) => <div key={`${event.title}-${index}`} className="flex items-center gap-1 truncate text-[11px]"><span className={`h-2 w-2 rounded-full ${colorClass[event.color]}`} />{event.title}</div>)}
                      {dayEvents.length > 3 ? <div className="text-[11px] text-muted-foreground">+{dayEvents.length - 3} more</div> : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-white/95">
            <CardHeader><CardTitle>{selectedDate}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {selectedEvents.length === 0 ? <div className="rounded-3xl border border-dashed p-6 text-center text-sm text-muted-foreground">No event on this date.</div> : null}
              {selectedEvents.map((event, index) => <div key={`${event.title}-${index}`} className="rounded-2xl border bg-white p-4"><div className="flex items-center gap-2"><span className={`h-3 w-3 rounded-full ${colorClass[event.color]}`} /><b>{event.title}</b></div><p className="mt-1 text-sm text-muted-foreground">{event.detail}</p></div>)}
            </CardContent>
          </Card>

          <Card className="bg-white/95">
            <CardHeader><CardTitle>Add exam on selected date</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={submitExam} className="space-y-3">
                <Input value={examTitle} onChange={(event) => setExamTitle(event.target.value)} placeholder="Exam title" />
                <select className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={examSubject} onChange={(event) => setExamSubject(event.target.value)}>
                  <option value="">General exam</option>
                  {state.subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
                </select>
                <Button className="w-full">Add exam</Button>
              </form>
              <div className="mt-4 space-y-2">
                {state.exams.filter((exam) => exam.date === selectedDate).map((exam) => <div key={exam.id} className="flex items-center justify-between rounded-2xl bg-red-50 px-3 py-2 text-sm"><span>{exam.title}</span><Button size="sm" variant="ghost" onClick={() => deleteExam(exam.id)}>Remove</Button></div>)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
