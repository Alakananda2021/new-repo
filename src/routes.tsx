import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { InputScreen } from "./components/InputScreen";
import { LoadingScreen } from "./components/LoadingScreen";
import { ResultsScreen } from "./components/ResultsScreen";
import { BacklogScreen } from "./components/BacklogScreen";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: InputScreen },
      { path: "loading", Component: LoadingScreen },
      { path: "results", Component: ResultsScreen },
      { path: "backlog", Component: BacklogScreen },
    ],
  },
]);
