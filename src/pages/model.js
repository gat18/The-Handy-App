// Import dependencies
import React from "react";
import { NavLink } from "react-router-dom";
import Webcam from "react-webcam";
import * as tf from "@tensorflow/tfjs";
import ParticlesBg from "particles-bg";

import { drawRect, textChanges, getChar } from "../Components/utilities";
import "./model.css";

const availableModels = {
	modelOne: {
		name: "modelOne",
		url: 'http://handynumber.s3.eu-gb.cloud-object-storage.appdomain.cloud/model.json',
		counterModulo: 10,
		accuracyThreshold: 0.9,
		boxId: 2,
		classId: 1,
		scoreId: 5
	},
	modelTwo: {
		name: "modelTwo",
		url: 'http://handylettersandspecial.s3.eu-gb.cloud-object-storage.appdomain.cloud/model.json',
		counterModulo: 6,
		accuracyThreshold: 0.8,
		boxId: 2,
		classId: 5,
		scoreId: 1
	},
	modelThree: {
		name: "modelThree",
		url: 'http://handycombined.s3.eu-gb.cloud-object-storage.appdomain.cloud/model.json',
		counterModulo: 4,
		accuracyThreshold: 0.7,
		boxId: 1,
		classId: 6,
		scoreId: 0
	}
}

export default class Model extends React.Component {
	constructor(props) {
		super(props);
		this.webcamRef = React.createRef(null);
		this.canvasRef = React.createRef(null);
		this.state = {
			intervalId: null,
			displayedText: '',
			textMode: 'lower-case',
			frameCounter: 0,
			model: null,
			audioOn: true,
			modelSettings: availableModels.modelThree
		};
		this.loadModelFromSettings = this.loadModelFromSettings.bind(this);
		
		this.handleUseModelOne = this.handleChangeModel.bind(this, ["modelOne"]);
		this.handleUseModelTwo = this.handleChangeModel.bind(this, ["modelTwo"]);
		this.handleUseModelThree = this.handleChangeModel.bind(this, ["modelThree"]);

		this.handleChangeTextMode = this.handleChangeTextMode.bind(this);
		this.handleToggleAudio = this.handleToggleAudio.bind(this);
		this.handleSaveText = this.handleSaveText.bind(this);
		this.handleClearText = this.handleClearText.bind(this);

		this.captureImage = this.captureImage.bind(this);
		this.runModel = this.runModel.bind(this);
		this.drawResult = this.drawResult.bind(this);
		this.checkForTextModeChange = this.checkForTextModeChange.bind(this);
		this.detectSignLanguage = this.detectSignLanguage.bind(this);

		this.createDetectInterval = this.createDetectInterval.bind(this);
	}

	async loadModelFromSettings() {
		this.setState({ model: await tf.loadGraphModel(this.state.modelSettings.url) });
		this.createDetectInterval()
	}

	handleChangeModel(name) {
		if (name === this.state.modelSettings.name) {
			return;
		} else if (this.state.intervalId) {
			clearInterval(this.state.intervalId);
			this.setState({ intervalId: null });
		}
		
		this.setState({ modelSettings: availableModels[name] });
		this.loadModelFromSettings();
	}

	handleChangeTextMode(newMode) {
		this.setState({ textMode: newMode });
	}

	handleToggleAudio() {
		this.setState(prevState => ({ audioOn: !prevState.audioOn }));
	}

	handleSaveText() {
		let element = document.createElement("a");
		let file = new Blob(
			[String(this.state.displayedText)], 
			{ type: "text/plain" }
		);
		
		element.download = "output.txt";
		element.href = URL.createObjectURL(file);
		document.body.appendChild(element);

		element.click();
	}

	handleClearText() {
		this.setState({ displayedText: '' });
	}

	captureImage() {
		if (
			!this.webcamRef 
			|| !this.canvasRef
			|| !this.canvasRef.current
			|| !this.webcamRef.current 
			|| this.webcamRef.current.video.readyState !== 4
		) {
			return null;
		}
		
		let video = this.webcamRef.current.video;

		video.width = video.videoWidth;
		video.height = video.videoHeight;

		this.canvasRef.current.width = video.videoWidth;
		this.canvasRef.current.height = video.videoHeight;

		return tf.browser.fromPixels(video);
	}

	async runModel(image) {
		let preprocessedImage = tf.image
			.resizeBilinear(image, [640,480])
			.cast('int32')
			.expandDims(0);
		
		let output = await this.state.model.executeAsync(preprocessedImage)
		
		let results = {
			boxes: await output[this.state.modelSettings.boxId].array(),
			classes: await output[this.state.modelSettings.classId].array(),
			scores: await output[this.state.modelSettings.scoreId].array()
		}

		tf.dispose(preprocessedImage);
		tf.dispose(output);

		return results;
	}

	drawResult(results) {
		let canvas = this.canvasRef.current;
		let context = canvas.getContext("2d");
		
		let video = this.webcamRef.current.video;

		context.clearRect(0, 0, canvas.width, canvas.height);

		requestAnimationFrame(() => {
			drawRect(
				this.state.modelSettings.name,
				results.boxes[0], 
				results.classes[0], 
				results.scores[0], 
				this.state.modelSettings.accuracyThreshold, 
				video.videoWidth,
				video.videoHeight,
				context
			);
		});
	}

	checkForTextModeChange(detectedChar) {
		let modeChars = ['upper-case', 'lower-case', 'number'];
		if(modeChars.includes(detectedChar)) {
			this.handleChangeTextMode(detectedChar);
		}
	}

	async detectSignLanguage() {
		let image = this.captureImage()
		if (!image) return;

		let results = await this.runModel(image);
		this.drawResult(results);

		let frameCounter = this.state.frameCounter;
		let counterModulo = this.state.modelSettings.counterModulo;

		if (frameCounter % counterModulo === 0) {
			let currentMode = this.state.textMode
			let detectedChar = getChar(
				this.state.modelSettings.name,
				currentMode, 
				results.classes[0], 
				results.scores[0],
				this.state.modelSettings.accuracyThreshold
			);
			console.log(detectedChar)
			if (this.state.audioOn) {
				let utterance = new SpeechSynthesisUtterance(detectedChar);
				speechSynthesis.speak(utterance);
			}

			this.checkForTextModeChange(detectedChar);

			this.setState(prevState => ({
				displayedText: textChanges(
					prevState.textMode,
					prevState.displayedText, 
					detectedChar
				)
			}));
		}

		this.setState(prevState => ({ frameCounter: prevState.frameCounter + 1 }));
		tf.dispose(image);
	}

	createDetectInterval() {
		this.setState({ intervalId: setInterval(this.detectSignLanguage, 16.7) });
	}

	componentDidMount() {
		this.loadModelFromSettings();
	}

	componentWillUnmount() {
		clearInterval(this.state.intervalId);
	}

	render() {
		let casingString;

		switch(this.state.textMode) {
			case "lower-case":
				casingString = "Lower case";
				break;
			case "upper-case":
				casingString = "Upper case";
				break;
			case "number":
				casingString = "Number";
				break;
			default:
				casingString = "Unknown";
				console.log(`WARN: textMode = '${this.state.textMode}', which is unknown.`);
		}

		let audioOnString = this.state.audioOn ? "On" : "Off";

		return (
			<div className="model">
				<ParticlesBg type="circle" bg={true} />
				<nav id="nav-wrap">
					<a className="mobile-btn" href="#nav-wrap" title="Show navigation">Show navigation</a>
					<a className="mobile-btn" href="#home" title="Hide navigation">Hide navigation</a>
						<ul id="nav" className="nav">
							<li><NavLink to="/">Return Home</NavLink></li>
						</ul>
				</nav>
				<div className="box">
					<div className="model-header">
						<Webcam
							ref={this.webcamRef}
							muted={true} 
							style={{
							position: "absolute",
							left: 220,
							right: 0,
							textAlign: "center",
							zindex: 9,
							width: 640,
							height: 480,
							}}
						/>
						<canvas
							ref={this.canvasRef}
							style={{
							position: "absolute",
							left: 220,
							right: 0,
							textAlign: "center",
							zindex: 8,
							width: 640,
							height: 480,
							}}
						/>
						<div className="displaytext">
							<h1><span>Registered Text</span></h1>
							<div className="textbox">
								<div className="textp">{this.state.displayedText}</div>
							</div>
						</div>
						<div className="buttonspace">
							<button className="button btn1" onClick={this.handleUseModelOne}>Model 1</button>
							<button className="button btn1" onClick={this.handleUseModelTwo}>Model 2</button>
							<button className="button btn1" onClick={this.handleUseModelThree}>Model 3</button>

							<button className="button btnM" >Mode: {casingString}</button>

							<button className="button btnA " onClick={this.handleToggleAudio}>Audio <i className="fa fa-volume-up"></i> : {audioOnString}</button>

							<button className="button btn2" onClick={this.handleSaveText}>Save <i className="fa fa-floppy-o" aria-hidden="true"></i> </button>
							<button className="button btn3" onClick={this.handleClearText}>Clear</button>
						</div>
					</div>
				</div>
			</div>
		);
	}
}