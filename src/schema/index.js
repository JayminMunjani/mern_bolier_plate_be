import { User, userMutation, userQuery, userSchema } from "./user";
import { Role, roleSchema } from "./role";
import { gql } from "graphql-tag";

export const models = {
	User,
	Role,
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
	${roleSchema}
`;

export const resolvers = {
	Query: {
		...userQuery,
	},
	Mutation: {
		...userMutation,
	},
};
