import { v } from 'convex/values';
import { query } from './_generated/server';
import { createDashboardData, dashboardData } from './lib/dashboard';

export const get = query({
	args: {},
	returns: v.nullable(dashboardData),
	handler: async (ctx) => {
		const status = await ctx.db.query('eventStatuses').withIndex('by_dataAsOfTime').order('desc').first();
		return status ? createDashboardData(status) : null;
	},
});
