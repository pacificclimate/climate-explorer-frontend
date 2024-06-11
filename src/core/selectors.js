// Functions used by selectors. Mostly common to several.
//
// Note: In this module, we follow a pure functional programming style wherever
// possible. In particular, this means (wherever possible):
//
//    - No side effects (pure functions)
//
//    - Iteratee-first, data-last methods
//      (see https://github.com/lodash/lodash/wiki/FP-Guide)
//
//    - Most methods are partially or fully curried.

import compact from "lodash/fp/compact";
import find from "lodash/fp/find";
import flatMap from "lodash/fp/flatMap";
import flow from "lodash/fp/flow";
import get from "lodash/fp/get";
import flatten from "lodash/fp/flatten";
import map from "lodash/fp/map";
import reduce from "lodash/fp/reduce";
import assign from "lodash/fp/assign";
import _ from "lodash";
import filter from "lodash/fp/filter";
import sortBy from "lodash/fp/sortBy";

// Default-value replacers for selectors for model, emissions scenario,
// and variable.

// Warning: This will fail, with an infinite update loop, if there is no
// enabled option.
const fallback = (options) => find((opt) => !opt.isDisabled)(options);

export const findModelNamed = (model_id) => (options) =>
  find({ value: { representative: { model_id } } })(options) ||
  fallback(options);

export const findScenarioIncluding = (scenarios) => (options) =>
  scenarios
    .map((s) =>
      find(
        (opt) =>
          opt.value.representative.experiment.includes(s) && !opt.isDisabled,
      )(options),
    )
    .find((e) => typeof e != "undefined") || fallback(options);

export const findVariableMatching = (match) => (options) => {
  const flattenOptions = flatMap("options");
  return (
    flow(flattenOptions, find(match))(options) ||
    fallback(flattenOptions(options))
  );
};

export const findStartEndDates = (start_date, end_date) => (options) =>
  find({ value: { representative: { start_date, end_date } } })(options) ||
  fallback(options);

// Extract a value from the representative for a named option in source.
export const representativeValue = (optionName, valueName) =>
  get(compact([optionName, "value", "representative", valueName]));

// Returns an object containing the union of all representatives of the
// options named in the arguments (e.g., 'model', 'scenario').
// Returned object is suitable as a constraint for a
// `SimpleConstraintGroupingSelector`.
export const constraintsFor =
  (...optionNames) =>
  (options) =>
    flow(
      flatten,
      map((name) => options[name]),
      map((option) => option && option.value && option.value.representative),
      reduce((result, value) => assign(result, value), {}),
    )(optionNames);

// Return a filtered subset of metadata, based on the selected options
// (typically one or more of model, emissions scenario, variable).
//
// Initially, options (derived from selectors) can be undefined,
// and go through a cascading defaulting process that eventually settles
// with a defined value for all of them. Returning a metadata set that is
// filtered by a partially settled selector set causes problems in client
// components. This function returns the empty array unless a full set of
// constraints (derived from selectors) is available.
export const filterMetaBy =
  (...optionNames) =>
  (options) =>
  (meta) => {
    const settled = _.allDefined(options, ...optionNames);
    if (!settled) {
      return [];
    }
    return flow(
      filter(constraintsFor(...optionNames)(options)),
      sortBy("unique_id"),
    )(meta);
  };
