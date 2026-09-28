import React from "react";
import NavRoutes from "../../navigation/NavRoutes/NavRoutes.jsx";
import ClimateExplorer from "./ClimateExplorer.jsx";
import Contact from "./Contact.jsx";
import Credits from "./Credits.jsx";
import Team from "./Team.jsx";

const navSpec = {
  basePath: "/about",
  items: [
    {
      label: "PCIC Climate Explorer",
      subpath: "climate-explorer",
      component: ClimateExplorer,
    },
    {
      label: "Credits and Acknowledgements",
      subpath: "credits",
      component: Credits,
    },
    {
      label: "Contact",
      subpath: "contact",
      component: Contact,
    },
    {
      label: "Team",
      subpath: "team",
      component: Team,
    },
  ],
};

export default function About(props) {
  return <NavRoutes pullUp {...{ navSpec, ...props }} />;
}
