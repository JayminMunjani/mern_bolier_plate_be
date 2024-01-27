import { models } from "../schema";
import { ROLE_LIST } from "./utils/comman";

export const insertPredefineData = async () => {
	if (ROLE_LIST.length > 0) {
		let roles = await models.Role.find({ isDeleted: false });
		if (roles.length !== ROLE_LIST.length)
			ROLE_LIST.map(async (roleName) => {
				roles = await models.Role.findOne({
					roleName,
					isDeleted: false,
				});
				if (!roles) roles = models.Role.create({ roleName });
			});
	}
	setTimeout(async () => {
		const user = await models.User.findOne({ email: process.env.EMAIL });
		if (!user) {
			let role = await models.Role.findOne({ roleName: "superAdmin" });
			await models.User.create({
				firstName: "admin",
				lastName: "admin",
				userName: "admin",
				email: process.env.EMAIL,
				password: process.env.PASSWORD,
				roleId: role.id,
				isVerified: true,
				isApproved: true,
			});
		}
	}, 2000);
};
