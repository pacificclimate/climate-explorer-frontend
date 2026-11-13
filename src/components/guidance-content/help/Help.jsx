import React from "react";
import NavRoutes from "../../navigation/NavRoutes/NavRoutes.jsx";
import FAQ from "./FAQ.jsx";
import General from "./General.jsx";

const navSpec = {
  basePath: "/help",
  items: [
    {
      label: "FAQ",
      subpath: "faq",
      component: FAQ,
    },
    // TODO: Break Help > General up into several pages
    {
      label: "General",
      subpath: "general",
      component: General,
    },
    // {
    //   label: 'Glossary',
    //   subpath: 'glossary',
    //   component: Glossary,
    // },
  ],
};

export default function Help(props) {
  return <NavRoutes pullUp {...{ navSpec, ...props }} />;
}
