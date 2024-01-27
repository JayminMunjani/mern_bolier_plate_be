export const roleSchema =  `
	type Role {
		id: ID
		roleName: String
		createdBy: ID
		updatedBy: ID
		createdAt: Date
		updatedAt: Date
	}

	 input RoleInput {
	 	id: ID
	 	roleName: String
	 }

	 type RolePaginate {
	 	count: Int
	 	data: [Role]
	 }

	 extend type Query {
	 	getAllRoleWithPaginate(page: Int, limit: Int, sort: Sort, search: String): RolePaginate
		getallRole:[Role]
	 }

	 extend type Mutation {
	 	createRole(input: RoleInput): Role
	 	updateRole(input: RoleInput): Role
	 	deleteRole(id: ID): Boolean
	 }
`;
