import gql from "graphql-tag"
import { Role, roleSchema } from "./role"
import { Service, serviceMutation, serviceQuery, serviceSchema } from "./service"
import { User, userSchema, userQuery, userMutation } from "./user"
import { Category, categorySchema, categoryQuery, categoryMutation } from "./category"
import { Portfolio, portfolioSchema, portfolioQuery, portfolioMutation } from "./portfolio"
import { Review, reviewSchema, reviewQuery, reviewMutation } from "./review"
import { FAQ, faqSchema, faqQuery, faqMutation } from "./faq"



export const models = {
    User,
    Role,
    Service,
    Category,
    Portfolio,
    Review,
    FAQ
}

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
     ${serviceSchema}
     ${categorySchema}
     ${portfolioSchema}
     ${reviewSchema}
     ${faqSchema}
`


export const resolvers = {
    Query: {
        ...userQuery,
        ...serviceQuery,
        ...categoryQuery,
        ...portfolioQuery,
        ...reviewQuery,
        ...faqQuery
    },
    Mutation: {
        ...userMutation,
        ...serviceMutation,
        ...categoryMutation,
        ...portfolioMutation,
        ...reviewMutation,
        ...faqMutation
    }
}