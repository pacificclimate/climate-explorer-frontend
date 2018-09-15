import React from 'react';

import styles from './AppHeadings.css';


const SingleAppHeading = ({ model_id, experiment, variable_id }) =>
(
  <span className={styles.app_heading}>
    {`${model_id} ${experiment} ${variable_id}`}
  </span>
);

const DualAppHeading = ({ model_id, experiment, variable_id, comparand_id }) =>
(
  <span className={styles.app_heading}>
    {
      variable_id === comparand_id ?
        `${model_id} ${experiment}: ${variable_id} only` :
        `${model_id} ${experiment}: ${variable_id} vs ${comparand_id}`
    }
  </span>
);


export { SingleAppHeading, DualAppHeading };
