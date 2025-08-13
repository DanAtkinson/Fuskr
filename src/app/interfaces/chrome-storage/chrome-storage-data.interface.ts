import { IBehaviourSettings } from './behaviour-settings.interface';
import { IDisplaySettings } from './display-settings.interface';
import { ISafetySettings } from './safety-settings.interface';

export interface IChromeStorageData {
  behaviour: IBehaviourSettings;
  display: IDisplaySettings;
  safety: ISafetySettings;
  version: number;
}
