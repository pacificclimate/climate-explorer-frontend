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
        - `AnomalyAnnualCycleGraph` 
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
    - `VariableResponseGraph`: no time dimension, graphs a scatterplot of
    datapoints using one variable as the y axis and the other as the x axis.
        - `DualVariableResponseGraph` (can't be generated with a single variable.)

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

Currently, all graph components follow one of two common patterns, 
the old and the new. 

Old and new patterns are very similar, and differ mainly on the
usage of lifecycle hooks and in particular how they are used to choreograph
data fetching.

### New graph component pattern

This pattern follows the lifecycle API and recommended usage introduced in
React 16.3. Not all graph components have been brought up to this pattern yet.
It will eventually be necessary to do so because some lifecycle hooks have been
deprecated and will eventually be removed (in React 17).

All new graph components should follow this pattern.

This pattern is based on the recommended pattern for asynchronous data fetching
described in

- https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html

See also

- https://reactjs.org/blog/2018/03/29/react-v-16-3.html
- https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html

The recommended pattern has been extended to handle data fetching based also 
on changes to a state value (`<selection>`). Here's a summary:

The content of `state.data` is determined by two qualitatively
different kinds of values:

- props (specifically, `meta` and `area`)
- state (specifically, `<selection>`)

A change to any of these values triggers a data fetch.

The need for a data fetch is signalled by setting `state.data = null`.

The fact of a fetch in progress is signalled by `state.fetchingData` 
(a Boolean).

Signal, fetch initiation, and fetch completion occur separately.

Between the time `state.<selection>` changes and the time that the
data fetch completes, `state.<selection>` and `state.data` are 
inconsistent, and any computation based on them will be invalid 
(e.g., `this.graphSpec()`).

We must therefore treat `state.<selection>` (and its changes) like props.
This requires putting the previous value of `state.<selection>` 
on state as well (as `state.prev<selection>`),
so that it can, like props, be compared in `getDerivedStateFromProps`.
(Note: `getDerivedStateFromProps` does only has access to the current
state and props, hence the need for prev values stored on state.
This comes directly from the design of and recommended practice
for lifecycle management in React 16.3+.)

Specifics:

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
    - `prevMeta`: Previous (to current update) value of `props.meta`. 
    Used to coordinate data fetches.
    - `prevArea`: Previous (to current update) value of `props.area`. 
    Used to coordinate data fetches.
    - `prev<selection>`: (optional, name varies) 
    Present if the graph includes a data sub-selector component to control 
    what values are displayed on graph. Previous (to current update) value 
    of `state.<selection>`. Used to coordinate data fetches.
    - `<selection>`: (optional, name varies) Present if the graph includes a 
    data sub-selector component to control what values are displayed on graph.
    Value passed to `getMetadata`.
    - `data`: Data fetched according to metadata, area, and selector.
    Null value signals need for new data (data fetch).
    - `fetchingData`: True when data fetch is in progress. False otherwise.
    - `dataError`: Non-null when a data fetching resulted in an error.
    
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
    - `componentDidMount`: `fetchData()`
    - `componentDidUpdate`: if new data required, `fetchData()`
    
- data loading (`fetchData()`):
    - Get metadata for data to display: `metadatas = getMetadata(state.<selection>)`
    - Map `metadatas` to array of promises `dataPromises` for data fetches
    - When all data promises resolve, `Promise.all(dataPromises)`,
    update `state.data`, `state.fetchingData`, `state.dataError` as appropriate.
    
For examples, see the components `AnnualCycleGraph`, `LongTermAveragesGraph`

One additional note regarding the derivation of the graph spec from data and
metadata: A function, `this.graphSpec()` returns a graph spec reflecting the 
current state (and props). `graphSpec` in turn calls some suggestively 
(and overloaded )named functions such as `getMetadata`, which might lead one
to suspect it is hitting the backend whenever it is called. This is not the
case:

`graphSpec` (when it has data) calls 

- `this.getMetadatas`, which in turn calls `props.getMetadata`, 
which is a function that returns a filtered subset of the already-fetched 
metadata. 
  - The components which specialize ACG (by passing in `props.getMetadata`) 
  do not (or at least should not) hit the backend to obtain this metadata; 
  they already have it (passed in as a prop). 
  - Metdata is only obtained from the backend when the model, emissions, 
  or variable selection changes. This is the responsibility of the app 
  controllers, way up the component tree. Metadata passes as props from 
  there down the tree. 
- `props.dataToGraphSpec`, which mixes up a batch of special objects to 
please C3. This is based on 
  - results of `this.getMetadatas` above
  - `state.data` (which is gotten from the backend when and only when the 
  metadata, area, or current dataSpec changes). 
  No (extra) backend calls here either.

### Old graph component pattern

This pattern follows the lifecycle API and recommended usage introduced in
React 15. See remarks above about deprecation.

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
    
For examples, see the components `ContextGraph`, `TimeSeriesGraph`.

## Important notes

1. Component state should be limited to data 
(in old pattern, graph specification, which is derived from data) 
and (optionally) data (sub-)selection.

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