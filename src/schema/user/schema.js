export const userSchema = `
type User {
    id:ID
	firstName: String
    email: String
    password: String
	roleId:ID
    code: String
	isDeleted: Boolean
  }
  
  type UserRes {
    id:ID
	firstName: String
    email: String
    password: String
	roleId: Role
    code: String
	isVerified: Boolean
	isDeleted: Boolean
  }


  input userInput{
	id:ID
	firstName: String
    email: String
    password: String
    code: String
  }

  type UserPaginate {
		count: Int
		data: [UserRes]
	}

	type Token {
		token: String
		user: UserRes
	}

	extend type Query {
		me: UserRes
		getAllUser(page: Int, limit: Int, sort: Sort, filter: String, search: String): UserPaginate
	}

	extend type Mutation {
		createUser(input: userInput): User
		signIn(email: String, password: String!): Token
		updateUser(input: userInput): User
		deleteUser(id: ID): Boolean
		forgotPassword(email: String!): Boolean
		resetPassword(id: ID, code: String, password: String): Boolean
		verifyEmail(id: ID!, code: String!): Boolean
		changePassword(oldPassword: String!, newPassword: String!): Boolean
		mutipleDocumentUpload(input: [String]): [String]
	}
`;
