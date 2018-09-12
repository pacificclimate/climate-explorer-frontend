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

import './SubNav.css';

export default class SubNav extends React.Component {
  static propTypes = {
    navSpec: PropTypes.shape({
      basePath: PropTypes.string, // base of all route paths in this page
      items: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string,  // label for navigation for this item
          subpath: PropTypes.string,  // route subpath for this item
          component: PropTypes.element, // component to render for this item
          render: PropTypes.func,  // functional component to render for this item
        }),
      ),
    }).isRequired,
    navIndex: PropTypes.number,
    onNavigate: PropTypes.func,
    children: PropTypes.any,
  };

  static defaultProps = {
    navIndex: 0,
  };

  withBasePath = subpath => `${this.props.navSpec.basePath}/${subpath}`;

  render() {
    const navItems = this.props.navSpec.items.map((item, index) =>
      <LinkContainer key={index} to={this.withBasePath(item.subpath)}>
        <NavItem eventKey={index}>{item.label}</NavItem>
      </LinkContainer>
    );

    const routes = this.props.navSpec.items.map((item, index) =>
      <Route
        key={index}
        path={this.withBasePath(item.subpath)}
        component={item.component}
        render={item.render}
      />
    );

    const basePathRedirectTo = 
      this.withBasePath(this.props.navSpec.items[this.props.navIndex].subpath);
    
    return (
      <div>
        <Navbar fluid>
          { this.props.children }
          <Nav
            bsStyle='pills'
            pullRight
            onSelect={this.props.onNavigate}
          >
            { navItems }
          </Nav>
        </Navbar>
        <Route
          exact path={this.props.navSpec.basePath}
          render={() => <Redirect to={basePathRedirectTo}/>}
        />
        { routes }
      </div>
    );
  }
}
