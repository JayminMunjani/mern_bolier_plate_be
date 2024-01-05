import { combineResolvers } from "graphql-resolvers";
import { isAuthenticated } from "../../authentication";

export const userQuery = {
	getUser: combineResolvers(isAuthenticated, (parent, { id }, { me }) => {}),
};

export const userMutation = {
	createUser: combineResolvers(isAuthenticated, (parent, { input }, { me, models }) => {
		// return new Promise((resolve, reject) => {});
	}),
};
