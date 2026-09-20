import { describe, expect, it } from 'vite-plus/test';
import { splitDurationText } from './split-duration-text';

describe('splitDurationText', () => {
	it('separates compact duration numbers from their units', () => {
		expect(splitDurationText('in 1h 2m 59s')).toEqual([
			{ key: 'text-0', type: 'text', value: 'in ' },
			{ key: 'h-0', type: 'number', unit: 'h', value: '1' },
			{ key: 'text-5', type: 'text', value: ' ' },
			{ key: 'm-0', type: 'number', unit: 'm', value: '2' },
			{ key: 'text-8', type: 'text', value: ' ' },
			{ key: 's-0', type: 'number', unit: 's', value: '59' },
		]);
	});

	it('keeps number keys stable when larger units disappear', () => {
		const numberKeys = (text: string) =>
			splitDurationText(text)
				.filter((part) => part.type === 'number')
				.map((part) => part.key);

		expect(numberKeys('1m 0s')).toEqual(['m-0', 's-0']);
		expect(numberKeys('59s')).toEqual(['s-0']);
	});
});
