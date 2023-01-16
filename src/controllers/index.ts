import TestController from './test.controller';
import {TestRepository} from "../repositories/test.repository";

// Instantiate Test Controller and return it
const testController = new TestController(new TestRepository());
export {
    testController
}