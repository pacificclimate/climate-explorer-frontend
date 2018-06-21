import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';

const IndexedSelector = require('../IndexedSelector');

describe('IndexedSelector', function () {
  it('renders without crashing', () => {
    const superheroes = [{theme: "bat", gender: "male"}, {theme: "bat", gender: "female"},
      {theme: "wonder", gender: "male"}, {theme: "wonder", gender: "female"}];
    function heroNamer (hero) {
      return `${hero.theme}${hero.gender == "male" ? "man" : "woman"}`;
    } 
    ReactDOM.render(
        ( 
            <IndexedSelector
              items={superheroes}
              itemLabeler={heroNamer}
              label={"Select Hero"}
              value={"aquaman"}
            /> 
        ), document.createElement('div')
      );
    });  
//TODO: fix these nonfunctional tests
  xit('generates labels for selectable objects', function () {
    const trees = [{species: "arbutus", size: "small"}, {species: "redcedar", size: "huge"}];
    function treeDescriber(tree) {
      return `a ${tree.size} ${tree.species} tree`;
    } 
    var is = TestUtils.renderIntoDocument(
        <IndexedSelector 
          items={trees}
          itemLabeler={treeDescriber}
          label={"Tree Selector"}
          value={"pick a tree"}
        />
    );
    var listItems = TestUtils.scryRenderedDOMComponentsWithTag(is, 'li');
    var listLabels = listItems.map(function(item) {
      return item.textContent;
    });
    expect(listLabels).toEqual(['a small arbutus tree', 'a huge redcedar tree']);
  });
  
  xit('passes the selected object to the callback', function () {
    const pizzas = [{crust: "whole wheat", toppings: "cashews and green chiles"},
      {crust: "gluten free", toppings: "eggplant parmesan"},
      {crust: "white", toppings: "chanterelles and roasted garlic"}];
    function pizzaDescriber (pizza) {
      return `slice with ${pizza.toppings}`;
    }
    const dummyCallback = jest.genMockFunction();
    let is = TestUtils.renderIntoDocument(
        <IndexedSelector
          items={pizzas}
          itemLabeler={pizzaDescriber}
          label={"Pizza selection"}
          value={pizzas[2]}
          onChange={dummyCallback}
        />
    );
    const option = TestUtils.scryRenderedDOMComponentsWithTag(is, 'a')[1];
    TestUtils.Simulate.click(option);
    expect(dummyCallback).toBeCalledWith({crust: "whole wheat", toppings: "cashews and green chiles"});
  });
});
