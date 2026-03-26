import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChromeService } from '@services/chrome.service';
import { LoggerService } from '@services/logger.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
	standalone: true,
	imports: [RouterOutlet],
})
export class AppComponent implements OnInit {
	title = 'fuskr';

	private chromeService = inject(ChromeService);
	private logger = inject(LoggerService);

	/** Initialise the logger from persisted storage so logging works across
	 *  all extension page contexts (popup, options tab, etc.). */
	async ngOnInit() {
		try {
			const data = await this.chromeService.getStorageData();
			// Load existing logs BEFORE configuring — configure() internally logs
			// an INFO entry which would otherwise overwrite other contexts' logs.
			await this.logger.loadLogsFromStorage();
			this.logger.configure({
				enabled: data.logging.enabled,
				logLevel: Number(data.logging.logLevel),
			});
		} catch {
			// Non-fatal: logger stays at its default (disabled) state.
		}
	}
}
