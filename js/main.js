const main = {
	tandemNameInput: document.getElementById("tandemName"),
	newProjButton: document.getElementById("newProj"),
	handicamButton: document.getElementById("insertHC"),
	boardCheck: document.getElementById('hasBoard'),
	scriptPath: "/jsx/tes.jsx",
	targetFunction: null,

	//General function for running and communicating with jsx files
	runJsxFile(targetFunction, param1 = null, param2 = null, param3 = null) {
		const csInterface = new CSInterface();
		const jsxPath = csInterface.getSystemPath(SystemPath.EXTENSION) + this.scriptPath;
		console.log(param2);
		csInterface.evalScript(`$.evalFile("${jsxPath}"); ${targetFunction}("${param1}", "${param2}", ${param3})`, function (result) {
			console.log(result);
		});
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

			this.resetUIInputs();
		}
	},

	insertHandicam() {
		this.runJsxFile("insertHandicam");
	},

	//Clears the input field and checkbox
	resetUIInputs() {
		this.tandemNameInput.value = "";
		this.boardCheck.checked = true;
	},

	//Validate user input for the tandem name to avoid errors
	//****Must have more than three words
	//****Cannot start or ends with a space
	//****Cannot contain consecutive spaces
	validateTandemName() {
		const { tandemNameInput, boardCheck } = this;
		const numOfWords = tandemNameInput.value.split(" ");
		const startsWithSpace = tandemNameInput.value.startsWith(" ");
		const endsWithSpace = tandemNameInput.value.endsWith(" ");
		const hasTwoConsecutiveSpaces = tandemNameInput.value.includes("  ");

		return (
			tandemNameInput.value &&
			numOfWords.length > 2 &&
			!startsWithSpace &&
			!endsWithSpace &&
			!hasTwoConsecutiveSpaces
		);
	},

	init() {
		this.newProjButton.addEventListener("click", () => {
			this.targetFunction = "createNewProject";
			this.createNewProject();
		});

		this.handicamButton.addEventListener("click", () => {
			this.targetFunction = "insertHandicam";
			this.insertHandicam();
		});
	}
}

// (IIFE) Load the SD Extension Preset folder to My Documents upon opening the extension
(function() {
	const csInterface = new CSInterface();
	const jsxPath = csInterface.getSystemPath(SystemPath.EXTENSION) + "/jsx/filesLoader.jsx";

	csInterface.evalScript(`$.evalFile("${jsxPath}"); ${"checkDestFolder()"}`, function (result) {
		if (result == 0) {
			csInterface.closeExtension();
		}
	});
})();

//Initialize event listeners
main.init();