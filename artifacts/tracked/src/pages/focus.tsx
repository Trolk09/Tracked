import { useEffect, useMemo, useState } from "react";
import { useStore, dateKey } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Play, RotateCcw, Save, Square } from "lucide-react";

export default function Focus() {
  const { state, addSession } = useStore();
  const [mode, setMode] = useState<"down" | "up">("down");
  const [preset, setPreset] = useState(25);
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [task, setTask] = useState("");
  const [completed, setCompleted] = useState("");

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
    if (mode === "down" && seconds === 0) setRunning(false);
  }, [seconds, mode]);

  const elapsedMinutes = useMemo(() => mode === "down" ? Math.max(1, Math.round((preset * 60 - seconds) / 60)) : Math.max(1, Math.round(seconds / 60)), [mode, preset, seconds]);
  const display = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  const totalMinutes = state.sessions.reduce((sum, session) => sum + session.durationMinutes, 0);

  function choosePreset(minutes: number) {
    setPreset(minutes);
    setSeconds(minutes * 60);
    setMode("down");
    setRunning(false);
  }

  function reset() {
    setRunning(false);
    setSeconds(mode === "down" ? preset * 60 : 0);
  }

  function saveSession() {
    addSession({ date: dateKey(), durationMinutes: elapsedMinutes, task: task || "Focus session", plannedVsCompleted: completed });
    setTask("");
    setCompleted("");
    reset();
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Focus session timer</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Start, stop, save</h1>
        <p className="mt-2 text-muted-foreground">Use 25m, 45m, 60m, or count up. Saved sessions update dashboard study time.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <Card className="bg-slate-950 text-white shadow-2xl shadow-emerald-100">
          <CardContent className="flex min-h-[520px] flex-col items-center justify-center gap-8 p-8 text-center">
            <div className="flex flex-wrap justify-center gap-2">
              {[25, 45, 60].map((minutes) => <Button key={minutes} variant={preset === minutes && mode === "down" ? "default" : "secondary"} className="rounded-full" onClick={() => choosePreset(minutes)}>{minutes}m</Button>)}
              <Button variant={mode === "up" ? "default" : "secondary"} className="rounded-full" onClick={() => { setMode("up"); setSeconds(0); setRunning(false); }}>Count up</Button>
            </div>
            <div className="text-8xl font-black tabular-nums tracking-tighter sm:text-9xl">{display}</div>
            <div className="flex flex-wrap justify-center gap-3">
              <Button size="lg" className="gap-2 rounded-full" onClick={() => setRunning(true)} disabled={running}><Play className="h-4 w-4" />Start</Button>
              <Button size="lg" variant="secondary" className="gap-2 rounded-full" onClick={() => setRunning(false)}><Square className="h-4 w-4" />Stop</Button>
              <Button size="lg" variant="outline" className="gap-2 rounded-full bg-transparent text-white hover:bg-white/10 hover:text-white" onClick={reset}><RotateCcw className="h-4 w-4" />Reset</Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-white/95">
            <CardHeader><CardTitle>Session notes</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Input value={task} onChange={(event) => setTask(event.target.value)} placeholder="What will you study?" />
              <Textarea value={completed} onChange={(event) => setCompleted(event.target.value)} placeholder="After study, write how much you completed" />
              <Button className="w-full gap-2" onClick={saveSession}><Save className="h-4 w-4" />Save session ({elapsedMinutes} min)</Button>
            </CardContent>
          </Card>
          <Card className="bg-white/95">
            <CardHeader><CardTitle>Study log</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-3xl bg-emerald-50 p-4 text-sm"><b>Total saved:</b> {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m</div>
              {state.sessions.slice().reverse().slice(0, 8).map((session) => <div key={session.id} className="rounded-2xl border bg-white p-3 text-sm"><b>{session.durationMinutes} min</b> · {session.task}<p className="text-muted-foreground">{session.date} · {session.plannedVsCompleted || "No completion note"}</p></div>)}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
