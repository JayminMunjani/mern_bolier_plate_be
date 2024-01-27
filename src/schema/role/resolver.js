// PAKCAGES
import { combineResolvers } from "graphql-resolvers"
import { GraphQLError } from 'graphql';

// FILES
import { isAuthentication, isAdmin } from "../../authentication";

export const roleQuery = {

  // getAllUser with paginate by admin
  getAllRoleWithPaginate: combineResolvers(isAdmin, (parent, args, { models, me }) => {
    return new Promise(async (resolve, reject) => {
      const filter = JSON.parse(args?.filter);
      const sort = { [args?.sort?.key]: args?.sort?.type };
      const option = {
        page: args?.page,
        limit: args?.limit,
        sort,
        populate: [],
      };
      models.Role.paginate({ ...filter, ...filterText }, option, (err, results) => {
        if (err) reject(err);
        resolve({ count: results?.total || 0, data: results?.docs || [] });
      });
    });
  }),
  getAllRole: (parent, args, { models, me }) => {
    return new Promise(async (resolve, reject) => {
      models.Role.find({ isDeleted: false }, (err, results) => {
        if (err) reject(err);
        else resolve(res);
      });
    });
  },
};

export const roleMutation = {

};


