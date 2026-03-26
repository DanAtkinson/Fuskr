import { IChromeStorageData } from '@interfaces/chrome-storage/chrome-storage-data.interface';
import { BehaviourSettings } from './behaviour-settings.model';
import { DisplaySettings } from './display-settings.model';
import { LoggingSettings } from './logging-settings.model';
import { SafetySettings } from './safety-settings.model';

export class ChromeStorageData implements IChromeStorageData {
	// Public properties (alphabetically)
	behaviour: BehaviourSettings;
	display: DisplaySettings;
	logging: LoggingSettings;
	safety: SafetySettings;
	version = 1;

	constructor(data?: Partial<IChromeStorageData>) {
		this.display = new DisplaySettings(data?.display);
		this.behaviour = new BehaviourSettings(data?.behaviour);
		this.logging = new LoggingSettings(data?.logging);
		this.safety = new SafetySettings(data?.safety);

		if (data?.version !== undefined) {
			this.version = data.version;
		}
	}
}
