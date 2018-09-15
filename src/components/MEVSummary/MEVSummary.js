import React from 'react';


const SingleMEVSummary = ({ model_id, experiment, variable_id }) =>
(
  <span>
    {`${model_id} ${experiment} ${variable_id}`}
  </span>
);

const DualMEVSummary = ({ model_id, experiment, variable_id, comparand_id }) =>
(
  <span>
    {
      variable_id === comparand_id ?
        `${model_id} ${experiment}: ${variable_id} only` :
        `${model_id} ${experiment}: ${variable_id} vs ${comparand_id}`
    }
  </span>
);


export { SingleMEVSummary, DualMEVSummary };
