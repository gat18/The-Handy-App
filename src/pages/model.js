// Import dependencies
import React, { useRef, useEffect, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import Webcam from "react-webcam";
import "./model.css";

//import { nextFrame } from "@tensorflow/tfjs";

// 2. TODO - Import drawing utility here
import { drawRect, textChanges, getChar } from "../Components/utilities";
import ParticlesBg from "particles-bg"; 
import { NavLink } from "react-router-dom";
//import { Button } from 'react-native';
//import { useSpeechSynthesis } from "react-speech-kit";
//import ReactDOM from 'react-dom';


function initialText(){
  return "";
}
function initialMode(){
  return "lower-case";
}
function initialAudioState(){
  return "On";
}

function Model() {

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [displayedText, setDisplayedText] = useState(initialText);
  const [mode, setMode] = useState(initialMode);

  const [sound, setSound] = useState(initialAudioState);
  //const [resetFlag, setResetFlag] = useState(false)
  
  //default mode
  var state = "lower-case";
  var detected_text = "";
  var counter = 0;
  
  // CHANGE MODEL_TYPE TO CHANGE VERSION OF MODEL ( 0 if just number, 1 if just letter and s and other for combined)
  var model_type = 3;
 //
  var model_url= '';
  var counter_top = 4;
  var accuracy_threshold = 0.7;
  var box_id = 1;
  var class_id = 6;
  var score_id = 0;

  switch (model_type){
    case 1:
      model_url = 'http://handynumber.s3.eu-gb.cloud-object-storage.appdomain.cloud/model.json'  // just numbers 91.86% mAP 
      counter_top = 10;
      accuracy_threshold = 0.9;
      box_id = 2;
      class_id = 1;
      score_id = 5;
      break;
    case 2:
      model_url = 'http://handylettersandspecial.s3.eu-gb.cloud-object-storage.appdomain.cloud/model.json' //letters and special characters  90.15% mAP
      counter_top = 6;
      accuracy_threshold = 0.7;
      box_id = 2;
      class_id = 5;
      score_id = 1;
      break;
    case 0:
      break;
    default:
      model_url = 'http://handycombined.s3.eu-gb.cloud-object-storage.appdomain.cloud/model.json' //88.5% (multimode increase above 90)
      counter_top = 4;
      accuracy_threshold = 0.6;
      box_id = 1;
      class_id = 6;
      score_id = 0;
      break;
  }

  function chooseModel1(){
    model_type = 1
  }
  function chooseModel2(){
    model_type = 2
  }
  function chooseModel3(){
    model_type = 3
  }
  function Audioswitch(){
  }
  
  function resetText(){
    window.location.reload(false);
  }

  function saveText(){
    const element = document.createElement("a");
    const file = new Blob([String(displayedText)], {
      type: "text/plain"
    });
    element.href = URL.createObjectURL(file);
    element.download = "myFile.txt";
    document.body.appendChild(element);
    element.click();
    //console.log("saving");
  }


  // Main function
  const runCoco = async () => {

    // 3. TODO - Load network 
    const net = await tf.loadGraphModel(model_url);

    // Loop and detect hands
    setInterval(() => {
      detect(net);
    }, 16.7);
  };
  
  const detect = async (net) => {
    // Check data is available
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Set canvas height and width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // 4. TODO - Make Detections
      const img = tf.browser.fromPixels(video)
      const resized = tf.image.resizeBilinear(img, [640,480])
      const casted = resized.cast('int32')
      const expanded = casted.expandDims(0)
      const obj = await net.executeAsync(expanded)
      
      //console.log(await obj[6].array())

      const boxes = await obj[box_id].array() 
      const classes = await obj[class_id].array()  
      const scores = await obj[score_id].array() 
      
      // Draw mesh
      const ctx = canvasRef.current.getContext("2d");

      // 5. TODO - Update drawing utility
      // drawSomething(obj, ctx)  
      requestAnimationFrame(()=>{drawRect(boxes[0], classes[0], scores[0], accuracy_threshold, videoWidth, videoHeight, ctx)});
      //can change 'accuracy_threshold' to lower -> this is thresholdpercentage of detections 

      counter += 1;
      if(counter === counter_top){
        //SPEECH SYNTHESIS - AUDIO FEEDBACK
        var detected_char = getChar(classes[0], scores[0], accuracy_threshold);
        let utterance = new SpeechSynthesisUtterance(detected_char);
        speechSynthesis.speak(utterance); 
        
        //Changing MODE if mode characters detected
        switch(detected_char){
          case "number": case "lower-case": case "upper-case":
            setMode(prevMode => detected_char);
            state = detected_char;
            break;
          default:
        }

        // VISUAL DISPLAY of TEXT
        detected_text = textChanges(state, detected_text, classes[0], scores[0], accuracy_threshold);
        setDisplayedText(prevDisplayedText => detected_text);

        

        counter = 0;
      }
      //
      console.log(detected_text)
          
      tf.dispose(img)
      tf.dispose(resized)
      tf.dispose(casted)
      tf.dispose(expanded)
      tf.dispose(obj)

    }
  
  };

  useEffect(()=>{runCoco()},[]);

  return (
    
    <div className="model">
      <ParticlesBg type="circle" bg={true} />

      <nav id="nav-wrap">
          <a className="mobile-btn" href="#nav-wrap" title="Show navigation">
            Show navigation
          </a>
          <a className="mobile-btn" href="#home" title="Hide navigation">
            Hide navigation
          </a>
          <ul id="nav" className="nav">
            <li >
              <NavLink to="/">Return Home</NavLink>
            </li>
          </ul>
        </nav>
      <div className="box">
        <div className="model-header">
          <Webcam
            ref={webcamRef}
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
            ref={canvasRef}
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
            <h1>
              <span>Registered Text</span>
            </h1>
            <div className="textbox">
                <div className="textp">
                  {displayedText}

                </div>
              
            </div>
          </div>
          <div className="buttonspace">
            <button className="button btn1" onClick={chooseModel1}>Model 1</button>
            <button className="button btn1" onClick={chooseModel2}>Model 2</button>
            <button className="button btn1" onClick={chooseModel3}>Model 3</button>
            
            <button className="button btnM" >Mode: {mode}</button>
            
            <button className="button btnA " onClick={Audioswitch}>Audio <i className="fa fa-volume-up"></i> : {sound}</button>

            <button className="button btn2" onClick={saveText}>Save <i className="fa fa-floppy-o" aria-hidden="true"></i> </button>
            <button className="button btn3" onClick={resetText}>Clear</button>
                       
            
          </div>
        </div>
      </div>
    </div>
  );
}

export default Model;
