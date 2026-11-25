import React from "react";
import BootstrapSlider from "bootstrap-slider";
import { render } from "../../../test_support/render";
import Slider from "../Slider";

vi.mock("bootstrap-slider", () => ({
  default: vi.fn(function () {
    this.on = vi.fn();
    this.setValue = vi.fn();
    this.destroy = vi.fn();
  }),
}));

it("updates the slider value and releases the plugin when unmounted", () => {
  const container = render(<Slider value={10} />);
  const plugin = BootstrapSlider.mock.instances[0];
  expect(BootstrapSlider.mock.calls[0][0]).toBe(container.firstChild);
  render(<Slider value={20} />, container);
  expect(plugin.setValue).toHaveBeenLastCalledWith(20);
  render(null, container);
  expect(plugin.destroy).toHaveBeenCalledOnce();
});
