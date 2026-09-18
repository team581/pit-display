import { describe, expect, it } from 'vite-plus/test';
import { updateHealthState } from '../update-health';

const minute = 60_000;
const second = 1000;

describe('updateHealthState', () => {
	it('keeps a healthy connection quiet while showing the Nexus update age in minutes', () => {
		expect(updateHealthState(true, 0, 2 * minute + 14 * second)).toEqual({
			label: 'Nexus updated 2 min ago',
			hasProblem: false,
		});
	});

	it('calls out outdated Nexus data and server disconnections', () => {
		expect(updateHealthState(true, 0, 5 * minute)).toEqual({
			label: 'Nexus outdated · updated 5 min ago',
			hasProblem: true,
		});
		expect(updateHealthState(false, 0, 6 * minute)).toEqual({
			label: 'Server disconnected · Nexus outdated · updated 6 min ago',
			hasProblem: true,
		});
		expect(updateHealthState(false, undefined, 0)).toEqual({
			label: 'Server disconnected · Nexus has not updated',
			hasProblem: true,
		});
	});
});
