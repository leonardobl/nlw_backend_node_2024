import nodemailer from "nodemailer";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../../lib/primsa";
import dayjs from "dayjs";
import { getMailClient } from "../../lib/mail";

export async function createTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/trips",
    {
      schema: {
        body: z.object({
          destination: z.string().min(4),
          starts_at: z.coerce.date(),
          ends_at: z.coerce.date(),
          owner_name: z.string(),
          owner_email: z.string().email(),
        }),
      },
    },
    async (req) => {
      const { destination, ends_at, starts_at, owner_email, owner_name } =
        req.body;

      if (dayjs(starts_at).isBefore(new Date())) {
        throw new Error("Invalid start date");
      }

      if (dayjs(ends_at).isBefore(starts_at)) {
        throw new Error("Invalid end date");
      }

      const trip = await prisma.trip.create({
        data: { destination, ends_at, starts_at },
      });

      const mail = await getMailClient();
      const msg = await mail.sendMail({
        from: {
          name: "Equipe plann.er",
          address: "testeDeEmail@teste.com",
        },
        to: {
          name: owner_name,
          address: owner_email,
        },
        subject: "Testando o envio do email",
        html: "<h1>Teste de envio de email</h1>",
      });

      console.log(nodemailer.getTestMessageUrl(msg));

      return { tripId: trip.id };
    }
  );
}
