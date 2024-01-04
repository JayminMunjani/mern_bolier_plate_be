import { combineResolvers } from "graphql-resolvers";

export const userQuery = {
	getUser: combineResolvers((parent, { id }, { me }) => {}),
};

export const userMutation = {
	createUser: combineResolvers((parent, { input }, { me, models }) => {
		// return new Promise((resolve, reject) => {});
	}),
};
