import { User, userMutation, userQuery, userSchema } from "./user";
import { gql } from "graphql-tag";

export const models = {
	User,
};

export const typeDefs = gql`
	scalar Date
	scalar JSON
	scalar Number

	type Query
	type Mutation

	input Sort {
		key: String
		type: Int
	}

	${userSchema}
`;

export const resolvers = {
	Query: {
		...userQuery,
	},
	Mutation: {
		...userMutation,
	},
};
