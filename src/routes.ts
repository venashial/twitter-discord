import { Router } from 'worktop';
import * as utils from 'worktop/utils';
import { reply } from 'worktop/response';

import * as Cache from 'worktop/cfw.cache';
import { write } from 'worktop/cfw.kv';
import type {Bindings, Webhook} from "./types";

// Create new Router instance
export const API = new Router<Bindings>();

API.prepare = Cache.sync();

API.add('POST', '/webhook', async (req, context) => {
    let input;

    try {
        input = await utils.body<{ url: any, twitter: string }>(req)
    } catch (err) {
        return reply(400, 'Error parsing request body');
    }

    if (!input || typeof input.url !== 'string' || typeof input.twitter !== 'string') {
        return reply(422, 'Missing required properties .url and .twitter');
    }

    const url = input.url.trim();

    const value: Webhook = {
        twitter: input.twitter.trim(),
        failedAttempts: 0,
    };

    const success = await write<null>(context.bindings.DATA, `webhooks::${url}`, null, { metadata: value});

    console.log({success, value})

    if (success) return reply(201, value);
    return reply(500, 'Error creating record');
});