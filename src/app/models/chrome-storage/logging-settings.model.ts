import { ILoggingSettings } from '@interfaces/chrome-storage/logging-settings.interface';

export class LoggingSettings implements ILoggingSettings {
	// Public properties (alphabetically)
	enabled = false;
	logLevel = 1; // LogLevel.INFO

	constructor(data?: Partial<ILoggingSettings>) {
		if (data?.enabled !== undefined) {
			this.enabled = data.enabled;
		}
		if (data?.logLevel !== undefined) {
			this.logLevel = data.logLevel;
		}
	}
}
