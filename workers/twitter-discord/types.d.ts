import {Context} from "worktop";
import {KV} from "worktop/cfw.kv";

interface Bindings extends Context {
    bindings: {
        DATA: KV.Namespace
        TWITTER_BEARER_TOKEN: string
    }
}

interface Webhook {
    twitterID: string
    twitterUsername: string
    failedAttempts: number
}
