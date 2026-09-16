import { describe, expect, it } from 'vite-plus/test';
import { createDashboardData } from '../../convex/lib/dashboard';
import { extractEventStatus } from '../frc-nexus/extract-event-status';
import { nexusScenarios } from './nexus-fixtures';

function dashboardFromNexus(scenario: (typeof nexusScenarios)[keyof typeof nexusScenarios]) {
	const extracted = extractEventStatus(scenario.data, 'breakDurations' in scenario ? scenario.breakDurations : {});
	if (!extracted) throw new Error('Fixture did not produce an event status');
	return createDashboardData({ ...extracted, receivedAt: scenario.receivedAt });
}

describe('Nexus to dashboard fixture pipeline', () => {
	it('builds qualification display data from a raw Nexus response', () => {
		expect(dashboardFromNexus(nexusScenarios.qualification)).toMatchObject({
			competitionPhase: 'qualification',
			currentActivity: { type: 'match', displayLabel: 'Q10' },
			nextMatch: { displayLabel: 'Q12' },
			upcomingMatches: [{ alliance: 'red' }, { alliance: 'blue' }],
		});
	});

	it('builds alliance selection display data and partner numbers', () => {
		expect(dashboardFromNexus(nexusScenarios.allianceSelection)).toMatchObject({
			competitionPhase: 'allianceSelection',
			alliancePartners: [254, 1678, 9408],
		});
	});

	it('builds elimination paths and preserves break timing', () => {
		const dashboard = dashboardFromNexus(nexusScenarios.elimination);
		expect(dashboard).toMatchObject({
			competitionPhase: 'elimination',
			currentActivity: { type: 'match', displayLabel: 'M8' },
			nextMatch: { displayLabel: 'M9' },
		});
		expect(dashboard?.upcomingMatches[0]?.break).toMatchObject({
			label: 'Break',
			durationMinutes: 10,
		});
	});
});
