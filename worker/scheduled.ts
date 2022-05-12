import type { CronHandler } from "worktop/cfw";
import {list} from "worktop/cfw.kv";
import type {Bindings, Webhook} from "./types";

export const scheduled: CronHandler = async function (event, bindings, context) {
}

export async function scan(bindings: any) {
    console.log('Starting scan...')
    const { keys } = await bindings.DATA.list()
    await Promise.allSettled(keys.map())
    console.log(list(bindings.DATA))
    console.log(list<Webhook>(bindings.DATA, { prefix: 'webhooks::' }))
}