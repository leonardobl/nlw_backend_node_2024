import fastify from "fastify";
import { prisma } from "./lib/primsa";
import { createTrip } from "./routes/trips/create";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";

const app = fastify();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(createTrip);

app.listen({ port: 3333 }).then(() => {
  console.log(`Server running on http://localhost:3333`);
});
