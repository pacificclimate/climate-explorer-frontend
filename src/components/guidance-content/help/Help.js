import React from "react";
import NavRoutes from "../../navigation/NavRoutes/NavRoutes";
import FAQ from "./FAQ";
import General from "./General";

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
