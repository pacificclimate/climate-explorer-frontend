// Navigation and routing component for creating components with subnavigation.
//
// This component renders both navigation elements and Routes to items, based
// on the specification object in the prop `navSpec`. See `propTypes` for the
// required form of this object.
//
// The component can be made a controlled component via props `navIndex` and
// `onNavigate`, so that it retains memory of what subpage it was on when
// navigated to using `basePath` only. This makes it easily compatible with
// higher level navigation that does not know anything about its details, only
// its base path.
//
// Alternatively, if only `navIndex` is specified, it specifies the default
// subitem navigated to via `basePath`. If `navIndex` is undefined, it defaults
// to `0`.
//
// This component renders two things:
//
// 1. A Navbar containing a NavItems for each item specified in `navSpec`.
//
// 2. A set of Routes.
//    - A redirect Route for the base path to the item selected by `navIndex`.
//      This is how this component's subnav selection is controlled.
//    - A Route for each item specified in `navSpec`.

import PropTypes from 'prop-types';
import React from 'react';
import { Navbar, Nav, NavItem } from 'react-bootstrap';
import { Route, Redirect, Switch } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';

import LabelWithInfo from '../../guidance-tools/LabelWithInfo';

import styles from './NavRoutes.css';
import classnames from 'classnames';

export default function NavRoutes(
  {
    navSpec, navIndex, onNavigate, children,
    navClassName, pullUp,
  }
) {
  const withBasePath = subpath => `${navSpec.basePath}/${subpath}`;

  const navItems = navSpec.items.map((item, index) =>
    <LinkContainer
      key={index}
      to={withBasePath(item.navSubpath || item.subpath)}
    >
      <NavItem eventKey={index}>
        <LabelWithInfo label={item.label}>{item.info}</LabelWithInfo>
      </NavItem>
    </LinkContainer>
  );

  const routes = navSpec.items.map((item, index) =>
    <Route
      key={index}
      path={withBasePath(item.subpath)}
      component={item.component}
      render={item.render}
    />
  );

  const basePathRedirectTo =
    withBasePath(
      navSpec.items[navIndex].navSubpath ||
      navSpec.items[navIndex].subpath
    );

  return (
    <div>
      <Navbar
        fluid
        className={classnames(navClassName, { [styles.pullUp]: pullUp })}
      >
        { children }
        <Nav
          bsStyle='pills'
          pullRight
          onSelect={onNavigate}
        >
          { navItems }
        </Nav>
      </Navbar>

      <Switch>
        { routes }
        <Redirect to={basePathRedirectTo}/>
      </Switch>
    </div>
  );
}

NavRoutes.propTypes = {
  navSpec: PropTypes.shape({
    basePath: PropTypes.string, // base of all route paths in this page
    items: PropTypes.arrayOf(
      PropTypes.shape({
        // Navigation label for this item
        label: PropTypes.string,

        // Content for Information for this item (placed with nav label)
        info: PropTypes.node,

        // It's not clear the arrangement here with `subpath` and `navSubpath`
        // is a good idea. It's an attempt to exploit path params AND be able
        // to form a valid path for a nav link (which of course cannot contain
        // path params). But it doesn't really help us avoid repetition when
        // there is more than one matching path param.
        // TODO: Implement some fancy path param stuff to automatically generate
        // links from subpath.

        // Route subpath for this item.
        // This item CAN contain path params (e.g., /item/:itemId), which
        // are passed to the item rendered as part of the Route props
        subpath: PropTypes.string,

        // Navigation subpath for this item (if different from routeSubpath)
        // This item CANNOT contain path params (e.g., /item/:itemId);
        // it is used to form the nav link.
        navSubpath: PropTypes.string,

        // Component to render for this item.
        // (one of component or render must be specified)
        component: PropTypes.func,

        // Functional component to render for this item.
        // (one of component or render must be specified)
        render: PropTypes.func,
      }),
    ),
  }).isRequired,
  navIndex: PropTypes.number,
  onNavigate: PropTypes.func,
  pullUp: PropTypes.bool.isRequired,
  navClassName: PropTypes.string,
  children: PropTypes.any,
};

NavRoutes.defaultProps = {
  navIndex: 0,
  pullUp: false,
};
