import "dotenv/config";
import { ApolloServer } from "@apollo/server";
import express from "express";
import http from "http";
import cors from "cors";
import jwt from "jsonwebtoken";
import { models, typeDefs, resolvers } from "./schema/index";
import { json } from "body-parser";
import { expressMiddleware } from "@apollo/server/express4";
import { connectDB } from "./db/index";
import { makeExecutableSchema } from "@graphql-tools/schema";

const app = express();
const httpServer = http.createServer(app);

const startServer = async () => {
	const schema = makeExecutableSchema({ typeDefs, resolvers });
	const server = new ApolloServer({
		schema,
		introspection: true,
		playground: true,
		formatError: (error) => {
			const message = error.message.slice(error?.message?.lastIndexOf(":") + 1, error?.message?.length).trim();
			delete error?.extensions?.stacktrace;
			return { ...error, message };
		},
	});
	await server.start();
	app.use(
		"/graphql",
		cors(),
		json(),
		expressMiddleware(server, {
			context: async ({ req }) => {
				// const me = await getMe(req?.headers["x-token"]);
				return { models, secret: process.env.SECRET };
			},
		})
	);
	// app.use("/", express.static("/ASSETS"))
	app.use(express.json({ limit: "100mb" }));
	app.use(express.urlencoded({ extended: true, limit: "100mb" }));
	connectDB()
		.then(async (res) => {
			await new Promise((resolve) => {
				httpServer.listen({ port: process.env.PORT }, resolve);
			});
			console.log(`listening on http://localhost:${process.env.PORT}/graphql`);
		})
		.catch((error) => {
			console.error("Mognodb connection error !", error);
		});
};

startServer();
