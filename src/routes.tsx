import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { LandingPage } from "./components/LandingPage";
import { InputScreen } from "./components/InputScreen";
import { LoadingScreen } from "./components/LoadingScreen";
import { ResultsScreen } from "./components/ResultsScreen";

export const router = createBrowserRouter([
  { path: "/", Component: LandingPage },
  {
    path: "/app",
    Component: Layout,
    children: [
      { index: true, Component: InputScreen },
      { path: "loading", Component: LoadingScreen },
      { path: "results", Component: ResultsScreen },
    ],
  },
]);
