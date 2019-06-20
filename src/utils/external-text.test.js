import React from 'react';
import renderer from 'react-test-renderer';
// import each from 'jest-each';

import ExternalText, { evaluateAsTemplateLiteral } from './external-text';

describe('evaluateAsTemplateLiteral', () => {
  it('works without interpolation', () => {
    expect(evaluateAsTemplateLiteral('Hello')).toBe('Hello');
  });

  it('works with simple interpolation', () => {
    expect(evaluateAsTemplateLiteral('Hello, ${name}', { name: 'world' })).toBe(
      'Hello, world'
    );
  });

  it('works with context paths', () => {
    expect(
      evaluateAsTemplateLiteral(
        '${greeting}, ${name}. ${values.x} + ${values.y} = ${ values.x + values.y }',
        {
          greeting: 'Bonjour',
          name: 'world',
          values: { x: 5, y: 3 }
        }
      )
    ).toBe('Bonjour, world. 5 + 3 = 8');
  });

  it('works with recursive content', () => {
    expect(
      evaluateAsTemplateLiteral('${greeting}', {
        greeting: 'Hello, ${name}',
        name: '${who}',
        who: 'world',
      })
    ).toBe('Hello, world');
  });
});

class C {
  constructor(value, loadValue) {
    this.value = value;
    loadValue(this.setValue);
  }

  setValue = v => {
    this.value = v;
  };
}

class AsyncLoader {
  // Simulate an asynchronous loader, like an HTTP request or filesystem read.
  // Basically, register a callback and call it back under program control.

  // Register the callback.
  loadValue = callback => {
    this.callback = callback;
  };

  // Call the callback.
  resolve(value) {
    this.callback(value);
  }
}

describe('async loading test helper', () => {
  it('works in the sync case', () => {
    const c = new C(0, set => set(1));
    expect(c.value).toBe(1);
  });

  it('works in the (simulated) async case', () => {
    const asyncLoader = new AsyncLoader(1);
    const c = new C(0, asyncLoader.loadValue);
    expect(c.value).toBe(0);
    asyncLoader.resolve(1);
    expect(c.value).toBe(1);
  });
});

describe('ExternalText', () => {
  const texts = {
    greeting: 'Hello, ${name}',
    heading1: '# Heading 1',
    heading2: '## Heading 2',
    heading3: '### Heading 3',
    composite: `
# Impressive Title

An introductory remark.

## First subtopic

First content.

## Second subtopic

Second content.
    `,
    internalRef: '${$$.greeting}, how are you?'
  };

  const externalText = (item, context = undefined) => (
    <ExternalText.Provider texts={texts}>
      <ExternalText item={item} context={context}/>
    </ExternalText.Provider>
  );

  const externalTextTree = (item, context = undefined) =>
    renderer.create(externalText(item, context)).toJSON();

  it('renders the key when no such item exists', () => {
    const tree = externalTextTree('foo');
    expect(tree).toMatchInlineSnapshot(`
<p>
  {{foo}}
</p>
`);
  });

  it('handles a simple case', () => {
    const tree = externalTextTree('greeting', { name: 'world' });
    expect(tree).toMatchInlineSnapshot(`
<p>
  Hello, world
</p>
`);
  });

  it.each([[1], [2], [3]])('handles heading level %d', level => {
    const tree = externalTextTree(`heading${level}`);
    expect(tree.type).toBe(`h${level}`);
    expect(tree.children).toEqual([`Heading ${level}`]);
  });

  it('handles a composite MD case', () => {
    const tree = externalTextTree('composite');
    expect(tree).toMatchInlineSnapshot(`
Array [
  <h1>
    Impressive Title
  </h1>,
  <p>
    An introductory remark.
  </p>,
  <h2>
    First subtopic
  </h2>,
  <p>
    First content.
  </p>,
  <h2>
    Second subtopic
  </h2>,
  <p>
    Second content.
    
  </p>,
]
`);
  });

  it('allows reference to the text base via $$', () => {
    const tree = externalTextTree('internalRef', { name: 'world' });
    expect(tree).toMatchInlineSnapshot(`
<p>
  Hello, world, how are you?
</p>
`);
  });

  it('re-renders when texts are changed', () => {
    const context = { name: 'world' };

    const asyncLoader = new AsyncLoader();

    const component = renderer.create(
      <ExternalText.Provider
        texts={{ greeting: 'Hello, ${name}' }}
        loadTexts={asyncLoader.loadValue}
      >
        <ExternalText item={'greeting'} context={context}/>
      </ExternalText.Provider>
    );
    const tree1 = component.toJSON();
    expect(tree1).toMatchInlineSnapshot(`
<p>
  Hello, world
</p>
`);

    asyncLoader.resolve({ greeting: 'Bonjour, ${name}' });

    const tree2 = component.toJSON();
    expect(tree2).toMatchInlineSnapshot(`
<p>
  Bonjour, world
</p>
`);
  });
});
