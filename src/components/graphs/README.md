# Contents of this directory
 
All code in this directory is concerned with rendering data graphs 
presented alongside the map component of the UI.

## Components

The graph components form a dependency hierarchy as follows (root at top):

- `DataGraph`: base graph functionality founded on C3
    - `AnnualCycleGraph`: graphs long-term averages for the
    selected variable(s) over a full year
        - `SingleAnnualCycleGraph`
        - `DualAnnualCycleGraph`
    - `ContextGraph`: graphs all matching datasets from other models, 
    overlaid, to provide context for selected model's dataset
        - `SingleContextGraph`
    - `LongTermAveragesGraph`: graphs all long-term average values available
    for the selected model, variable, emission scenario
        - `SingleLongTermAveragesGraph`
        - `DualLongTermAveragesGraph`
    - `TimeSeriesGraph`: graphs the values of the selected variable(s) over time
        - `SingleTimeSeriesGraph`
        - `DualTimeSeriesGraph`

Note: All graphs show spatial averages of values over the area selected in the
map UI (or the entire spatial area available if none selected).
        
Each component specializes its dependent component for a more specific purpose.
Components `Single*Graph` and `Dual*Graph` are used to build UIs directly
(typically in `DataController` and `DualDataController`, respectively, but 
shortly to be extended).

## Helpers

`graph-helpers.js` contains code common to several components. It is imported
as needed, and provides services previously incorporated into the graphs
in the data controllers via `DataControllerMixin`.

# Creating new graph components

## Graph component pattern

Currently, all graph components follow a common pattern, as follows:

- props:
    - `model_id`, `variable_id`, `experiment`: Characterize the context;
    specifically, characterize what `meta` contains.
    - `meta`: Array of metadata, collectively describing all available datasets 
    matching the specified context of model, variable, experiment.
    - `getMetadata` Function returning an array of metadata 
    (not necessarily the same kind as elements of `meta`) describing the 
    specific datasets to display in this graph. This function may take an 
    argument that controls what metadata is returned. 
    This function is a 
    prop so that different functions can be used to specialize the graph
    component to different uses, typically to single or dual graphs.
    - `dataToGraphSpec`: Function mapping arrays of metadata and of data
    (corresponding element by element) to a graph specification consumable
    by `DataGraph`.
    This function is a 
    prop so that different functions can be used to specialize the graph
    component to different uses, typically to single or dual graphs.
    
- state:
    - `graphSpec`: Specification of the current graph displayed, consumed
    by `DataGraph`.
    - `selection`: (optional, name varies) Present if the graph includes a 
    data sub-selector component to control what values are displayed on graph.
    Value passed to `getMetadata`.
    
- render:
    - (optional) A data sub-selector component to control what values are 
    displayed on the graph. This should be a 
    [controlled component](https://reactjs.org/docs/forms.html#controlled-components) 
    whose `onChange` callback updates `state.selection`. 
    - (optional) Data export buttons whose `onClick` callbacks cause the data 
    in the graph to be exported in XLSX or CSV format.
    - `<DataGraph {...this.state.graphSpec}/>`: The graph.
    
- lifecycle:
    - Use of lifecycle hooks should follow standard recommendations, 
    specifically for when to launch asynchronous data fetches, as follows:
    - `componentDidMount`: `load()`
    - `componentDidUpdate`: if relevant props or state change, `load()`
    
- data loading (`load()`):
    - Get metadata for data to display: `metadatas = getMetadata(state.selection)`
    - Map `metadatas` to array of promises `dataPromises` for data fetches
    - When all data promises resolve, `Promise.all(dataPromises)`,
    convert metadata and data fetched to graph spec: 
    `dataToGraphSpec(metadatas, data)` and update `state.graphSpec`.
    
For examples, see the components `AnnualCycleGraph`, `ContextGraph`, 
`LongTermAveragesGraph`, `TimeSeriesGraph`.

## Important notes

1. Component state should be limited to graph specification and (optionally)
data (sub-)selection.
1. Data (sub-)selector should be a     
[controlled component](https://reactjs.org/docs/forms.html#controlled-components) , 
meaning that:
    - it is stateless
    - it is controlled by a `value` prop
    - it communicates changes via an `onChange` callback
    - the selection state is stored in the parent graph component
1. Asynch data fetching should be done only in lifecycle hooks 
`componentDidMount` and `componentDidUpdate`, as recommeded by 
React documentation.

# Testing issues

`DataGraph` appears to pose some difficulties in testing.
It is a legacy component, and arrived with tests defined but disabled.
No documentation was provided. However, when trying to test any component that
depends directly on it, the following fairly mystifying error occurs. 
This may have been the symptom that convinced the developers of `DataGraph` 
to disable its tests.

```
    TypeError: Cannot read property 'prototype' of undefined

      3 | var C3 = require('c3/c3');
      4 | import _ from 'underscore';
    > 5 | import styles from './DataGraph.css';
      6 | 
      7 | class DataGraph extends React.Component {
      8 |   static propTypes = {
      
      at ../node_modules/c3/c3.js:2806:31
      at ../node_modules/c3/c3.js:3349:3
      at Object.<anonymous>.CLASS.target (../node_modules/c3/c3.js:2:82)
      at Object.<anonymous> (../node_modules/c3/c3.js:5:2)
      at Object.<anonymous> (components/DataGraph/DataGraph.js:5:88)
      at Object.<anonymous> (components/graphs/AnnualCycleGraph/AnnualCycleGraph.js:7:163)
      at Object.<anonymous> (components/graphs/AnnualCycleGraph/__tests__/smoke.js:2:89)
```

Because of this issue, tests for directly dependent components have been removed.