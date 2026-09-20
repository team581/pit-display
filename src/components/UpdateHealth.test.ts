import { describe, expect, it } from 'vite-plus/test';
import { updateHealthState } from '../update-health';

const minute = 60_000;
const second = 1000;

describe('updateHealthState', () => {
	it('keeps a healthy connection quiet while showing the Nexus update age in minutes', () => {
		expect(updateHealthState(true, 0, 2 * minute + 14 * second)).toEqual({
			label: 'Nexus updated 2m ago',
			hasProblem: false,
		});
	});

	it('calls out outdated Nexus data and server disconnections', () => {
		expect(updateHealthState(true, 0, 10 * minute)).toEqual({
			label: 'Nexus updated 10m ago',
			hasProblem: false,
		});
		expect(updateHealthState(true, 0, 10 * minute + 1)).toEqual({
			label: 'Nexus outdated · updated 10m ago',
			hasProblem: true,
		});
		expect(updateHealthState(false, 0, 11 * minute)).toEqual({
			label: 'Server disconnected · Nexus outdated · updated 11m ago',
			hasProblem: true,
		});
		expect(updateHealthState(false, undefined, 0)).toEqual({
			label: 'Server disconnected · Nexus has not updated',
			hasProblem: true,
		});
	});
});
