import React from "react";
import TestUtils from "react-dom/test-utils";
import Selector from "../Selector";

jest.dontMock("../Selector");
jest.dontMock("react-bootstrap");

describe("Selector", function () {
  it("sets the label", function () {
    var selector = TestUtils.renderIntoDocument(
      <Selector label={"New Label"} />,
    );

    var labelNode = TestUtils.findRenderedDOMComponentWithTag(
      selector,
      "label",
    );
    expect(labelNode.textContent).toEqual("New Label");
  });

  it("can handle passed items", function () {
    var selector = TestUtils.renderIntoDocument(
      <Selector items={["apple", "banana", "carrot"]} />,
    );

    var itemNodes = TestUtils.scryRenderedDOMComponentsWithTag(selector, "li");
    var content = itemNodes.map(function (obj) {
      return obj.textContent;
    });
    expect(content).toEqual(["apple", "banana", "carrot"]);
  });

  it("can handle [key, label] pairs", function () {
    var selector = TestUtils.renderIntoDocument(
      <Selector
        items={[
          ["apple_value", "Apple label"],
          ["banana_value", "Banana label"],
        ]}
      />,
    );
    var itemNodes = TestUtils.scryRenderedDOMComponentsWithTag(selector, "li");

    var content = itemNodes.map(function (obj) {
      return obj.textContent;
    });
    expect(content).toEqual(["Apple label", "Banana label"]);
  });

  it("can handle [key, label, disabled] triples", function () {
    var selector = TestUtils.renderIntoDocument(
      <Selector
        items={[
          ["apple_value", "Apple label", true],
          ["banana_value", "Banana label", false],
        ]}
      />,
    );
    var itemNodes = TestUtils.scryRenderedDOMComponentsWithTag(selector, "a");
    //This is a very low-level way to test this, and very dependant on
    //exact implementation in a way we normally don't have to care about.
    //This test would likely be broken by a react or react-bootstrap upgrade. There is
    //probably a more semantic and less fragile way to test whether an element is
    //disabled, but I have been unable to determine it.
    // expect(itemNodes[0].style[0]).toBe("pointer-events");
    // expect(itemNodes[1].style[0]).toBe(undefined);
    // FIXME: Find a way to test this
  });

  it("calls the callback", function () {
    var callback = jest.fn();
    var selector = TestUtils.renderIntoDocument(
      <Selector
        onChange={callback}
        items={[
          ["one", "first"],
          ["two", "second"],
        ]}
      />,
    );

    var dropdownButton = TestUtils.findRenderedDOMComponentWithTag(
      selector,
      "button",
    );
    TestUtils.Simulate.click(dropdownButton);
    var option = TestUtils.scryRenderedDOMComponentsWithTag(selector, "a")[1];
    TestUtils.Simulate.click(option);

    expect(callback).toBeCalledWith("two");
  });
});
