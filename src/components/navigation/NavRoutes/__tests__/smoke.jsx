import React, { act } from "react";
import { render } from "../../../../test_support/render";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";
import NavRoutes from "../NavRoutes";

const navSpec = {
  basePath: "/basePath",
  items: [
    { label: "Alpha", subpath: "alpha", component: () => <p>Alpha content</p> },
    { label: "Beta", subpath: "beta", component: () => <p>Beta content</p> },
  ],
};

it("keeps only the current route active after back and forward navigation", async () => {
  function HistoryButtons() {
    const navigate = useNavigate();
    return (
      <>
        <button onClick={() => navigate(-1)}>Back</button>
        <button onClick={() => navigate(1)}>Forward</button>
      </>
    );
  }
  const container = render(
    <MemoryRouter initialEntries={["/basePath/alpha"]}>
      <HistoryButtons />
      <Routes>
        <Route path="/basePath/*" element={<NavRoutes navSpec={navSpec} />} />
      </Routes>
    </MemoryRouter>,
  );
  const activeTabs = () =>
    [...container.querySelectorAll(".nav-link.active")].map(
      (a) => a.textContent,
    );

  await act(async () =>
    container.querySelector('a[href="/basePath/beta"]').click(),
  );
  expect(activeTabs()).toEqual(["Beta"]);
  await act(async () => container.querySelector("button").click());
  expect(container.textContent).toContain("Alpha content");
  expect(activeTabs()).toEqual(["Alpha"]);
  await act(async () => container.querySelectorAll("button")[1].click());
  expect(container.textContent).toContain("Beta content");
  expect(activeTabs()).toEqual(["Beta"]);
});

it.each([
  ["/basePath", ""],
  ["/basePath/missing", ""],
  ["/explorer/basePath", "/explorer"],
])(
  "redirects %s to the remembered page and supports navigation",
  async (path, basename) => {
    const onNavigate = vi.fn();
    let container;
    await act(async () => {
      container = render(
        <MemoryRouter basename={basename} initialEntries={[path]}>
          <Routes>
            <Route
              path="/basePath/*"
              element={
                <NavRoutes
                  navSpec={navSpec}
                  navIndex={1}
                  onNavigate={onNavigate}
                />
              }
            />
          </Routes>
        </MemoryRouter>,
      );
    });
    expect(container.textContent).toContain("Beta content");
    await act(async () =>
      container.querySelector(`a[href="${basename}/basePath/alpha"]`).click(),
    );
    expect(container.textContent).toContain("Alpha content");
    expect(onNavigate).toHaveBeenCalledWith(0);
  },
);
