import { Switch, Route, Router as WouterRouter, Link, useLocation } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LayoutDashboard, BookOpen, Calendar as CalendarIcon, Timer, CheckSquare, Settings, BookCopy, FileWarning, MessageSquareText } from "lucide-react";

import Dashboard from "@/pages/dashboard";
import DailyTasks from "@/pages/daily-tasks";
import Syllabus from "@/pages/syllabus";
import CalendarPage from "@/pages/calendar";
import Focus from "@/pages/focus";
import Flashcards from "@/pages/flashcards";
import Mistakes from "@/pages/mistakes";
import Feedback from "@/pages/weekly-feedback";
import Profile from "@/pages/profile";

function AppShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/tasks", label: "Tasks & Goals", icon: CheckSquare },
    { href: "/syllabus", label: "Syllabus", icon: BookOpen },
    { href: "/calendar", label: "Revision Calendar", icon: CalendarIcon },
    { href: "/focus", label: "Focus Session", icon: Timer },
    { href: "/flashcards", label: "Flashcards", icon: BookCopy },
    { href: "/mistakes", label: "Mistake Journal", icon: FileWarning },
    { href: "/feedback", label: "Weekly Feedback", icon: MessageSquareText },
    { href: "/profile", label: "Profile", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,hsl(153_60%_43%/.12),transparent_32rem),linear-gradient(135deg,hsl(210_60%_98%),hsl(168_45%_96%))] text-foreground lg:flex">
      <aside className="lg:sticky lg:top-0 lg:h-screen lg:w-72 border-r border-white/70 bg-white/80 backdrop-blur-xl flex flex-col shadow-sm">
        <div className="p-6">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-black shadow-lg shadow-emerald-200">T</div>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950">Tracked</h1>
          <p className="text-sm text-muted-foreground mt-1">Your study command center</p>
        </div>
        <nav className="flex-1 px-4 pb-5 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = location === item.href;
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-all ${active ? "bg-primary text-primary-foreground shadow-md shadow-emerald-200" : "text-slate-600 hover:bg-emerald-50 hover:text-slate-950"}`}>
                <item.icon className="w-4 h-4" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

function Router() {
  return (
    <AppShell>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/tasks" component={DailyTasks} />
        <Route path="/syllabus" component={Syllabus} />
        <Route path="/calendar" component={CalendarPage} />
        <Route path="/focus" component={Focus} />
        <Route path="/flashcards" component={Flashcards} />
        <Route path="/mistakes" component={Mistakes} />
        <Route path="/feedback" component={Feedback} />
        <Route path="/profile" component={Profile} />
        <Route component={() => <div className="rounded-3xl bg-white p-8 shadow-sm">Page not found</div>} />
      </Switch>
    </AppShell>
  );
}

function App() {
  return (
    <TooltipProvider>
      <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, "") || ""}>
        <Router />
      </WouterRouter>
    </TooltipProvider>
  );
}

export default App;
