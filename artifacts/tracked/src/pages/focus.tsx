import { useEffect, useMemo, useState } from "react";
import { ConfidenceRating, dateKey, getChapterName, getSubjectName, useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Play, RotateCcw, Save, Square, Star } from "lucide-react";

export default function Focus() {
  const { state, addSession } = useStore();
  const [mode, setMode] = useState<"down" | "up">("down");
  const [preset, setPreset] = useState(25);
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [chapterId, setChapterId] = useState("");
  const [task, setTask] = useState("");
  const [completed, setCompleted] = useState("");
  const [feedback, setFeedback] = useState("");
  const [confidence, setConfidence] = useState<ConfidenceRating>(3);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setSeconds((current) => {
        if (mode === "down") return Math.max(0, current - 1);
        return current + 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running, mode]);

  useEffect(() => {
    if (mode === "down" && seconds === 0) {
      setRunning(false);
      setFeedbackOpen(true);
    }
  }, [seconds, mode]);

  const elapsedMinutes = useMemo(() => mode === "down" ? Math.max(1, Math.round((preset * 60 - seconds) / 60)) : Math.max(1, Math.round(seconds / 60)), [mode, preset, seconds]);
  const display = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  const totalMinutes = state.sessions.reduce((sum, session) => sum + session.durationMinutes, 0);

  function choosePreset(minutes: number) {
    setPreset(minutes);
    setSeconds(minutes * 60);
    setMode("down");
    setRunning(false);
    setFeedbackOpen(false);
  }

  function stopSession() {
    setRunning(false);
    if (elapsedMinutes > 0) setFeedbackOpen(true);
  }

  function reset() {
    setRunning(false);
    setSeconds(mode === "down" ? preset * 60 : 0);
    setFeedbackOpen(false);
  }

  function saveSession() {
    addSession({
      date: dateKey(),
      durationMinutes: elapsedMinutes,
      chapterId,
      task: task || "Focus session",
      plannedVsCompleted: completed,
      feedback,
      confidence,
    });
    setTask("");
    setCompleted("");
    setFeedback("");
    setConfidence(3);
    reset();
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Focus session timer</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Start, stop, then reflect</h1>
        <p className="mt-2 text-muted-foreground">Select the chapter first. After the timer is stopped or finished, session feedback appears and is saved with that chapter.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_440px]">
        <Card className="bg-slate-950 text-white shadow-2xl shadow-emerald-100">
          <CardContent className="flex min-h-[520px] flex-col items-center justify-center gap-8 p-8 text-center">
            <div className="w-full max-w-xl rounded-3xl bg-white/10 p-4 text-left">
              <label className="text-xs font-semibold uppercase tracking-wide text-emerald-200">Chapter for this focus session</label>
              <select className="mt-2 w-full rounded-xl border border-white/20 bg-slate-900 px-3 py-3 text-sm text-white" value={chapterId} onChange={(event) => setChapterId(event.target.value)}>
                <option value="">Choose chapter</option>
                {state.chapters.map((chapter) => <option key={chapter.id} value={chapter.id}>{chapter.name} — {getSubjectName(state, chapter.subjectId)}</option>)}
              </select>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {[25, 45, 60].map((minutes) => <Button key={minutes} variant={preset === minutes && mode === "down" ? "default" : "secondary"} className="rounded-full" onClick={() => choosePreset(minutes)}>{minutes}m</Button>)}
              <Button variant={mode === "up" ? "default" : "secondary"} className="rounded-full" onClick={() => { setMode("up"); setSeconds(0); setRunning(false); setFeedbackOpen(false); }}>Count up</Button>
            </div>
            <div className="text-8xl font-black tabular-nums tracking-tighter sm:text-9xl">{display}</div>
            <div className="flex flex-wrap justify-center gap-3">
              <Button size="lg" className="gap-2 rounded-full" onClick={() => setRunning(true)} disabled={running || !chapterId}><Play className="h-4 w-4" />Start</Button>
              <Button size="lg" variant="secondary" className="gap-2 rounded-full" onClick={stopSession}><Square className="h-4 w-4" />Stop</Button>
              <Button size="lg" variant="outline" className="gap-2 rounded-full bg-transparent text-white hover:bg-white/10 hover:text-white" onClick={reset}><RotateCcw className="h-4 w-4" />Reset</Button>
            </div>
            {!chapterId ? <p className="text-sm text-amber-200">Add and select a chapter before starting so the session can be saved correctly.</p> : null}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-white/95">
            <CardHeader><CardTitle>Session goal</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Input value={task} onChange={(event) => setTask(event.target.value)} placeholder="What is the goal for this chapter session?" />
              {!feedbackOpen ? <div className="rounded-3xl border border-dashed p-5 text-sm text-muted-foreground">Feedback fields will unlock after the session is stopped or completed.</div> : null}
              {feedbackOpen ? (
                <div className="space-y-3 rounded-3xl bg-emerald-50 p-4">
                  <Textarea value={completed} onChange={(event) => setCompleted(event.target.value)} placeholder="What did you complete compared to your goal?" />
                  <Textarea value={feedback} onChange={(event) => setFeedback(event.target.value)} placeholder="Session feedback: focus level, doubts, what to revise next" />
                  <div>
                    <p className="mb-2 text-sm font-semibold">Confidence after this session</p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((value) => <Button key={value} type="button" variant={confidence === value ? "default" : "outline"} size="icon" onClick={() => setConfidence(value as ConfidenceRating)}><Star className="h-4 w-4" /></Button>)}
                    </div>
                  </div>
                  <Button className="w-full gap-2" onClick={saveSession} disabled={!chapterId}><Save className="h-4 w-4" />Save session ({elapsedMinutes} min)</Button>
                </div>
              ) : null}
            </CardContent>
          </Card>
          <Card className="bg-white/95">
            <CardHeader><CardTitle>Study log</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-3xl bg-emerald-50 p-4 text-sm"><b>Total saved:</b> {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m</div>
              {state.sessions.slice().reverse().slice(0, 8).map((session) => <div key={session.id} className="rounded-2xl border bg-white p-3 text-sm"><b>{session.durationMinutes} min</b> · {getChapterName(state, session.chapterId)}<p className="font-medium">Goal: {session.task}</p><p className="text-muted-foreground">{session.date} · {session.plannedVsCompleted || "No completion note"}</p><p className="text-muted-foreground">Feedback: {session.feedback || "No feedback"} · Confidence {session.confidence}/5</p></div>)}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
