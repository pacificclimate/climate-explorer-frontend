import PropTypes from 'prop-types';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import _ from 'underscore';
// TODO: We should just be using lodash. RIP underscore.
import get from 'underscore.get';
import axios from 'axios';
import yaml from 'js-yaml';

_.mixin(get);


export const ExternalTextContext = React.createContext(
  null
);


export class Provider extends React.Component {
  static propTypes = {
    texts: PropTypes.object,
    loadTexts: PropTypes.func,
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


export function evaluateAsTemplateLiteral(s, context = {}) {
  // Convert string `s` to a template literal and evaluate it in a context
  // where all the properties of object `context` are available as identifiers
  // at the top level. (E.g., if `context = { 'a': 1, 'b': 2 }`, then
  // the template literal can refer to `context.a` and `context.b`
  // as `${a}` and `${b}`, respectively.)
  const evaluator = t => new Function(...Object.keys(context), 'return `' + t + '`');
  const reevaluate = (prev, curr) =>
    prev === curr ? curr : reevaluate(curr, evaluator(curr)(...Object.values(context)))
  return reevaluate('', s);
}


class ExternalText extends React.Component {
  static propTypes = {
    item: PropTypes.string,
    evalContext: PropTypes.object,
      // Data context in which to evaluate item's text.
    as: PropTypes.oneOf(['raw', 'string', 'markup']).isRequired,
  };

  static defaultProps = {
    as: 'markup',
  };

  static Markdown = ReactMarkdown;

  static get(rootFrom, item, evalContext = {}, as = 'string') {

    function helper(from, item) {
      const result = (from && _.get(from, item)) || `{{${item}}}`;
      if (_.isString(result)) {
        if (as === 'raw') {
          return result;
        }
        const source = evaluateAsTemplateLiteral(result, { $$: rootFrom, ...evalContext });
        if (as === 'string') {
          return source;
        }
        return (<ReactMarkdown source={source}/>);
      }
      // TODO: Tighten this up. Don't re-get the item from result, already have it.
      if (_.isArray(result)) {
        return _.map(result, (value, index) => helper(result, index.toString()));
      }
      return _.mapObject(result, (value, key) => helper(result, key));
    }

    return helper(rootFrom, item);
  }

  render() {
    const texts = this.context;
    const { item, evalContext, as } = this.props;
    return ExternalText.get(texts, item, evalContext, as);
  }
}

ExternalText.contextType = ExternalTextContext;
ExternalText.Provider = Provider;


export function makeYamlLoader(url) {
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
ExternalText.makeYamlLoader = makeYamlLoader;


export default ExternalText;
