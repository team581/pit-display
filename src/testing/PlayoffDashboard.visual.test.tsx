import { setupVisualTests, testDashboardScenarios } from './visual-test-utils';

setupVisualTests();

testDashboardScenarios([
	'alliance-selection-waiting',
	'alliance-selection-assigned',
	'elimination-pending',
	'elimination-scheduled-break',
	'elimination-paths',
	'elimination-eliminated-path',
	'awards-break',
]);
