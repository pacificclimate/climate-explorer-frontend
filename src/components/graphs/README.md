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