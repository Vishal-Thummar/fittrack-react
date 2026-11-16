import { useState } from "react";
import { useApp } from "./context/AppContext.jsx";
import Layout from "./components/Layout.jsx";
import Login from "./pages/Login.jsx";
import Today from "./pages/Today.jsx";
import Timeline from "./pages/Timeline.jsx";
import Plan from "./pages/Plan.jsx";
import Goals from "./pages/Goals.jsx";

const PAGES = { today: Today, timeline: Timeline, plan: Plan, goals: Goals };

export default function App() {
  const { user } = useApp();
  const [tab, setTab] = useState("today");
  if (!user) return <Login />;
  const Page = PAGES[tab];
  return (
    <Layout tab={tab} setTab={setTab}>
      <Page />
    </Layout>
  );
}
