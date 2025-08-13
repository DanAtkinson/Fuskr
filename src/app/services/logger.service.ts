import { Injectable } from '@angular/core';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  component: string;
  message: string;
  data?: any;
}

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  // Public methods (alphabetically)
  clearLogs(): void {
    const count = this.logs.length;
    this.logs = [];
    this.info('LoggerService', `Cleared ${count} log entries`);
  }

  configure(settings: { enabled?: boolean; logLevel?: LogLevel; maxLogs?: number }): void {
    if (settings.enabled !== undefined) {
      this.isEnabled = settings.enabled;
    }
    if (settings.logLevel !== undefined) {
      this.currentLogLevel = settings.logLevel;
    }
    if (settings.maxLogs !== undefined) {
      this.maxLogs = settings.maxLogs;
    }

    this.info('LoggerService', 'Logger configuration updated', settings);
  }

  debug(component: string, message: string, data?: any): void {
    this.log(LogLevel.DEBUG, component, message, data);
  }

  error(component: string, message: string, data?: any): void {
    this.log(LogLevel.ERROR, component, message, data);
  }

  exportLogs(filename: string = 'fuskr-debug-logs.txt'): void {
    const logs = this.getLogs();
    const logText = logs
      .map((log) => {
        const timestamp = log.timestamp.toISOString();
        const level = LogLevel[log.level];
        const dataStr = log.data ? ` | Data: ${JSON.stringify(log.data)}` : '';
        return `[${timestamp}] ${level} [${log.component}] ${log.message}${dataStr}`;
      })
      .join('\n');

    const metadata = [
      'Fuskr Debug Log Export',
      `Generated: ${new Date().toISOString()}`,
      `Total Entries: ${logs.length}`,
      `Browser: ${navigator.userAgent}`,
      `URL: ${window.location.href}`,
      '',
      '='.repeat(80),
      '',
    ].join('\n');

    const fullLog = metadata + logText;

    // Create and trigger download
    const blob = new Blob([fullLog], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.info('LoggerService', `Exported ${logs.length} log entries to ${filename}`);
  }

  getConfig(): { enabled: boolean; logLevel: LogLevel; maxLogs: number; logCount: number } {
    return {
      enabled: this.isEnabled,
      logLevel: this.currentLogLevel,
      maxLogs: this.maxLogs,
      logCount: this.logs.length,
    };
  }

  getLogs(minLevel: LogLevel = LogLevel.DEBUG): LogEntry[] {
    return this.logs.filter((log) => log.level >= minLevel);
  }

  info(component: string, message: string, data?: any): void {
    this.log(LogLevel.INFO, component, message, data);
  }

  warn(component: string, message: string, data?: any): void {
    this.log(LogLevel.WARN, component, message, data);
  }

  // Private properties (alphabetically)
  private currentLogLevel = LogLevel.DEBUG; // Can be configured in options
  private isEnabled = true; // Can be toggled in options
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Keep last 1000 logs

  // Private methods (alphabetically)
  private log(level: LogLevel, component: string, message: string, data?: any): void {
    if (!this.isEnabled || level < this.currentLogLevel) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      component,
      message,
      data,
    };

    // Add to memory store
    this.logs.push(entry);

    // Trim old logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Also log to console for immediate debugging
    const levelName = LogLevel[level];
    const timestamp = entry.timestamp.toISOString();
    const logMessage = `[${timestamp}] ${levelName} [${component}] ${message}`;

    switch (level) {
      case LogLevel.DEBUG:
        console.log(logMessage, data || '');
        break;
      case LogLevel.INFO:
        console.info(logMessage, data || '');
        break;
      case LogLevel.WARN:
        console.warn(logMessage, data || '');
        break;
      case LogLevel.ERROR:
        console.error(logMessage, data || '');
        break;
    }
  }
}
