import React from 'react';
import { BrowserRouter, Switch } from 'react-router-dom';

import ScrollToTop from 'utils/ScrollToTop'

import Routes from 'Routes';

import {
  FalcorProvider,
  falcorGraph,
  DefaultLayout,
  Messages
} from "@availabs/avl-components"

class App extends React.Component {
  render() {
    return (
      <FalcorProvider falcor={falcorGraph('https://graph.availabs.org')} >
       <BrowserRouter>
          <ScrollToTop />
          <Switch>
            { Routes.map((route, i) =>
                <DefaultLayout key={ i } { ...route } { ...this.props }
                  menus={ Routes.filter(r => r.mainNav) }/>
              )
            }
          </Switch>
          <Messages />
        </BrowserRouter>
      </FalcorProvider>
    
    );
  }
}
export default App
