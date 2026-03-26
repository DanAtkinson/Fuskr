import { IBehaviourSettings } from './behaviour-settings.interface';
import { IDisplaySettings } from './display-settings.interface';
import { ILoggingSettings } from './logging-settings.interface';
import { ISafetySettings } from './safety-settings.interface';

export interface IChromeStorageData {
	behaviour: IBehaviourSettings;
	display: IDisplaySettings;
	logging: ILoggingSettings;
	safety: ISafetySettings;
	version: number;
}
