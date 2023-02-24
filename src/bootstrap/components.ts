import { Alert, Dropdown, Tooltip } from 'bootstrap';

const bootstrapUsedComponents = [
	Alert, Dropdown, Tooltip,
];

export function initBootstrapUsedComponents() {
	bootstrapUsedComponents.forEach(c => c.VERSION);
}
