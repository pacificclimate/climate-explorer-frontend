import axios from 'axios';

export function getVariableOptions() {
  const url = `${process.env.PUBLIC_URL}/${process.env.REACT_APP_VARIABLE_OPTIONS}`;
  return axios.get(url, { responseType: 'text' })
  .catch(error => {
    throw new Error(
      `Could not load variable options from ${url}: 
        ${error.name}: ${error.message}`
    );
  });
}