import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface PasswordCodeBlockSettings {
	enablePasswordMasking: boolean;
	mySetting: string;
}

const DEFAULT_SETTINGS: PasswordCodeBlockSettings = {
	enablePasswordMasking: true,
	mySetting: 'default'
}

export default class PasswordCodeBlockPlugin extends Plugin {
	settings: PasswordCodeBlockSettings;

	async onload() {
		await this.loadSettings();

		this.registerMarkdownPostProcessor((element, context) => {
			if (!this.settings.enablePasswordMasking) {
				return; 
			}
			const codeBlocks = element.querySelectorAll('code.language-pw');
			codeBlocks.forEach((codeBlock) => {
				if (codeBlock.textContent && codeBlock.textContent.length > 0) {
					const trimmedText = codeBlock.textContent.trim();
					codeBlock.textContent = '*'.repeat(trimmedText.length);
				}
			});
		});

		this.addSettingTab(new PasswordCodeBlockSettingTab(this.app, this));
	}

	onunload() {
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	refreshActiveMarkdownView() {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (activeView) {
			activeView.previewMode.rerender(true);
		}
	}
}

class PasswordCodeBlockSettingTab extends PluginSettingTab {
	plugin: PasswordCodeBlockPlugin;

	constructor(app: App, plugin: PasswordCodeBlockPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();
		new Setting(containerEl)
			.setName('Enable Password Masking')
			.setDesc('Toggle to enable or disable password masking in code blocks.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enablePasswordMasking)
				.onChange(async (value) => {
					this.plugin.settings.enablePasswordMasking = value;
					await this.plugin.saveSettings();

					this.plugin.refreshActiveMarkdownView();
				}));
	}
}