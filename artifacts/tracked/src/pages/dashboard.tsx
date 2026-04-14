import { Link } from "wouter";
import { chapterStatus, dateKey, getLatestFeedback, revisionDate, revisionLabels, RevisionKey, useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, BookOpen, CheckCircle2, Clock, Flame, Mail, Target } from "lucide-react";

const revisionKeys: RevisionKey[] = ["d1", "d3", "d7", "d14", "d30"];

export default function Dashboard() {
  const { state } = useStore();
  const today = dateKey();
  const totalStudyMinutes = state.sessions.reduce((sum, session) => sum + session.durationMinutes, 0);
  const openTasks = state.tasks.filter((task) => !task.done).length;
  const weakChapterList = state.chapters.filter((chapter) => chapterStatus(state, chapter.id) === "Weak");
  const confidentChapterList = state.chapters.filter((chapter) => chapterStatus(state, chapter.id) === "Confident");
  const dueToday = state.chapters.flatMap((chapter) => revisionKeys.filter((key) => chapter.studied && !chapter.revisions[key] && revisionDate(chapter, key) === today).map((key) => ({ chapter, key })));
  const tasksToday = state.tasks.filter((task) => task.date <= today && !task.done).slice(0, 5);
  const cards = [
    { label: "Open tasks", value: openTasks, sub: "active goals and reminders", icon: CheckCircle2 },
    { label: "Chapters", value: state.chapters.length, sub: `${state.chapters.filter((chapter) => chapter.studied).length} studied`, icon: BookOpen },
    { label: "Study time", value: `${Math.floor(totalStudyMinutes / 60)}h ${totalStudyMinutes % 60}m`, sub: "saved focus sessions", icon: Clock },
    { label: "Weak chapters", value: weakChapterList.length, sub: "from table and feedback", icon: AlertTriangle },
    { label: "Confident", value: confidentChapterList.length, sub: "rated strong", icon: Flame },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-2xl shadow-emerald-100">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-300">Tracked dashboard</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight">Welcome back{state.settings.name ? `, ${state.settings.name}` : ""}</h1>
            <p className="mt-3 max-w-2xl text-slate-300">Track chapter confidence, weak areas, focus sessions, revisions, mistake images, and class progress from one place.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/syllabus"><Button className="rounded-full">Open chapter table</Button></Link>
            <Link href="/focus"><Button variant="secondary" className="rounded-full">Start focus</Button></Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <Card key={card.label} className="border-white/80 bg-white/85 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">{card.label}</CardTitle>
              <card.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black tracking-tight">{card.value}</div>
              <p className="mt-1 text-xs text-muted-foreground">{card.sub}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-white/90">
          <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-orange-500" />Weak chapters</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {weakChapterList.length === 0 ? <div className="rounded-3xl border border-dashed p-8 text-center text-muted-foreground">No chapter marked weak yet.</div> : null}
            {weakChapterList.map((chapter) => {
              const feedback = getLatestFeedback(state, chapter.id);
              const latestWeakness = chapter.weaknessEntries.slice().reverse()[0];
              return <div key={chapter.id} className="rounded-2xl bg-orange-50 p-4 text-sm"><b>{chapter.name}</b><p className="text-muted-foreground">Rating: {feedback?.confidence || "from weakness notes"}/5 · {feedback?.notes || latestWeakness?.text || chapter.weakness || "Needs review"}</p>{latestWeakness ? <p className="mt-1 text-xs text-muted-foreground">Latest weakness entry: {latestWeakness.date}</p> : null}</div>;
            })}
          </CardContent>
        </Card>

        <Card className="bg-white/90">
          <CardHeader><CardTitle className="flex items-center gap-2"><Flame className="h-5 w-5 text-primary" />Confident chapters</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {confidentChapterList.length === 0 ? <div className="rounded-3xl border border-dashed p-8 text-center text-muted-foreground">No chapter marked confident yet.</div> : null}
            {confidentChapterList.map((chapter) => {
              const feedback = getLatestFeedback(state, chapter.id);
              return <div key={chapter.id} className="rounded-2xl bg-emerald-50 p-4 text-sm"><b>{chapter.name}</b><p className="text-muted-foreground">Rating: {feedback?.confidence}/5 · {feedback?.notes || "Marked confident"}</p></div>;
            })}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 bg-white/90">
          <CardHeader><CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-primary" />Today needs attention</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {dueToday.length === 0 && tasksToday.length === 0 ? <div className="rounded-3xl border border-dashed p-8 text-center text-muted-foreground">No open task or revision is due today. Add goals or mark a chapter studied to create a plan.</div> : null}
            {dueToday.map(({ chapter, key }) => (
              <div key={`${chapter.id}-${key}`} className="flex items-center justify-between rounded-2xl bg-yellow-50 p-4 text-sm">
                <span><b>{revisionLabels[key]}</b> revision due for {chapter.name}</span>
                <Link href="/syllabus"><Button size="sm" variant="outline">Open table</Button></Link>
              </div>
            ))}
            {tasksToday.map((task) => <div key={task.id} className="rounded-2xl bg-emerald-50 p-4 text-sm"><b>Task:</b> {task.title} <span className="text-muted-foreground">({task.date < today ? "carried forward" : "today"})</span></div>)}
          </CardContent>
        </Card>

        <Card className="bg-white/90">
          <CardHeader><CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5 text-primary" />Email reminders</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">Reminder items are scheduled inside Tracked for your calendar and dashboard.</p>
            {state.settings.email ? <p className="rounded-2xl bg-emerald-50 p-3">Reminder email: <b>{state.settings.email}</b></p> : <p className="rounded-2xl bg-orange-50 p-3">Add your email in Profile to prepare reminders.</p>}
            <p className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-amber-900">Real email sending needs to be connected before messages are actually sent.</p>
            <Link href="/calendar"><Button className="w-full rounded-full" variant="outline">View future plan</Button></Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
