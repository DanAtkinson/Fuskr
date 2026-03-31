import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ChromeService } from '@services/chrome.service';
import { LoggerService } from '@services/logger.service';
import { BaseComponent } from '@components/base.component';

@Component({
	selector: 'app-help',
	standalone: true,
	imports: [CommonModule],
	styleUrls: ['./help.component.scss'],
	templateUrl: './help.component.html',
})
export class HelpComponent extends BaseComponent implements OnInit {
	// Public properties (alphabetically)
	darkMode = signal(false);
	historyHtml = signal<SafeHtml>('');
	historyLoadError = signal(false);
	historyLoading = signal(true);
	version = signal('');

	// Injected services
	public router = inject(Router);
	protected override chromeService = inject(ChromeService);
	private logger = inject(LoggerService);
	private sanitizer = inject(DomSanitizer);

	constructor() {
		super();
	}

	// Public methods (alphabetically)
	async ngOnInit() {
		await this.loadSettings();
		this.loadVersion();
		await this.loadHistory();
	}

	navigateToGallery() {
		this.router.navigate(['/gallery']);
	}

	navigateToOptions() {
		this.router.navigate(['/options']);
	}

	toggleDarkMode() {
		this.darkMode.set(!this.darkMode());
		this.chromeService.updateDisplaySettings({ darkMode: this.darkMode() });
		this.applyTheme();
	}

	// Private methods (alphabetically)
	private applyTheme() {
		if (this.darkMode()) {
			document.body.classList.add('dark-mode');
		} else {
			document.body.classList.remove('dark-mode');
		}
	}

	/**
	 * Converts inline Markdown syntax to HTML.
	 * Handles bold (`**text**`), inline code (`\`code\``), and links (`[text](url)`).
	 */
	private inlineMarkdown(text: string): string {
		// Inline code — must come before bold to avoid double-processing backtick contents
		text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
		// Bold
		text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
		// Links
		text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
		return text;
	}

	private async loadHistory() {
		try {
			const url = this.chromeService.isExtensionContext() ? chrome.runtime.getURL('HISTORY.md') : 'HISTORY.md';

			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`Failed to load HISTORY.md: ${response.status}`);
			}

			const markdown = await response.text();
			const html = this.parseHistoryMarkdown(markdown);
			this.historyHtml.set(this.sanitizer.bypassSecurityTrustHtml(html));
		} catch (error) {
			this.logger.error('help.historyLoadFailed', 'Failed to load version history', error);
			this.historyLoadError.set(true);
		} finally {
			this.historyLoading.set(false);
		}
	}

	private loadVersion() {
		if (this.chromeService.isExtensionContext()) {
			const manifest = chrome.runtime.getManifest();
			this.version.set(manifest.version);
		}
	}

	private async loadSettings() {
		try {
			const settings = await this.chromeService.getStorageData();

			// Load existing logs BEFORE configuring — configure() internally logs
			// an INFO entry which would otherwise overwrite other contexts' logs.
			await this.logger.loadLogsFromStorage();
			this.logger.configure({
				enabled: settings.logging.enabled,
				logLevel: Number(settings.logging.logLevel),
			});

			this.darkMode.set(settings.display.darkMode);
			this.applyTheme();
		} catch (error) {
			this.logger.error('help.settingsLoadFailed', 'Failed to load settings', error);
		}
	}

	/**
	 * Parses the HISTORY.md format into HTML.
	 * Skips the H1/H2 preamble and processes from the first `###` version heading onwards.
	 * Handles: H3 (version), H4 (subsection), list items, horizontal rules, inline Markdown.
	 */
	private parseHistoryMarkdown(markdown: string): string {
		const lines = markdown.split('\n');
		const htmlParts: string[] = [];
		let inList = false;
		let foundFirstVersion = false;

		const closeList = () => {
			if (inList) {
				htmlParts.push('</ul>');
				inList = false;
			}
		};

		for (const line of lines) {
			const trimmed = line.trim();

			// Skip everything before the first version heading
			if (!foundFirstVersion) {
				if (trimmed.startsWith('### ')) {
					foundFirstVersion = true;
				} else {
					continue;
				}
			}

			if (trimmed.startsWith('### ')) {
				closeList();
				const content = this.inlineMarkdown(trimmed.slice(4));
				htmlParts.push(`<h3 class="history-version-heading">${content}</h3>`);
			} else if (trimmed.startsWith('#### ')) {
				closeList();
				const content = this.inlineMarkdown(trimmed.slice(5));
				htmlParts.push(`<h4 class="history-subsection-heading">${content}</h4>`);
			} else if (trimmed.startsWith('- ')) {
				if (!inList) {
					htmlParts.push('<ul class="history-list">');
					inList = true;
				}
				const content = this.inlineMarkdown(trimmed.slice(2));
				htmlParts.push(`<li>${content}</li>`);
			} else if (trimmed === '---') {
				closeList();
				htmlParts.push('<hr class="history-separator">');
			} else if (trimmed === '') {
				closeList();
			} else {
				closeList();
				htmlParts.push(`<p class="history-para">${this.inlineMarkdown(trimmed)}</p>`);
			}
		}

		closeList();
		return htmlParts.join('\n');
	}
}
