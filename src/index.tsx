// SolidJS
import { attachDevtoolsOverlay } from '@solid-devtools/overlay';
import { Route, Router } from '@solidjs/router';
import { invoke } from '@tauri-apps/api/core';
import { type Component, DEV, Show, createResource, onMount } from 'solid-js';
import { render } from 'solid-js/web';
import { AppStateProvider, useAppState } from './AppState';
import { Application } from './Components/Application/Application';
import { Dev } from './Components/Dev/Dev';
import { Loading } from './Components/Loading/Loading';
import { WindowDecoration } from './Components/WindowDecoration/WindowDecoration';
import { StateSetter } from './StateSetter';
import { ContextMenuTest } from './Routes/Dev/ContextMenu/ContextMenuTest';
import { LoadingTest } from './Routes/Dev/LoadingTest/LoadingTest';
import { ComponentDocs } from './Routes/Dev/ComponentDocs/ComponentDocs';
import { Prev } from './Routes/Dev/Prev';
import { ErrorElement } from './Routes/Error/Error';
import { LoginPage } from './Routes/Login/Login';
import './style.css';

import { start } from './API/Style';
import { defaultSettings, loadFromFile } from './API/Settings';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { getCurrentWebview } from '@tauri-apps/api/webview';

export function App() {
  console.log('TAURI', window.__TAURI__);
  function changeZoom(e: KeyboardEvent) {
    const root = document.querySelector(':root') as HTMLDivElement;
    const fontSize = window
      .getComputedStyle(root, null)
      .getPropertyValue('font-size');
    if (e.ctrlKey && e.key === '=') {
      let newFontSize = Number.parseInt(fontSize) + 1;
      if (newFontSize > 20) {
        newFontSize = 20;
      }
      root.style.setProperty('font-size', `${newFontSize}px`);
    }
    if (e.ctrlKey && e.key === '-') {
      let newFontSize = Number.parseInt(fontSize) - 1;
      if (newFontSize < 8) {
        newFontSize = 8;
      }
      root.style.setProperty('font-size', `${newFontSize}px`);
    }
  }

  document.addEventListener('keydown', changeZoom);

  return (
    <AppStateProvider>
      <Show fallback={<h1>USE TAURI</h1>} when={!!window.__TAURI_INTERNALS__}>
        <WindowDecoration />

        <Router>
          <Dev />

          <Route path="/loadingtest" component={LoadingTest} />

          <Route path="/login" component={LoginPage} />

          <Route path="/dev">
            <Route path="/contextmenutest" component={ContextMenuTest} />

            <Route path="/loadingtest" component={LoadingTest} />
            <Route path="/componentdocs" component={ComponentDocs} />
          </Route>

          <Route path="/login" component={LoginPage} />

          <Route path="/app" component={Application} />
          <Route path="/" component={Prev} />

          <Route path="*" component={ErrorElement} />
        </Router>
      </Show>
    </AppStateProvider>
  );
}

attachDevtoolsOverlay();

render(() => <App />, document.getElementById('root'));
