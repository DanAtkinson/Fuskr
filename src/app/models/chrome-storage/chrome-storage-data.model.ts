import { IChromeStorageData } from '@interfaces/chrome-storage/chrome-storage-data.interface';
import { BehaviourSettings } from './behaviour-settings.model';
import { DisplaySettings } from './display-settings.model';
import { SafetySettings } from './safety-settings.model';

export class ChromeStorageData implements IChromeStorageData {
	// Public properties (alphabetically)
	behaviour: BehaviourSettings;
	display: DisplaySettings;
	safety: SafetySettings;
	version = 1;

	constructor(data?: Partial<IChromeStorageData>) {
		this.display = new DisplaySettings(data?.display);
		this.behaviour = new BehaviourSettings(data?.behaviour);
		this.safety = new SafetySettings(data?.safety);

		if (data?.version !== undefined) {
			this.version = data.version;
		}
	}
}
