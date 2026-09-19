import { setupVisualTests, testDashboardScenarios } from './visual-test-utils';

setupVisualTests();

testDashboardScenarios([
	'loading',
	'no-event',
	'qualification-before-start',
	'qualification-normal',
	'qualification-urgent',
	'qualification-complete',
]);
