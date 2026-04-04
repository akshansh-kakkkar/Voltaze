import { env } from "@voltaze/env/server";
import cors from "cors";
import express from "express";
import eventRouter from "./modules/event/event.routes";
import orderRouter from "./modules/order/order.routes";
import passRouter from "./modules/pass/pass.routes";
import paymentRouter from "./modules/payment/payment.routes";
import ticketRouter from "./modules/ticket/ticket.routes";

const app = express();

app.use(
	cors({
		origin: env.CORS_ORIGIN,
		methods: ["GET", "POST", "OPTIONS"],
	}),
);

app.use(express.json());

app.use("/api", ticketRouter);
app.use("/api", eventRouter);
app.use("/api", passRouter);
app.use("/api", orderRouter);
app.use("/api", paymentRouter);

app.get("/", (_req, res) => {
	res.status(200).send("OK");
});

app.listen(3000, () => {
	console.log("Server is running on http://localhost:3000");
});
