import { TestBed } from '@angular/core/testing';
import { LoggerService, LogLevel } from './logger.service';

describe('LoggerService', () => {
  let service: LoggerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoggerService);

    // Clear any existing logs
    service.clearLogs();

    // Reset to default configuration
    service.configure({
      enabled: true,
      logLevel: LogLevel.DEBUG,
      maxLogs: 100,
    });
  });

  afterEach(() => {
    // Clean up after each test
    service.clearLogs();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('configuration', () => {
    it('should configure logging settings', () => {
      const config = {
        enabled: false,
        logLevel: LogLevel.WARN,
        maxLogs: 50,
      };

      service.configure(config);
      const retrievedConfig = service.getConfig();

      expect(retrievedConfig.enabled).toBe(false);
      expect(retrievedConfig.logLevel).toBe(LogLevel.WARN);
      expect(retrievedConfig.maxLogs).toBe(50);
    });

    it('should have default configuration', () => {
      const config = service.getConfig();

      expect(config.enabled).toBe(true);
      expect(config.logLevel).toBe(LogLevel.DEBUG);
      expect(config.maxLogs).toBe(100);
    });
  });

  describe('logging methods', () => {
    beforeEach(() => {
      spyOn(console, 'log');
      spyOn(console, 'info');
      spyOn(console, 'warn');
      spyOn(console, 'error');
    });

    it('should log debug messages', () => {
      service.debug('test.debug', 'Debug message', { data: 'test' });

      expect(console.log).toHaveBeenCalledWith(jasmine.stringContaining('DEBUG'), { data: 'test' });

      const logs = service.getLogs();
      expect(logs.length).toBeGreaterThan(0);
      const debugLog = logs.find((log) => log.component === 'test.debug');
      expect(debugLog).toBeDefined();
      expect(debugLog!.level).toBe(LogLevel.DEBUG);
      expect(debugLog!.message).toBe('Debug message');
    });

    it('should log info messages', () => {
      service.info('test.info', 'Info message');

      expect(console.info).toHaveBeenCalledWith(jasmine.stringContaining('INFO'), '');

      const logs = service.getLogs();
      const infoLog = logs.find((log) => log.component === 'test.info');
      expect(infoLog).toBeDefined();
      expect(infoLog!.level).toBe(LogLevel.INFO);
    });

    it('should log warn messages', () => {
      service.warn('test.warn', 'Warning message');

      expect(console.warn).toHaveBeenCalledWith(jasmine.stringContaining('WARN'), '');

      const logs = service.getLogs();
      const warnLog = logs.find((log) => log.component === 'test.warn');
      expect(warnLog).toBeDefined();
      expect(warnLog!.level).toBe(LogLevel.WARN);
    });

    it('should log error messages', () => {
      const error = new Error('Test error');
      service.error('test.error', 'Error message', error);

      expect(console.error).toHaveBeenCalledWith(jasmine.stringContaining('ERROR'), error);

      const logs = service.getLogs();
      const errorLog = logs.find((log) => log.component === 'test.error');
      expect(errorLog).toBeDefined();
      expect(errorLog!.level).toBe(LogLevel.ERROR);
    });
  });

  describe('log level filtering', () => {
    beforeEach(() => {
      spyOn(console, 'log');
      spyOn(console, 'info');
      spyOn(console, 'warn');
      spyOn(console, 'error');

      // Clear existing logs and start fresh
      service.clearLogs();
    });

    it('should filter logs based on configured level', () => {
      // Set log level to WARN - should only log WARN and ERROR
      service.configure({ enabled: true, logLevel: LogLevel.WARN, maxLogs: 100 });

      service.debug('test', 'Debug message');
      service.info('test', 'Info message');
      service.warn('test', 'Warning message');
      service.error('test', 'Error message');

      expect(console.log).not.toHaveBeenCalled();
      expect(console.info).toHaveBeenCalledTimes(1); // Only the configure log
      expect(console.warn).toHaveBeenCalledTimes(1); // The warning
      expect(console.error).toHaveBeenCalledTimes(1); // The error

      const logs = service.getLogs();
      const testLogs = logs.filter((log) => log.component === 'test');
      expect(testLogs).toHaveSize(2); // warn + error
      expect(testLogs[0].level).toBe(LogLevel.WARN);
      expect(testLogs[1].level).toBe(LogLevel.ERROR);
    });

    it('should not log when disabled', () => {
      service.configure({ enabled: false, logLevel: LogLevel.DEBUG, maxLogs: 100 });

      // Reset console spies to ignore the configure call
      (console.log as jasmine.Spy).calls.reset();
      (console.info as jasmine.Spy).calls.reset();
      (console.warn as jasmine.Spy).calls.reset();
      (console.error as jasmine.Spy).calls.reset();

      service.debug('test', 'Debug message');
      service.info('test', 'Info message');
      service.warn('test', 'Warning message');
      service.error('test', 'Error message');

      expect(console.log).not.toHaveBeenCalled();
      expect(console.info).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();

      const logs = service.getLogs();
      const testLogs = logs.filter((log) => log.component === 'test');
      expect(testLogs).toHaveSize(0);
    });
  });

  describe('log storage and management', () => {
    it('should store logs with timestamps', () => {
      service.clearLogs();
      const beforeTime = new Date();
      service.info('test', 'Test message');
      const afterTime = new Date();

      const logs = service.getLogs();
      const testLog = logs.find((log) => log.component === 'test');
      expect(testLog).toBeDefined();

      const logTime = testLog!.timestamp;
      expect(logTime.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(logTime.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });

    it('should limit log storage to maxLogs', () => {
      service.configure({ enabled: true, logLevel: LogLevel.DEBUG, maxLogs: 3 });

      // Add more logs than the limit
      service.info('test', 'Message 1');
      service.info('test', 'Message 2');
      service.info('test', 'Message 3');
      service.info('test', 'Message 4');
      service.info('test', 'Message 5');

      const logs = service.getLogs();
      expect(logs).toHaveSize(3);

      // Should keep the most recent logs
      expect(logs[0].message).toBe('Message 3');
      expect(logs[1].message).toBe('Message 4');
      expect(logs[2].message).toBe('Message 5');
    });

    it('should clear all logs', () => {
      service.info('test', 'Message 1');
      service.info('test', 'Message 2');

      expect(service.getLogs().length).toBeGreaterThan(0);

      service.clearLogs();

      // After clearing, only the clearLogs info message should remain
      const logs = service.getLogs();
      expect(logs).toHaveSize(1);
      expect(logs[0].message).toContain('Cleared');
    });
  });

  describe('log export', () => {
    beforeEach(() => {
      // Mock the browser's download functionality
      Object.defineProperty(window, 'URL', {
        value: {
          createObjectURL: jasmine.createSpy('createObjectURL').and.returnValue('blob:mock-url'),
          revokeObjectURL: jasmine.createSpy('revokeObjectURL'),
        },
      });

      // Mock document.createElement for download link
      const mockLink = {
        href: '',
        download: '',
        click: jasmine.createSpy('click'),
      };
      spyOn(document, 'createElement').and.returnValue(mockLink as any);
      spyOn(document.body, 'appendChild');
      spyOn(document.body, 'removeChild');
    });

    it('should export logs as text file', () => {
      service.info('test.export', 'Export test message', { data: 'test' });
      service.warn('test.export', 'Export warning');

      service.exportLogs();

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(window.URL.createObjectURL).toHaveBeenCalledWith(jasmine.any(Blob));

      // Verify the download was triggered
      const mockLink = (document.createElement as jasmine.Spy).calls.mostRecent().returnValue;
      expect(mockLink.download).toBe('fuskr-debug-logs.txt');
      expect(mockLink.click).toHaveBeenCalled();
    });

    it('should handle export when no logs exist', () => {
      service.clearLogs();

      service.exportLogs();

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(window.URL.createObjectURL).toHaveBeenCalled();
    });

    it('should use custom filename when provided', () => {
      service.exportLogs('custom-logs.txt');

      const mockLink = (document.createElement as jasmine.Spy).calls.mostRecent().returnValue;
      expect(mockLink.download).toBe('custom-logs.txt');
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle undefined/null data gracefully', () => {
      spyOn(console, 'info');

      service.info('test', 'Message with null data', null);
      service.info('test', 'Message with undefined data', undefined);

      expect(console.info).toHaveBeenCalledTimes(2);

      const logs = service.getLogs();
      expect(logs.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle complex objects in data', () => {
      const complexObject = {
        nested: {
          array: [1, 2, 3],
          object: { key: 'value' },
          date: new Date(),
        },
      };

      service.debug('test', 'Complex object test', complexObject);

      const logs = service.getLogs();
      expect(logs.length).toBeGreaterThan(0);
    });

    it('should handle very long messages', () => {
      const longMessage = 'A'.repeat(10000);

      service.info('test', longMessage);

      const logs = service.getLogs();
      const ourLog = logs.find((log) => log.message === longMessage);
      expect(ourLog).toBeDefined();
    });
  });

  describe('log filtering by level', () => {
    beforeEach(() => {
      service.debug('test', 'Debug message');
      service.info('test', 'Info message');
      service.warn('test', 'Warn message');
      service.error('test', 'Error message');
    });

    it('should filter logs by minimum level', () => {
      const warnAndAbove = service.getLogs(LogLevel.WARN);
      const errorMessages = warnAndAbove.filter(
        (log) => log.message === 'Warn message' || log.message === 'Error message'
      );
      expect(errorMessages).toHaveSize(2);
    });

    it('should return all logs when no filter specified', () => {
      const allLogs = service.getLogs();
      expect(allLogs.length).toBeGreaterThanOrEqual(4);
    });
  });
});
