// @ts-nocheck
import React from 'react';
import { ApplyPluginsType } from '/Users/evanlai/code/VR/babylon/myProject/node_modules/umi/node_modules/@umijs/runtime';
import * as umiExports from './umiExports';
import { plugin } from './plugin';

export function getRoutes() {
  const routes = [
  {
    "path": "/",
    "component": require('@/layouts').default,
    "routes": [
      {
        "path": "/",
        "redirect": "/home",
        "exact": true
      },
      {
        "path": "/home",
        "exact": true,
        "component": require('@/pages/index').default
      },
      {
        "path": "/room/:id",
        "exact": true,
        "component": require('@/pages/room/[id]').default
      }
    ]
  }
];

  // allow user to extend routes
  plugin.applyPlugins({
    key: 'patchRoutes',
    type: ApplyPluginsType.event,
    args: { routes },
  });

  return routes;
}
