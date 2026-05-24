import { PipelineController } from "./pipeline-controller";
import { RunController } from "./run-controller";

export class HTTPInterfaces {
    static initialize() {
        new PipelineController()
        new RunController()
    }
}
