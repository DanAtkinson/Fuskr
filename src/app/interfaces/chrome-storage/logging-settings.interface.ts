import { LogLevel } from '@services/logger.service';

export interface ILoggingSettings {
	enabled: boolean;
	logLevel: LogLevel;
}
