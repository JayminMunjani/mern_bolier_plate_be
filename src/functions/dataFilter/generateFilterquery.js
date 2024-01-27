import _ from "lodash";

const Tables = {
	userTable: ["firstName", "lastName", "email"],
	serviceTable: ["serviceName"],
	categoryTable: ["catagoryName"],
	portfolioTable:["name","description"],
	ReviewTable:["body"]
};

export const FilterQuery = (filterString, tableKey) => {
	if (filterString && filterString?.length > 0) {
		const keys = Tables[tableKey];
		const syntax = [];
		keys.forEach((ele) => {
			syntax.push({ [ele]: { $regex: filterString, $options: "i" } });
		});
		return { $and: [{ isDeleted: false }, { $or: syntax }] };
	} else {
		return { isDeleted: false };
	}
};
