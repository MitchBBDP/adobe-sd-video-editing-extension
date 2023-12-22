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
	imageRenderProjectButton: document.getElementById("export-frame-button"),
	fhdDuckButton: document.getElementById("fhd-duck-button"),
	smeDuckButton: document.getElementById("sme-duck-button"),
	homeTab: document.getElementById('homeTab'),
	homeTabButtons: document.getElementById('homeButtonHolder'),
	fhdTab: document.getElementById('fhdTab'),
	fhdTabButtons: document.getElementById('fhdButtonHolder'),
	smeTab: document.getElementById('smeTab'),
	smeTabButtons: document.getElementById('smeButtonHolder'),
	settingsTab: document.getElementById('settingsTab'),
	settingsTabButtons: document.getElementById('settingsButtonHolder'),
	boardCheck: document.getElementById('hasBoard'),
	boardLabel: document.getElementById('hasBoardLabel'),
	selectCounter: document.getElementById('select-counter'),
	scriptPath: "/jsx/ppro.jsx",

	//General function for running and communicating with jsx files
	runJsxFile(targetFunction, param1 = null, param2 = null, param3 = null) {
		return new Promise((resolve, reject) => {
			const csInterface = new CSInterface();
			const jsxPath = csInterface.getSystemPath(SystemPath.EXTENSION) + this.scriptPath;

			csInterface.evalScript(`$.evalFile("${jsxPath}"); ${targetFunction}("${param1}", "${param2}", ${param3})`, result => {
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
		const csInterface = new CSInterface();
		csInterface.evalScript(`app.showCursor(${state});`);
	},

	/*Function that handles the click event listener which also sets the button
	 to be disabled for a while after the event*/
	handleButtonClick(button, actionFunction) {
		button.addEventListener("click", () => {
			this.showCursor(false);
			button.disabled = true;
			actionFunction();

			setTimeout(() => {
				button.disabled = false;
			}, 500);

			this.showCursor(true);
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
		this.handleButtonClick(this.fhdRenderProjectButton, () => this.renderProject("fhd"));
		this.handleButtonClick(this.smeRenderProjectButton, () => this.renderProject("sme"));
		this.handleButtonClick(this.allRenderProjectButton, () => this.renderProject("all"));
		this.handleButtonClick(this.imageRenderProjectButton, () => this.renderProject("image"));

		//Handles enter key press while writing tandem name
		this.tandemNameInput.addEventListener("keydown", (event) => {
			if (event.keyCode === 13 || event.key === 'Enter') {
				event.preventDefault();
				this.createNewProject();
			}
		});

		//Handles misc UI event listeners
		this.homeTab.addEventListener("click", () => this.showTabButtons(this.homeTabButtons, this.homeTab));
		this.fhdTab.addEventListener("click", () => this.showTabButtons(this.fhdTabButtons, this.fhdTab));
		this.smeTab.addEventListener("click", () => this.showTabButtons(this.smeTabButtons, this.smeTab));
		this.settingsTab.addEventListener("click", () => this.showTabButtons(this.settingsTabButtons, this.settingsTab));
		this.boardCheck.addEventListener("change", () => this.boardSwitch(this.boardCheck, this.boardLabel));
		this.runSequenceChangeEvent();
		this.addSequenceChangeListener();

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