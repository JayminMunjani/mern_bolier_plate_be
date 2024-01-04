export const userSchema = `
    type User {
        id: ID
        userName: String
        email: String
        password: String
        isVerified: Boolean
    }

    input UserInput {
        id: ID
        userName: String
        email: String
        password: String
        isVerified: Boolean        
    }

    extend type Mutation {
        createUser(input: UserInput): User
    }

    extend type Query {
        getUser(id: ID): User
    }
`;
