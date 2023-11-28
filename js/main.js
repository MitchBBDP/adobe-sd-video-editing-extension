const tandemName = document.getElementById("tandemName");
const newProjButton = document.getElementById("newProj");
const handicamButton = document.getElementById("insertHC");
const boardCheck = document.getElementById('hasBoard');
const scriptPath = "/jsx/tes.jsx";;
let targetFunction;

newProjButton.addEventListener("click", function () {
	//Sets the target function
	targetFunction = "createNewProject";

	//Creates a validation for the user input
	const numOfWords = tandemName.value.split(" ");
	const startsWithSpace = tandemName.value.startsWith(" ");
	const endsWithSpace = tandemName.value.endsWith(" ");
	const hasTwoConsecutiveSpaces = tandemName.value.includes("  ");

	if (tandemName.value && numOfWords.length > 2 && !startsWithSpace
		&& !endsWithSpace && !hasTwoConsecutiveSpaces) {
		
		//Get the tandem name and has board value
		const newTandemName = tandemName.value;
		const hasBoard = boardCheck.checked;

		//Get the current date
		const date = new Date();
		const day = date.getDate();
		const month = date.toLocaleDateString('en-GB', { month: 'long' });
		const year = date.getFullYear();
		const currentDate = `${day} ${month} ${year}`;

		runJsxFile(targetFunction, scriptPath, newTandemName, currentDate, hasBoard);

		//Resets the UI input
		tandemName.value = "";
		boardCheck.checked = true;

	}
})

function runJsxFile(targetFunction, scriptPath, param1, param2, param3) {
	const csInterface = new CSInterface();
	const jsxPath = csInterface.getSystemPath(SystemPath.EXTENSION) + scriptPath;
	console.log(param2);
	csInterface.evalScript(`$.evalFile("${jsxPath}"); ${targetFunction}("${param1}", "${param2}", ${param3})`, function (result) {
		console.log(result);
	});
}


handicamButton.addEventListener("click", function () {
	targetFunction = "importHandicam";
	// run the jsx file
	runJsxFile(targetFunction, scriptPath);
})

// Load the SD Extension Preset folder to My Documents
function runFilesLoader() {
	const csInterface = new CSInterface();
	const jsxPath = csInterface.getSystemPath(SystemPath.EXTENSION) + "/jsx/filesLoader.jsx";

	csInterface.evalScript(`$.evalFile("${jsxPath}"); ${"checkDestFolder()"}`, function (result) {
		if (result == 0) {
			csInterface.closeExtension();
		}
	});
}
runFilesLoader();