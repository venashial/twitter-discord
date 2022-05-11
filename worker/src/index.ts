import { Router } from 'worktop';
import { compose } from 'worktop';
import * as CORS from 'worktop/cors';

import { start } from 'worktop/cfw';
import * as Cache from 'worktop/cfw.cache';

import { RouteApi } from './routes/api';
import { RouteInterface } from './routes/interface';

import type { Context } from './context';
import {reply} from "worktop/response";

const Routes = new Router<Context>();

Routes.prepare = compose(
  Cache.sync(),
  CORS.preflight({
    maxage: 3600,
    credentials: true,
  })
);

Routes.add('GET', '/', (req, context) => {
    return reply(307, null, { 'Location': '/interface' });
})
Routes.mount('/api/', RouteApi);
Routes.mount('/todos/', RouteInterface);

// Initialize: Module Worker
export default start(Routes.run);
