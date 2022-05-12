import {Context} from "worktop";
import {KV} from "worktop/cfw.kv";

interface Bindings extends Context {
    bindings: {
        DATA: KV.Namespace
    }
}

interface Webhook {
    /* Twitter username */
    twitter: string,

    failedAttempts: number;
}
