const main = {
	tandemNameInput: document.getElementById("tandemName"),
	newProjButton: document.getElementById("new-proj-button"),
	handicamButton: document.getElementById("insert-hc-button"),
	twixtorButton: document.getElementById("twixtor-button"),
	mewtButton: document.getElementById("mewt-button"),
	reframeButton: document.getElementById("reframe-button"),
	selectClipsButton: document.getElementById("select-button"),
	decrementSelectionButton: document.getElementById("decrement-button"),
	resetSelectionButton: document.getElementById("reset-button"),
	alignToSMEButton: document.getElementById("align-button"),
	effectsAndTransitionSMEButton: document.getElementById("fx-and-transitions-button"),
	fhdRenderProjectButton: document.getElementById("fhd-render-button"),
	smeRenderProjectButton: document.getElementById("sme-render-button"),
	allRenderProjectButton: document.getElementById("all-render-button"),
	singleScreenshotButton: document.getElementById("single-screenshot-button"),
	freefallScreenshotButton: document.getElementById("freefall-screenshot-button"),
	compactRenderButton: document.getElementById("compact-rendering-button"),
	fhdDuckButton: document.getElementById("fhd-duck-button"),
	smeDuckButton: document.getElementById("sme-duck-button"),
	nasCopyButon: document.getElementById("copy-photos-button"),
	selectNasButton: document.getElementById("nas-button"),
	changeMusicButton: document.getElementById("change-music-button"),
	canopyAudioYesButton: document.getElementById("undercanopyYes"),
	canopyAudioNoButton: document.getElementById("undercanopyNo"),
	oneFrameYesButton: document.getElementById("oneFrameYes"),
	oneFrameNoButton: document.getElementById("oneFrameNo"),
	proxyYesButton: document.getElementById("proxyYes"),
	proxyNoButton: document.getElementById("proxyNo"),
	autoDeleteMediaYesButton: document.getElementById("autoDeleteMediaYes"),
	autoDeleteMediaNoButton: document.getElementById("autoDeleteMediaNo"),
	openSettingsButton: document.getElementById("openSettings"),
	closeSettingsButton: document.getElementById("closeSettings"),
	panelContainer: document.getElementById('cep-ui'),
	loaderContainer: document.getElementById('loader'),
	homeTab: document.getElementById('homeTab'),
	homeTabButtons: document.getElementById('homeButtonHolder'),
	fhdTab: document.getElementById('fhdTab'),
	fhdTabButtons: document.getElementById('fhdButtonHolder'),
	smeTab: document.getElementById('smeTab'),
	smeTabButtons: document.getElementById('smeButtonHolder'),
	settingsTab: document.getElementById('settingsTab'),
	settingsTabButtons: document.getElementById('settingsButtonHolder'),
	settingsContainer: document.getElementById('settingsContainer'),
	menuContainer: document.getElementById('menuContainer'),
	boardCheck: document.getElementById('hasBoard'),
	boardLabel: document.getElementById('hasBoardLabel'),
	selectCounter: document.getElementById('select-counter'),
	scriptPath: "/jsx/ppro.jsx",

	//General function for running and communicating with jsx files
	runJsxFile(targetFunction, param1 = null, param2 = null, param3 = null) {
		let ppro = this;
		this.panelContainer.style.display = "none";
		this.loaderContainer.style.display = "block";

		return new Promise((resolve, reject) => {
			const csInterface = new CSInterface();
			const jsxPath = csInterface.getSystemPath(SystemPath.EXTENSION) + this.scriptPath;

			csInterface.evalScript(`$.evalFile("${jsxPath}"); ${targetFunction}("${param1}", "${param2}", ${param3})`, result => {
				ppro.panelContainer.style.display = "block";
				ppro.loaderContainer.style.display = "none";
				if (result !== undefined) {
					resolve(result);
				} else {
					reject("Error");
				}
			});
		});
	},

	handleJsxError(error) {
		const content = error;
		const title = "Error";
		const errorIcon = "true";
		this.showAlert(content, title, errorIcon);
	},

	createNewProject() {
		if (this.validateTandemName()) {
			const newTandemName = this.tandemNameInput.value;
			const hasBoard = this.boardCheck.checked;
			const date = new Date();
			const day = date.getDate();
			const month = date.toLocaleDateString('en-GB', { month: 'long' });
			const year = date.getFullYear();
			const currentDate = `${day} ${month} ${year}`;

			this.runJsxFile("createNewProject", newTandemName, currentDate, hasBoard);

			this.tandemNameInput.value = "";
			// this.boardCheck.checked = true;
		} else {
			const content = "Input must be: (1) More than three words, (2) No leading or trailing spaces, (3) No consecutive spaces.";
			const title = "Invalid Input";
			const errorIcon = "true";
			this.showAlert(content, title, errorIcon);
		}
	},

	insertHandicam() {
		this.runJsxFile("insertHandicam");
	},

	applyTwixtor() {
		this.runJsxFile("applyTwixtor");
	},

	addMEWT() {
		this.runJsxFile("addMEWT");
	},

	reframeToVertical() {
		this.runJsxFile("reframeToVertical");
	},

	clipSelect() {
		this.runJsxFile("clipSelect")
			.then(numClips => {
				this.selectCounter.innerHTML = numClips;
			})
			.catch(error => {
				this.handleJsxError(error)
			});
	},

	decrementSelection() {
		this.runJsxFile("decrementSelection")
			.then(numClips => {
				this.selectCounter.innerHTML = numClips;
			})
			.catch(error => {
				this.handleJsxError(error)
			});
	},

	resetSelection() {
		this.runJsxFile("resetSelection")
			.then(() => {
				this.selectCounter.innerHTML = '0';
			})
			.catch(error => {
				this.handleJsxError(error)
			});
	},

	alignClipsToSocialMediaEdit() {
		this.runJsxFile("alignClipsToSocialMediaEdit");
		this.selectCounter.innerHTML = '0';
	},

	applyEffectsAndTransitionsToSME() {
		this.runJsxFile("applyEffectsAndTransitionsToSME");
	},

	renderProject(option) {
		this.runJsxFile("renderProject", option);
		this.showTabButtons(this.homeTabButtons, this.homeTab);
	},

	autoDuckMusic() {
		this.runJsxFile("autoDuckMusic");
	},

	copyPhotosToNas() {
		this.runJsxFile("copyPhotosToNas");
	},

	selectNas() {
		this.runJsxFile("selectNas");
	},

	changeMusic() {
		this.runJsxFile("changeMusic");
	},

	setBoolSettings(setting, selection) {
		this.runJsxFile("setBoolSettings", setting, selection);
	},

	getBoolSettings(setting) {
		this.runJsxFile("getBoolSettings", setting)
		.then(result => {
			if (setting === "canopyAudio") {
				if (result === "true") {
					this.canopyAudioYesButton.checked = true;
				} else if (result === "false") {
					this.canopyAudioNoButton.checked = true;
				}
			} else if (setting === "oneFrame") {
				if (result === "true") {
					this.oneFrameYesButton.checked = true;
				} else if (result === "false") {
					this.oneFrameNoButton.checked = true;
				}
			} else if (setting === "proxy") {
				if (result === "true") {
					this.proxyYesButton.checked = true;
				} else if (result === "false") {
					this.proxyNoButton.checked = true;
				}
			} else if (setting === "autoDeleteMedia") {
				if (result === "true") {
					this.autoDeleteMediaYesButton.checked = true;
				} else if (result === "false") {
					this.autoDeleteMediaNoButton.checked = true;
				}
			}
		})
		.catch(error => {
			this.handleJsxError(error)
		});
	},

	setSettingsUI() {
		this.getBoolSettings("canopyAudio");
		this.getBoolSettings("oneFrame");
		this.getBoolSettings("proxy");
		this.getBoolSettings("autoDeleteMedia");
	},

	runSequenceChangeEvent() {
		this.runJsxFile("sequenceChangeListener");
	},

	/*Fetch sequence change event from ppro sequenceChangeListener().*/
	addSequenceChangeListener() {
		const csInterface = new CSInterface();
		csInterface.addEventListener("com.adobe.csxs.events.SequenceChangeEvent", function (event) {
			main.autoSwitchTabs(event.data);
		});
	},

	autoSwitchTabs(sequenceName) {
		if (sequenceName.indexOf("- FullHD") !== -1) {
			this.showTabButtons(this.fhdTabButtons, this.fhdTab);
		} else if (sequenceName.indexOf("- SocialMediaEdit") !== -1) {
			this.showTabButtons(this.smeTabButtons, this.smeTab);
		} else {
			this.showTabButtons(this.homeTabButtons, this.homeTab);
		}
	},

	//Validate user input for the tandem name to avoid errors
	//****Must have more than three words
	//****Cannot start or ends with a space
	//****Cannot contain consecutive spaces
	validateTandemName() {
		const numOfWords = this.tandemNameInput.value.split(" ");
		const startsWithSpace = this.tandemNameInput.value.startsWith(" ");
		const endsWithSpace = this.tandemNameInput.value.endsWith(" ");
		const hasTwoConsecutiveSpaces = this.tandemNameInput.value.includes("  ");

		return (
			this.tandemNameInput.value &&
			numOfWords.length > 2 &&
			!startsWithSpace &&
			!endsWithSpace &&
			!hasTwoConsecutiveSpaces
		);
	},

	showAlert(content, title, errorIcon) {
		const csInterface = new CSInterface();
		var alertMessage = `alert("${content}", "${title}", ${errorIcon});`;
		csInterface.evalScript(alertMessage);
	},

	showCursor(state) {
		//Param state is either true or false.
		const csInterface = new CSInterface();
		csInterface.evalScript(`app.showCursor(${state});`);
	},

	/*Function that handles the click event listener which also sets the button
	 to be disabled for a while after the event*/
	handleButtonClick(button, actionFunction) {
		button.addEventListener("click", () => {
			button.disabled = true;
			actionFunction();
			setTimeout(() => {
				button.disabled = false;
			}, 500);
		});
	},

	/*Function that handles the dynamic display of the tab buttons*/
	showTabButtons(buttons, tab) {
		this.homeTabButtons.classList.replace("d-flex", "d-none");
		this.fhdTabButtons.classList.replace("d-flex", "d-none");
		this.smeTabButtons.classList.replace("d-flex", "d-none");
		this.settingsTabButtons.classList.replace("d-flex", "d-none");
		buttons.classList.replace("d-none", "d-flex");
		tab.focus();

		if (buttons === this.settingsTabButtons) {
			this.closeSettingsContainer();
		}
	},

	openSettingsContainer() {
		this.settingsContainer.classList.replace("d-none", "d-flex");
		this.menuContainer.classList.replace("d-flex", "d-none");
	},

	closeSettingsContainer() {
		this.menuContainer.classList.replace("d-none", "d-flex");
		this.settingsContainer.classList.replace("d-flex", "d-none");
	},


	/*Changes the inner text of the switch label */
	boardSwitch(checkbox, label) {
		if (checkbox.checked) {
			label.innerHTML = "Has Manifest Board";
		} else {
			label.innerHTML = "No Manifest Board";
		}
	},

	init() {
		//Initiate event listeners for button clicks
		this.handleButtonClick(this.newProjButton, () => this.createNewProject())
		this.handleButtonClick(this.handicamButton, () => this.insertHandicam())
		this.handleButtonClick(this.twixtorButton, () => this.applyTwixtor())
		this.handleButtonClick(this.mewtButton, () => this.addMEWT());
		this.handleButtonClick(this.reframeButton, () => this.reframeToVertical())
		this.handleButtonClick(this.selectClipsButton, () => this.clipSelect())
		this.handleButtonClick(this.decrementSelectionButton, () => this.decrementSelection());
		this.handleButtonClick(this.resetSelectionButton, () => this.resetSelection());
		this.handleButtonClick(this.alignToSMEButton, () => this.alignClipsToSocialMediaEdit());
		this.handleButtonClick(this.effectsAndTransitionSMEButton, () => this.applyEffectsAndTransitionsToSME());
		this.handleButtonClick(this.fhdDuckButton, () => this.autoDuckMusic());
		this.handleButtonClick(this.smeDuckButton, () => this.autoDuckMusic());
		this.handleButtonClick(this.nasCopyButon, () => this.copyPhotosToNas());
		this.handleButtonClick(this.selectNasButton, () => this.selectNas());
		this.handleButtonClick(this.changeMusicButton, () => this.changeMusic());
		this.handleButtonClick(this.fhdRenderProjectButton, () => this.renderProject("fhd"));
		this.handleButtonClick(this.smeRenderProjectButton, () => this.renderProject("sme"));
		this.handleButtonClick(this.allRenderProjectButton, () => this.renderProject("all"));
		this.handleButtonClick(this.singleScreenshotButton, () => this.renderProject("image"));
		this.handleButtonClick(this.freefallScreenshotButton, () => this.renderProject("freefall"));
		this.handleButtonClick(this.compactRenderButton, () => this.renderProject("report"));
		
		this.canopyAudioYesButton.addEventListener("click", () => this.setBoolSettings("canopyAudio", true));
		this.canopyAudioNoButton.addEventListener("click", () => this.setBoolSettings("canopyAudio", false));
		this.oneFrameYesButton.addEventListener("click", () => this.setBoolSettings("oneFrame", true));
		this.oneFrameNoButton.addEventListener("click", () => this.setBoolSettings("oneFrame", false));
		this.proxyYesButton.addEventListener("click", () => this.setBoolSettings("proxy", true));
		this.proxyNoButton.addEventListener("click", () => this.setBoolSettings("proxy", false));
		this.autoDeleteMediaYesButton.addEventListener("click", () => this.setBoolSettings("autoDeleteMedia", true));
		this.autoDeleteMediaNoButton.addEventListener("click", () => this.setBoolSettings("autoDeleteMedia", false));

		//Handles misc UI event listeners
		this.homeTab.addEventListener("click", () => this.showTabButtons(this.homeTabButtons, this.homeTab));
		this.fhdTab.addEventListener("click", () => this.showTabButtons(this.fhdTabButtons, this.fhdTab));
		this.smeTab.addEventListener("click", () => this.showTabButtons(this.smeTabButtons, this.smeTab));
		this.settingsTab.addEventListener("click", () => this.showTabButtons(this.settingsTabButtons, this.settingsTab));
		this.boardCheck.addEventListener("change", () => this.boardSwitch(this.boardCheck, this.boardLabel));
		this.openSettingsButton.addEventListener("click", () => this.openSettingsContainer());
		this.closeSettingsButton.addEventListener("click", () => this.closeSettingsContainer());
		this.runSequenceChangeEvent();
		this.addSequenceChangeListener();
		this.setSettingsUI();

		//Handles enter key press while writing tandem name
		this.tandemNameInput.addEventListener("keydown", (event) => {
			if (event.keyCode === 13 || event.key === 'Enter') {
				event.preventDefault();
				this.createNewProject();
			}
		});

		document.addEventListener("contextmenu", function (event) {
			event.preventDefault();
		});
	}
}

//Load the SD Extension Preset folder to My Documents upon opening the extension
function loadTemplateFiles() {
	const csInterface = new CSInterface();
	const jsxPath = csInterface.getSystemPath(SystemPath.EXTENSION) + "/jsx/filesLoader.jsx";

	csInterface.evalScript(`$.evalFile("${jsxPath}"); ${"checkDestFolder()"}`, function (result) {
		if (result == 0) {
			csInterface.closeExtension();
		}
	});
};

//Run the files loader at script start
loadTemplateFiles();

//Initialize event listeners
main.init();