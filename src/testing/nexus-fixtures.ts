import type { EventStatus } from '../frc-nexus/generated/types.gen';
import { SCENARIO_NOW, minutesFromNow } from './dashboard-scenarios';
import { nexusApiMatch as nexusMatch } from './nexus-match';

export type NexusScenario = {
	breakDurations?: Readonly<Record<string, number>>;
	data: EventStatus;
	receivedAt: number;
};

export const nexusScenarios = {
	qualification: {
		receivedAt: SCENARIO_NOW,
		data: {
			eventKey: '2026test',
			dataAsOfTime: SCENARIO_NOW - 1000,
			matches: [
				nexusMatch('Qualification 10', {
					status: 'On field',
					times: {
						actualOnFieldTime: minutesFromNow(-2),
						estimatedStartTime: minutesFromNow(-1),
						actualStartTime: minutesFromNow(-1),
					},
				}),
				nexusMatch('Qualification 12', {
					redTeams: ['581', '254', '1678'],
					times: {
						estimatedQueueTime: minutesFromNow(5),
						estimatedOnDeckTime: minutesFromNow(10),
						estimatedStartTime: minutesFromNow(15),
					},
				}),
				nexusMatch('Qualification 18', {
					blueTeams: ['581', '604', '9408'],
					times: { estimatedStartTime: minutesFromNow(70) },
				}),
			],
		},
	},
	allianceSelection: {
		receivedAt: SCENARIO_NOW,
		data: {
			eventKey: '2026test',
			dataAsOfTime: SCENARIO_NOW - 1000,
			matches: [
				nexusMatch('Qualification 70', { status: 'On field', redTeams: ['581', '2', '3'] }),
				nexusMatch('Playoff 1', { redTeams: ['581', '254', '1678', '9408'] }),
				nexusMatch('Playoff 2', { redTeams: null, blueTeams: null }),
			],
		},
	},
	elimination: {
		receivedAt: SCENARIO_NOW,
		breakDurations: { 'Playoff 8': 10 },
		data: {
			eventKey: '2026test',
			dataAsOfTime: SCENARIO_NOW - 1000,
			matches: [
				nexusMatch('Qualification 70', { status: 'On field' }),
				nexusMatch('Playoff 7', {
					status: 'On field',
					redTeams: ['581', '254', '1678', '9408'],
					times: { actualOnFieldTime: minutesFromNow(-3) },
				}),
				nexusMatch('Playoff 8', { status: 'On field', breakAfter: 'Break' }),
				nexusMatch('Playoff 9', {
					blueTeams: ['581', '254', '1678', '9408'],
					times: { estimatedStartTime: minutesFromNow(18) },
				}),
				nexusMatch('Playoff 11', { times: { estimatedStartTime: minutesFromNow(28) } }),
			],
		},
	},
} as const satisfies Record<string, NexusScenario>;
