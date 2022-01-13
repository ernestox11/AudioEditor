// SELECTORES
const record = document.querySelector(".button-record");
const stop = document.querySelector(".button-stop");
const soundClips = document.querySelector(".sound-clips");

const playFullClip = document.querySelector(".play-full-clip");
const playSelectedRegion = document.querySelector(".play-selected-region");
const playEditedPreview = document.querySelector(".play-edited-preview");
const tip = document.querySelector(".tip");

const cuttingModeLabel = document.querySelector(".cutting-modes-label");
const keepSelection = document.querySelector(".cutting-mode-keep");
const removeSelection = document.querySelector(".cutting-mode-remove");
//Botones de selección
const reverseRegions = document.querySelector(".reverse-regions");
const clearRegions = document.querySelector(".clear-regions");
const clearSelectedRegion = document.querySelector(".clear-selected-region");
//Botonos de Recortar/Salir
const cutAudio = document.querySelector(".cut-audio");
const cancelEditing = document.querySelector(".cancel-editing");

let slider = document.querySelector('[data-action="zoom"]');

// VARIABLES GLOBALES
var generatedClips = [];
let appStatus = "inactive";
let currentEditionClipID = null;
let editionMode = "remove-selection";

//Funciones para el control de Interfaz

function disableEditionControls() {
	cuttingModeLabel.style.color = "rgb(70, 70, 70)";
	keepSelection.disabled = true;
	removeSelection.disabled = true;
	reverseRegions.disabled = true;
	clearRegions.disabled = true;
	clearSelectedRegion.disabled = true;
	cutAudio.disabled = true;
	cancelEditing.disabled = true;
	slider.disabled = true;
	playFullClip.disabled = true;
	playSelectedRegion.disabled = true;
	playEditedPreview.disabled = true;
}

function enableEditionControls() {
	cuttingModeLabel.style.color = "";
	cuttingModeLabel.disabled = false;
	keepSelection.disabled = false;
	removeSelection.disabled = false;
	cancelEditing.disabled = false;
	playFullClip.disabled = false;
	slider.disabled = false;
}

function setTipOnNoRegions() {
	tip.textContent =
		"Puede arrastrar el cursor dentro de la onda para seleccionar una región";
}

function setTipOnRegionCreated() {
	tip.textContent =
		"Puede eliminar una región haciendo doble clic sobre la ella";
}

function clearTip() {
	tip.textContent = "";
}

function enableEditionOnCreation() {
	cutAudio.disabled = false;
	setTipOnRegionCreated();
	playEditedPreview.disabled = false;
	reverseRegions.disabled = false;
	clearRegions.disabled = false;
}

function disableEditionOnClear() {
	reverseRegions.disabled = true;
	clearRegions.disabled = true;
	cutAudio.disabled = true;
	setTipOnNoRegions();
	playEditedPreview.disabled = true;
}

function disableRecordingControls() {
	record.disabled = true;
	stop.disabled = true;
}

function enableRecordingControls() {
	record.disabled = false;
	stop.disabled = false;
}

function enterEditionMode() {
	disableRecordingControls();
	enableEditionControls();
	setTipOnNoRegions();
}

function exitEditionMode() {
	enableRecordingControls();
	disableEditionControls();
	clearTip();
}

function disableEditionModeToggle() {
	keepSelection.style.background = "";
	removeSelection.style.background = "";
}

function enableKeepMode() {
	keepSelection.style.background = "rgb(0, 92, 200)";
	removeSelection.style.background = "";
}

function enableRemoveMode() {
	keepSelection.style.background = "";
	removeSelection.style.background = "rgb(0, 92, 200)";
}

function setEditionMode(mode) {
	editionMode = mode;
	if (editionMode == "keep-selection") {
		enableKeepMode();
	} else if (editionMode == "remove-selection") {
		enableRemoveMode();
	}
}

//Estado Inicial de los elementos
disableEditionControls();

//FUNCIONES AUXILIARES

function generateSoundClipID() {
	return "sc" + Math.random().toString(36).slice(2);
}

function generateWaveContainerID(id) {
	return "#" + id;
}

function generateClipWave(waveContainerID) {
	let clipWave = WaveSurfer.create({
		container: waveContainerID,
		waveColor: "white",
		progressColor: "#1c67f1",
		cursorColor: "#1c67f1",
		cursorWidth: 2,
		barWidth: 2,
		barGap: 1,
		barHeight: 5,
		height: 60,
		hideScrollbar: true,
	});
	return clipWave;
}

function saveSoundClip(clipID, audioData, sourceType) {
	generatedClips.push({ id: clipID, data: audioData, sourceType: sourceType });
}

function loadWave(wave, source) {
	console.log("Source received: " + source);
	if (typeof source == "string") {
		console.log("Source is an URL");
		wave.load(source);
	} else {
		console.log("Source is an AudioBuffer");
		wave.loadDecodedBuffer(source.data);
	}
}

function deleteSoundClip(clipID) {
	let clipIndex = storedClips.findIndex(
		(storedClips) => storedClips.id === clipID
	);
	generatedClips.splice(clipIndex, 1);
}

function getSoundClip(clipID) {
	console.log(
		"getsoundclip: " +
			JSON.stringify(generatedClips.find((clip) => clip.id === clipID))
	);
	return generatedClips.find((clip) => clip.id === clipID);
}

function generateClip(clipID, waveContainerID, audioSource, defaultName) {
	const clipName = prompt("Ingrese nombre del Clip de Audio", defaultName);

	const clipContainer = document.createElement("article");
	const clipLabel = document.createElement("h2");
	const ButtonsContainer = document.createElement("div");
	const playButton = document.createElement("button");
	const editButton = document.createElement("button");
	const seekbarContainer = document.createElement("div");
	const deleteButton = document.createElement("button");

	clipContainer.classList.add("clip");
	ButtonsContainer.classList.add("buttons-container");
	seekbarContainer.classList.add("seekbar-container");
	seekbarContainer.id = clipID;
	playButton.textContent = "Reproducir";
	playButton.className = "play-button";
	editButton.textContent = "Editar";
	editButton.className = "edit-button";
	deleteButton.textContent = "Eliminar";
	deleteButton.className = "delete-button";

	if (clipName === null) {
		clipLabel.textContent = "Clip de Audio";
	} else {
		clipLabel.textContent = clipName;
	}

	clipContainer.appendChild(clipLabel);
	ButtonsContainer.appendChild(playButton);
	if (typeof audioSource == "string") {
		console.log("Creando boton editar!");
		ButtonsContainer.appendChild(editButton);
	}
	ButtonsContainer.appendChild(deleteButton);
	clipContainer.appendChild(seekbarContainer);
	clipContainer.appendChild(ButtonsContainer);
	soundClips.appendChild(clipContainer);

	var seekbar = generateClipWave(waveContainerID);
	loadWave(seekbar, audioSource);

	playButton.onclick = function () {
		seekbar.playPause();
	};

	/// EVENTOS EDICIÓN ///
	editButton.onclick = function () {
		enterEditionMode();
		setEditionMode(editionMode);
		editClip(clipID, audioSource);
		tip.textContent =
			"Puede arrastrar el cursor dentro de la onda para seleccionar una región";
	};

	deleteButton.onclick = function (e) {
		seekbar.destroy();
		let evtTgt = e.target;
		evtTgt.parentNode.parentNode.parentNode.removeChild(
			evtTgt.parentNode.parentNode
		);
	};

	clipLabel.onclick = function () {
		const existingName = clipLabel.textContent;
		const newClipName = prompt("Enter a new name for your sound clip?");
		if (newClipName === null) {
			clipLabel.textContent = existingName;
		} else {
			clipLabel.textContent = newClipName;
		}
	};
}

//FUNCIONES DE RECORTE Y EDICIÓN

var isNeg = function (number) {
	return number === 0 && 1 / number === -Infinity;
};

var nidx = function negIdx(idx, length) {
	return idx == null
		? 0
		: isNeg(idx)
		? length
		: idx <= -length
		? 0
		: idx < 0
		? length + (idx % length)
		: Math.min(length, idx);
};

function slice(originalSource, regionsIntervals) {
	const audioContext = new AudioContext();
	const fileReader = new FileReader();

	fileReader.onloadend = () => {
		let myArrayBuffer = fileReader.result;

		audioContext.decodeAudioData(myArrayBuffer, (buffer) => {
			console.log("Received intervals: " + regionsIntervals);
			console.log("buffer duration: " + buffer.duration);
			console.log("buffer length: " + buffer.length);
			console.log("buffer sample rate: " + buffer.sampleRate);

			const sampleRate = buffer.sampleRate;
			const numberChannels = buffer.numberOfChannels;
			let start;
			let end;
			var data = [0];
			var regionsData = [];
			console.log("Numbr of Channels: " + buffer.numberOfChannels);

			for (var channel = 0; channel < buffer.numberOfChannels; channel++) {
				var channelData = buffer.getChannelData(channel);

				for (let i = 0; i < regionsIntervals.length; i++) {
					start = regionsIntervals[i][0] * sampleRate;
					end = regionsIntervals[i][1] * sampleRate;
					bufferSlice = channelData.slice(start, end);
					console.log("Buffer slice: " + bufferSlice);
					regionsData.push(bufferSlice);
					console.log(regionsData[i]);
					for (let pos = 0; pos < regionsData[i].length; pos++) {
						data.push(regionsData[i][pos]);
					}
				}
			}

			const cutClipID = generateSoundClipID();
			const cutWaveContainerID = generateWaveContainerID(cutClipID);
			var cutWaveAudioBuffer = audioContext.createBuffer(
				numberChannels,
				data.length,
				sampleRate
			);

			console.log("Number of Channels: " + cutWaveAudioBuffer.numberOfChannels);
			if (data) {
				for (c = 0, l = 1; c < l; c++) {
					cutWaveAudioBuffer.getChannelData(c).set(data);
				}
			}

			sourceType = "audioBuffer";
			saveSoundClip(cutClipID, cutWaveAudioBuffer, sourceType);
			generateClip(
				cutClipID,
				cutWaveContainerID,
				getSoundClip(cutClipID),
				"Clip de Audio Editado"
			);
		});
	};
	console.log("orignal source: " + JSON.stringify(originalSource.data));
	fileReader.readAsArrayBuffer(originalSource.data);
}

record.onclick = function () {
	if (navigator.mediaDevices.getUserMedia) {
		console.log("getUserMedia soportado");

		const constraints = { audio: true };
		let chunks = [];

		let onSuccess = function (stream) {
			const mediaRecorder = new MediaRecorder(stream);
			//record.disabled = false;

			console.log("MediaRecorder creado con éxito");
			///////////////////////
			var micWave = WaveSurfer.create({
				container: "#micWaveform",
				waveColor: "white",
				barWidth: 2,
				barMinHeight: 1,
				barHeight: 3,
				barGap: 1,
				interact: false,
				cursorWidth: 0,
				plugins: [WaveSurfer.microphone.create()],
			});

			//Código
			mediaRecorder.start();
			appStatus = "recording";
			console.log(mediaRecorder.state);
			console.log("Grabación iniciada");

			stop.disabled = false;
			record.disabled = true;
			stop.style.display = "flex";
			record.style.display = "none";

			micWave.microphone.on("deviceReady", function (stream) {
				console.log("Device ready!", stream);
			});
			micWave.microphone.on("deviceError", function (code) {
				console.warn("Device error: " + code);
			});
			micWave.microphone.start();

			stop.onclick = function () {
				mediaRecorder.stop();
				console.log(mediaRecorder.state);
				console.log("Recorder detenido");
				record.style.background = "";
				record.style.color = "";

				stop.disabled = true;
				record.disabled = false;
				stop.style.display = "none";
				record.style.display = "flex";

				micWave.microphone.destroy();
				micWave.destroy();
			};

			mediaRecorder.onstop = function (e) {
				//GENERANDO ID PAR CADA CLIP
				const clipID = generateSoundClipID();
				const waveContainerID = generateWaveContainerID(clipID);

				const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
				console.log("blob generado: " + blob);
				chunks = [];
				const audioURL = window.URL.createObjectURL(blob);
				const sourceType = "blob";
				saveSoundClip(clipID, blob, sourceType);
				console.log("blob grabado: " + getSoundClip(clipID).data);
				console.log("blob source type: " + getSoundClip(clipID).sourceType);
				console.log(JSON.stringify(getSoundClip(clipID).data));

				//generateClip(clipID,waveContainerID,getSoundClip(clipID),'Clip de Audio');
				generateClip(clipID, waveContainerID, audioURL, "Clip de Audio");
				console.log("Recorded clip ID: " + getSoundClip(clipID).id);

				//Desactivando captura del micrófono
				stream.getTracks().forEach((track) => {
					track.stop();
				});
			};

			mediaRecorder.ondataavailable = function (e) {
				console.log("chunk:" + e.data);
				chunks.push(e.data);
			};
		};

		let onError = function (err) {
			console.log("Error: " + err);
		};

		navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
	} else {
		console.log("getUserMedia no soportado");
	}
};
// VERIFICANDO ACCESO AL MICRÓFONO

function editClip(clipID, audioSource) {
	currentEditionClipID = clipID;
	let clipDuration;
	let selectedRegionID;

	if (appStatus == "editing") {
		console.log("No esta vacía");
		console.log(editionWave);
		editionWave.destroy();
	}

	var editionWave = WaveSurfer.create({
		container: "#editionBar",
		waveColor: "white",
		progressColor: "#1c67f1",
		cursorColor: "#1c67f1",
		cursorWidth: 2,
		barWidth: 2,
		barGap: 1,
		barHeight: 5,
		height: 96,
		//hideScrollbar: true,
		plugins: [
			WaveSurfer.regions.create({
				dragSelection: {},
			}),
		],
	});

	loadWave(editionWave, audioSource);
	appStatus = "editing";

	var selectedRegion = null;

	editionWave.on("ready", function () {
		console.log("Editing wave ready!");
		editionWave.enableDragSelection({
			color: "rgba(0, 92, 200, 0.3)",
		});
		clipDuration = editionWave.getDuration();
		console.log("Clip duration: " + clipDuration);
	});

	//PROBANDO ACCESO A PARAMETROS DE LAS REGIONES
	editionWave.on("region-created", function (region, event) {
		console.log("Region created!");
		console.log(editionWave.regions.list);
		enableEditionOnCreation();
	});

	editionWave.on("region-click", function (region, event) {
		playSelectedRegion.disabled = false;
		clearSelectedRegion.disabled = false;
		selectedRegionID = region.id;
		console.log(selectedRegionID);

		if (selectedRegion == null) {
			selectedRegion = region;
			selectedRegion.update({
				color: "rgba(21, 209, 52, 0.3)",
			});
		} else {
			selectedRegion.update({
				color: "rgba(0, 92, 200, 0.3)",
			});
			selectedRegion = region;
			selectedRegion.update({
				color: "rgba(21, 209, 52, 0.3)",
			});
		}
	});

	editionWave.on("region-dblclick", function (region, event) {
		region.remove();
		playSelectedRegion.disabled = true;
		console.log(
			"Number of Regions: " + Object.keys(editionWave.regions.list).length == 0
		);
		if (Object.keys(editionWave.regions.list).length == 0) {
			disableEditionOnClear();
		}
	});

	editionWave.on("region-update-end", function (region) {
		editionWave.drawer.un("click");

		if (selectedRegion != null) {
			selectedRegion.update({
				color: "rgba(0, 92, 200, 0.3)",
			});
		}

		selectedRegion = region;
	});

	// Zoom slider
	editionWave.zoom(-1); //Resetting zoom

	slider.value = editionWave.params.minPxPerSec;
	//slider.min = editionWave.params.minPxPerSec;
	slider.min = editionWave.params.minPxPerSec;
	// Allow extreme zoom-in, to see individual samples

	slider.max = 2000;

	slider.addEventListener("input", function () {
		editionWave.zoom(Number(this.value));
		console.log(editionWave.params.minPxPerSec);
	});

	// set initial zoom to match slider value
	editionWave.zoom(slider.value);

	playFullClip.onclick = function () {
		editionWave.seekTo(0);
		editionWave.playPause();
	};

	playSelectedRegion.onclick = function () {
		editionWave.regions.list[selectedRegionID].play();
	};

	playEditedPreview.onclick = function () {
		let regionsIDs = Object.keys(editionWave.regions.list);
		for (let i = 0; i < regionsIDs.length; i++) {
			editionWave.regions.list[regionsIDs[i]].play();
		}
	};

	clearSelectedRegion.onclick = function () {
		selectedRegion.remove();
	};

	cutAudio.onclick = function () {
		let regionsIDs = Object.keys(editionWave.regions.list);
		regionsCount = regionsIDs.length;

		let originalRegionIntervals = [];
		let selectedRegionsIntervals = [];
		let nonSelectedRegionsIntervals = [];

		for (let idPosition = 0; idPosition < regionsCount; idPosition++) {
			originalRegionIntervals.push([
				editionWave.regions.list[regionsIDs[idPosition]].start,
				editionWave.regions.list[regionsIDs[idPosition]].end,
			]);
		}

		//Ordenando a partir de los tiempos iniciales de cada región
		originalRegionIntervals.sort(function (a, b) {
			return a[0] - b[0];
		});

		//Creando regiones finales uniendo regiones solapadas
		if (regionsCount > 1) {
			//Inicializando posiciones
			let leftStart = originalRegionIntervals[0][0];
			let leftEnd = originalRegionIntervals[0][1];
			let newStart = leftStart;
			let newEnd = leftEnd;
			let rightStart;
			let rightEnd;

			for (
				let leftRegion = 0, rightRegion = 1;
				rightRegion < regionsCount;
				rightRegion++
			) {
				rightStart = originalRegionIntervals[rightRegion][0];
				rightEnd = originalRegionIntervals[rightRegion][1];

				if (leftEnd > rightStart) {
					//console.log('Regiones solapadas!'+leftEnd+' > '+rightStart);
					newEnd = rightEnd;
				} else {
					//console.log('Regiones no solapadas!');
					selectedRegionsIntervals.push([newStart, newEnd]);
					leftRegion = rightRegion;
					leftStart = originalRegionIntervals[leftRegion][0];
					leftEnd = originalRegionIntervals[leftRegion][1];
					newStart = leftStart;
					newEnd = leftEnd;
				}
			}
			//Insertar última región
			selectedRegionsIntervals.push([newStart, newEnd]);
		} else {
			selectedRegionsIntervals = originalRegionIntervals;
		}

		//Determinando intervalos de regiones no seleccionadas
		for (
			let currentRegion = 0, start = 0, end = selectedRegionsIntervals[0][0];
			currentRegion < selectedRegionsIntervals.length;
			currentRegion++
		) {
			if (selectedRegionsIntervals[currentRegion][0] > start) {
				end = selectedRegionsIntervals[currentRegion][0];
				nonSelectedRegionsIntervals.push([start, end]);
				start = selectedRegionsIntervals[currentRegion][1];
			} else {
				start = selectedRegionsIntervals[currentRegion][1];
			}

			//Insertar última región
			if (
				currentRegion == selectedRegionsIntervals.length - 1 &&
				selectedRegionsIntervals[currentRegion][1] < clipDuration
			) {
				nonSelectedRegionsIntervals.push([
					selectedRegionsIntervals[currentRegion][1],
					clipDuration,
				]);
			}
		}

		console.log("Original intervals: " + originalRegionIntervals);
		console.log("Selected intervals: " + selectedRegionsIntervals);
		console.log("Not selected intervals: " + nonSelectedRegionsIntervals);

		audioBlob = generatedClips[0].data;
		console.log("blob de url" + audioBlob);
		console.log("clip to cut: " + JSON.stringify(getSoundClip(clipID)));

		if (editionMode == "remove-selection") {
			slice(getSoundClip(clipID), nonSelectedRegionsIntervals);
		} else if (editionMode == "keep-selection") {
			slice(getSoundClip(clipID), selectedRegionsIntervals);
		}
	};

	keepSelection.onclick = function () {
		setEditionMode("keep-selection");
		enableKeepMode();
		console.log("Cutting mode set to: " + editionMode);
	};

	removeSelection.onclick = function () {
		setEditionMode("remove-selection");
		enableRemoveMode();
		console.log("Cutting mode set to: " + editionMode);
	};

	clearRegions.onclick = function () {
		editionWave.clearRegions();
		disableEditionOnClear();
	};

	cancelEditing.onclick = function () {
		exitEditionMode();
		disableEditionModeToggle();
		editionWave.destroy();
		appStatus = "inactive";
	};
}
