export type DurationPart =
	| { key: string; type: 'number'; unit: 'h' | 'm' | 's'; value: string }
	| { key: string; type: 'text'; value: string };

const durationPattern = /(\d+)([hms])\b/gu;

export function splitDurationText(text: string): DurationPart[] {
	const parts: DurationPart[] = [];
	const unitCounts = { h: 0, m: 0, s: 0 };
	let previousIndex = 0;

	for (const match of text.matchAll(durationPattern)) {
		const index = match.index;
		if (index > previousIndex) {
			parts.push({ key: `text-${previousIndex}`, type: 'text', value: text.slice(previousIndex, index) });
		}

		const unit = match[2] as 'h' | 'm' | 's';
		parts.push({ key: `${unit}-${unitCounts[unit]++}`, type: 'number', unit, value: match[1] });
		previousIndex = index + match[0].length;
	}

	if (previousIndex < text.length) {
		parts.push({ key: `text-${previousIndex}`, type: 'text', value: text.slice(previousIndex) });
	}

	return parts;
}
