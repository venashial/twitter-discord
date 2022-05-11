import { Router } from 'worktop';
import { compose } from 'worktop';
import * as utils from 'worktop/utils';
import { reply } from 'worktop/response';
import * as Models from '../utils/models';
import * as Token from '../utils/token';

import type { Context, User } from '../context';

export const RouteInterface = new Router<Context>();

/**
 * POST /auth/login
 */
RouteInterface.add('GET', '/', async (req, context) => {

    return reply(200, html, { authorization });
});
