import {start} from "worktop/cfw";
import { API } from "./routes"
import { scheduled } from "./scheduled"

export default {...start(API.run), scheduled};
