import { PipelineController } from "./pipeline-controller";
import { RunController } from "./run-controller";

export class HTTPInterface {
    static initialize() {
        new PipelineController()
        new RunController()
    }
}
