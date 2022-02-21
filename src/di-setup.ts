import {
  createContainer,
  asValue,
  asClass,
  asFunction,
  InjectionMode,
  Lifetime,
} from "awilix";
import Payments from "./infra/database/models/payments";
import { connectDB } from "./infra/database/mongoose";
import PaymentController from "./interfaces/http/controllers/paymentController";
import Messenger from "./infra/messaging/messenger";
//import { Server } from "./interfaces/http/routes/index";

const container = createContainer({
  injectionMode: InjectionMode.PROXY,
});

container.register({
  paymentModel: asValue(Payments),
  paymentController: asClass(PaymentController),
  messenger: asClass(Messenger, { lifetime: Lifetime.SINGLETON }),
  // Infrastructure layer
  connectDB: asFunction(connectDB),
  //server: asClass(Server),
});

//load repositories
container.loadModules(
  [
    [
      "infra/repositories/*.ts",
      {
        lifetime: Lifetime.SCOPED,
        register: asClass,
      },
    ],
  ],
  {
    // we want `TodoRepository` to be registered as `todoRepository`.
    formatName: "camelCase",
    resolverOptions: {},
    cwd: __dirname,
  }
);

// load all usecases
container.loadModules(
  [
    [
      "usecases/*.ts",
      {
        lifetime: Lifetime.SCOPED,
        register: asClass,
      },
    ],
  ],
  {
    // we want `GetATodo` to be registered as `getATodo`.
    formatName: "camelCase",
    resolverOptions: {},
    cwd: __dirname,
  }
);

export default container;
