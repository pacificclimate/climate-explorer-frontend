// External text module.
//
// Purpose
//
// This module enables text content of an application to be externalized as
// what is known in some circles (e.g., Java, .Net) as a resource file.
// Instead of being literally included in the source of the application,
// text resources (from a one-word label to a phrase to an entire page of help)
// are referred to indirectly by an identifier (e.g., 'app.name'), and
// rendered using the ExternalText component. What is rendered depends on the
// content of the resource file. This decouples maintenance of the text
// from maintenance of the app that uses it, and also simplifies reusing the
// same text in different places in an app.
//
// For convenience, the content of an item in the resource file can be
// (and by default is) interpreted as Markdown and rendered into HTML.
// For simpler cases it can also be interpreted and rendered as a simple string.
//
// Because texts in actual applications frequently include variable data from
// the app, external texts are treated as JavaScript template literals, and
// are evaluated in the context of an optional user-provided dictionary of
// data values. For example, an external text may be the string
// `'You have ${num} messages.'`. The app can provide a value for `num` which
// is interpolated into the rendered text.
//
// To further support modularization of texts, elements of the external text
// source itself can be referred to within an external text string, courtesy
// of the automatically provided context variable `$$`. For example, the text
// `'This application is called ${$$.app.name}'` includes content of the the
// item at path `'app.name'` in its rendering (e.g., the rendered text might
// be `'This application is called Climate Explorer'`). Such self-reference
// can be nested indefinitely deep.
//
// This module is not too far from an internationalization (i18n) package,
// but is considerably simpler and lighter-weight. It also provides
// Markdown interpretation (which admittedly could be wrapped around an i18n
// package).
//
// Usage
//
// 0. Prepare an external texts file. (This is usually done in parallel with
// application development.) This file can be in any format, but ultimately
// must be converted to JS object for consumption by `ExternalText`.
// 
// 1. Set up loading of the external texts file. A typical pattern is to code
// this file in YAML, place it in a static resources folder, and use a loader
// that requests the file over HTTP and converts the file contents from YAML
// to a JS object. `ExternalText` provides a convenience method
// `ExternalText.makeYamlLoader` that does just this.
//
// 2. Wrap the app (or other high-level component) in `ExternalText.Provider`.
// This provides the external text source to all `ExternalText` components
// through React's context API.
//
//   ```
//    import ExternalText from 'path/to/external-text';
//    ...
//    const loadTexts = 
//      ExternalText.makeYamlLoader('http://example.org/app/static/texts.yaml');
//    ...
//    <ExternalText.Provider loadTexts={loadTexts}>
//      <App />
//    </ExternalText.Provider>
//   ```
// 3. In `App` or any component rendered by it, use `ExternalText`.
// 
//   ```
//    import T from 'path/to/external-text';  //   Note abbreviation
//    ...
//    <div>
//      <T path='path.to.item'/>
//      <T path='path.to.another.item'/>
//    </div>
//   ```


import PropTypes from 'prop-types';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import _ from 'lodash';
// TODO: We should just be using lodash. RIP lodash.
import _get from 'lodash.get';
import axios from 'axios';
import yaml from 'js-yaml';

_.mixin(_get);

_.mixin({
  isPlainObject: value => {
    // Test whether `value` is a simple object, i.e., not also an array, fn, ...
    // A bit ragged on the edges, but it will do until we adopt lodash.
    return _.isObject(value) && !_.isArray(value) && !_.isFunction(value) &&
      !_.isNumber(value);
  },

  mapTraverse: (collection, iteratee) => {
    // Recursively traverse a collection and return a collection with the
    // same structure (array, object) as the collection, but with the leaf
    // (non-object) values replaced by applying function `iteratee` to them.
    // Unlike other _ map functions, `iteratee` is only passed the value
    // of the leaf, and not a key or index.
    const traverseValue = value => _.mapTraverse(value, iteratee);
    if (_.isArray(collection)) {
      return _.map(collection, traverseValue);
    }
    if (_.isPlainObject(collection)) {
      return _.mapValues(collection, traverseValue);
    }
    return iteratee(collection);
  }
});


export { _ };


export const ExternalTextContext = React.createContext(
  null
);


export class Provider extends React.Component {
  // Data provider for component `ExternalText`, which accesses this data
  // via the React context API.
  //
  // This component performs two tasks:
  // - loads the source data into this component's state
  // - wraps its children in a React context provider whose value is set
  //   from the source data

  static propTypes = {
    texts: PropTypes.object,
      // Default, non-asynchronous data source.

    loadTexts: PropTypes.func,
      // Callback for loading data asynchronously.
  };

  state = {
    texts: null,
  };

  setTexts = texts => {
    this.setState({ texts });
  };

  componentDidMount() {
    this.setTexts(this.props.texts);
    if (this.props.loadTexts) {
      this.props.loadTexts(this.setTexts);
    }
  }

  render() {
    return (
      <ExternalTextContext.Provider value={this.state.texts}>
        {this.props.children}
      </ExternalTextContext.Provider>
    );
  }
}


// Backticks must be escaped during processing, then unescaped when the
// final string is returned. This is because backtick (which incidentally
// is also important in Markdown) delimits template strings, and template
// strings are the core of the evaluator. Hence `escape` and `unescape`.
// Does not escape an already escaped backtick.

export const escape = s => (
  _.map(s, (c, i, t) => (c !== '`' || (i > 0 && t[i-1] === `\\`)) ? c : '\\`')
).join('');
// This negative lookbehind formulation is tighter, but it lookbehind isn't
// supported (yet) in many browsers. It does work in Node.js and Chrome.
// export const escape = s => s.replace(/(?<!\\)`/g, '\\`');

// And the inverse.
export const unescape = s => s.replace(/\\`/g, '`');


export function evaluateAsTemplateLiteral(s, context = {}) {
  // Convert string `s` to a template literal and evaluate it in a context
  // where all the properties of object `context` are available as identifiers
  // at the top level. (E.g., if `context = { 'a': 1, 'b': 2 }`, then
  // the template literal can refer to `context.a` and `context.b`
  // as `${a}` and `${b}`, respectively.)

  // `evaluator` constructs a function that evaluates a template string
  // constructed from the ordinary string passed in (by enclosing it in
  // backticks). The argument(s) of the returned evaluator are the context
  // values.
  const makeEvaluator = s =>
    new Function(...Object.keys(context), 'return `' + s + '`');

  // `reevaluate` recursively makes and invokes an evaluator for the string.
  // A different string, containing further interpolations (`${...}`), may
  // result from interpolation of other strings into the evaluated string.
  // `reevaluate` stops reevaluating when two successive evaluations return
  // the same string. It also applies backtick escaping at each new evaluation,
  // for the same reason.
  const reevaluate = (prev, curr) => {
    const e = escape(curr);
    return prev === e ?
      e :
      reevaluate(e, makeEvaluator(e)(...Object.values(context)))
  };

  // It's important that `Object.keys(x)` and `Object.values(x)` are guaranteed
  // to return their results in the same order for any given `x`. That order
  // is arbitrary, but it is shared between them.

  // Kick off the evaluation(s), and strip escaping after all is done.
  return unescape(reevaluate('', s));
}


export function get(texts, path, data = {}, as = 'string') {
  // This is the core of `ExternalText`.
  //
  // It gets the object selected by `path` from `texts` and maps
  // the function of (optionally) evaluation and rendering as Markdown
  // over all strings in the object's leaf (non-object) members.
  //
  // Argument `as` controls what function (identity, evaluation as a template
  // literal, or evaluation and rendering as Markdown) is applied to each
  // leaf member. The values 'raw', 'string', and 'markdown', respectively,
  // correspond to these mappings.
  //
  // Component `ExternalText` simply invokes this function on its context
  // and props. The simplest case is when `path` selects a single string
  // and it returns a single rendered React element.
  //
  // This function is exposed as a static so that more complicated use can
  // be made of it. This should be done only if there is no simpler way to
  // do it using <ExternalText/> elements. For example, if `'path.to.array'`
  // selects an array of items from `texts`, then prefer this
  //
  // ```
  //  <div>
  //    <ExternalText path='path.to.array' />
  //  </div>
  // ```
  //
  // over this equivalent but unnecessarily complicated code
  //
  // ```
  //  <div>
  //    { ExternalText.get(this.context, 'path.to.array') }
  //  </div>
  // ```

  const item = (texts && _.get(texts, path)) || `{{${path}}}`;

  const render = value => {
    if (!_.isString(value)) {
      return null;
    }
    if (as === 'raw') {
      return value;
    }
    const source = evaluateAsTemplateLiteral(value, { $$: texts, ...data });
    if (as === 'string') {
      return source;
    }
    return (<ReactMarkdown escapeHtml={false} source={source}/>);
  };

  return _.mapTraverse(item, render);
}


export default class ExternalText extends React.Component {
  // Core component of external texts module.
  //
  // This component renders an external text (source texts provided through
  // the React context API via `ExternalText.Provider`) selected by `path`,
  // using the data context `data` and rendered according to `as`.
  // See static function `get` for more details.
  //
  // Supporting components and functions are both exported by the module
  // and added as properties of `ExternalText`.

  static propTypes = {
    path: PropTypes.string,
      // Path (JS standard notation) selecting text item from source texts.
    data: PropTypes.object,
      // Data context in which to evaluate item's text.
    as: PropTypes.oneOf(['raw', 'string', 'markup']).isRequired,
      // What kind of content to render
  };

  static defaultProps = {
    as: 'markup',
  };

  render() {
    const texts = this.context;
    const { path, data, as } = this.props;
    return ExternalText.get(texts, path, data, as);
  }
}

export function makeYamlLoader(url) {
  // Convenience function for initializing an ExternalText Provider.
  // Returns a function that can be used as the callback argument `loadTexts`
  // to `ExternalTexts.Provider`. It issues an HTTP GET to `url`; treats
  // the result as a YAML file, converting it to a JS object; then calls its
  // argument `setTexts` with the resulting object. Any error thrown during
  // this process is logged to the console (and `setTexts` is not called).
  return function (setTexts) {
    console.log('YAML loader: loading...')
    axios.get(url, { responseType: 'text' })
    .then(response => response.data)
    .then(yaml.safeLoad)
    .then(data => {
      console.log('YAML loader: loaded', data);
      return data;
    })
    .then(setTexts)
    .catch(error => {
      console.error(error);
    })
    ;
  };
}


ExternalText.contextType = ExternalTextContext;
ExternalText.Provider = Provider;
ExternalText.get = get;
ExternalText.Markdown = ReactMarkdown;
ExternalText.makeYamlLoader = makeYamlLoader;
