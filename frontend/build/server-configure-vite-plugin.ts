/* eslint-disable @typescript-eslint/no-unused-vars */
import { PluginOption } from 'vite';

export const serverConfigureVitePlugin = (): PluginOption => {
  return {
    name: 'vite:server-configure',
    enforce: 'pre',
    configResolved(resolvedConfig) {},
    config(conf) {},
    configureServer(server) {
      // решает проблему, связанную с auth.localhost и редиректами
      server.middlewares.stack.splice(0, 1);
    },
    async closeBundle() {},
  };
};
