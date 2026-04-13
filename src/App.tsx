import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import TopNav from "./components/Layout/TopNav";
import TimelinePage from "./components/Timeline/TimelinePage";
import TasksPage from "./components/Tasks/TasksPage";
import TrendsPage from "./components/Trends/TrendsPage";
import { useAppStore } from "./store/useAppStore";
import { isDbAvailable } from "./db";
import { requestNotificationPermission } from "./utils/notifications";

export default function App(): React.JSX.Element {
  const hydrate = useAppStore((s) => s.hydrate);
  const [dbWarning, setDbWarning] = useState(false);

  useEffect(() => {
    // Load persisted data, then warn the user if IndexedDB is unavailable.
    hydrate().then(() => {
      if (!isDbAvailable()) setDbWarning(true);
    });
    requestNotificationPermission();
  }, [hydrate]);

  return (
    <BrowserRouter>
      <TopNav />
      {dbWarning && (
        <div className="fixed top-14 left-0 right-0 bg-yellow-600 text-black text-xs text-center py-1.5 z-40">
          Offline storage unavailable — your data won't persist across sessions
        </div>
      )}
      <main
        className={`mx-auto max-w-[1200px] w-full px-4 ${dbWarning ? "pt-[80px]" : "pt-14"}`}
      >
        <Routes>
          <Route path="/" element={<TimelinePage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/trends" element={<TrendsPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
