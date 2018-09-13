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
import { Route, Redirect } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';

import LabelWithInfo from '../../guidance-tools/LabelWithInfo';

import './NavRoutes.css';


export default function NavRoutes({ navSpec, navIndex, onNavigate, children }) {
  const withBasePath = subpath => `${navSpec.basePath}/${subpath}`;

  const navItems = navSpec.items.map((item, index) =>
    <LinkContainer key={index} to={withBasePath(item.subpath)}>
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
    withBasePath(navSpec.items[navIndex].subpath);

  return (
    <div>
      <Navbar fluid>
        { children }
        <Nav
          bsStyle='pills'
          pullRight
          onSelect={onNavigate}
        >
          { navItems }
        </Nav>
      </Navbar>
      <Route
        exact path={navSpec.basePath}
        render={() => <Redirect to={basePathRedirectTo}/>}
      />
      { routes }
    </div>
  );
}

NavRoutes.propTypes = {
  navSpec: PropTypes.shape({
    basePath: PropTypes.string, // base of all route paths in this page
    items: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,  // label for navigation for this item
        info: PropTypes.node, // content for Information for this item (placed with label)
        subpath: PropTypes.string,  // route subpath for this item
        component: PropTypes.func, // component to render for this item
        render: PropTypes.func,  // functional component to render for this item
      }),
    ),
  }).isRequired,
  navIndex: PropTypes.number,
  onNavigate: PropTypes.func,
  children: PropTypes.any,
};

NavRoutes.defaultProps = {
  navIndex: 0,
};
