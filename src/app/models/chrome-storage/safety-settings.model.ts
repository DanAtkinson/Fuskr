import { ISafetySettings } from '@interfaces/chrome-storage/safety-settings.interface';

export class SafetySettings implements ISafetySettings {
	// Public properties (alphabetically)
	enableOverloadProtection = true;
	overloadProtectionLimit = 250;

	constructor(data?: Partial<ISafetySettings>) {
		if (data) {
			Object.assign(this, data);
		}
	}
}
