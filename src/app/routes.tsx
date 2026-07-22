import { createBrowserRouter } from "react-router";
import Layout from "../components/Layout";
import Home from "../pages/Home";
import Setup from "../pages/Setup";
import RoomHub from "../pages/RoomHub";
import RoomCreate from "../pages/RoomCreate";
import RoomJoin from "../pages/RoomJoin";
import Lobby from "../pages/Lobby";
import Booth from "../pages/Booth";
import Strips from "../pages/Strips";
import Result from "../pages/Result";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "setup", Component: Setup },
      { path: "room", Component: RoomHub },
      { path: "room/create", Component: RoomCreate },
      { path: "room/join", Component: RoomJoin },
      { path: "room/lobby", Component: Lobby },
      { path: "booth", Component: Booth },
      { path: "strips", Component: Strips },
      { path: "result", Component: Result },
    ],
  },
]);
