// Define our labelmap
const labelMap = {
    1:{name:'0', color:'red'},
    2:{name:'1', color:'yellow'},
    3:{name:'2', color:'lime'},
    4:{name:'3', color:'blue'},
    5:{name:'4', color:'red'},
    6:{name:'5', color:'yellow'},
    7:{name:'6', color:'lime'},
    8:{name:'7', color:'blue'},
    9:{name:'8', color:'red'},
    10:{name:'9', color:'yellow'},
    11:{name:'a', color:'red'},
    12:{name:'b', color:'yellow'},
    13:{name:'c', color:'lime'},
    14:{name:'d', color:'blue'},
    15:{name:'e', color:'red'},
    16:{name:'f', color:'yellow'},
    17:{name:'g', color:'lime'},
    18:{name:'h', color:'blue'},
    19:{name:'i', color:'red'},
    20:{name:'j', color:'yellow'},
    21:{name:'k', color:'red'},
    22:{name:'l', color:'yellow'},
    23:{name:'m', color:'lime'},
    24:{name:'n', color:'blue'},
    25:{name:'o', color:'red'},
    26:{name:'p', color:'yellow'},
    27:{name:'q', color:'lime'},
    28:{name:'r', color:'blue'},
    29:{name:'s', color:'red'},
    30:{name:'t', color:'yellow'},
    31:{name:'u', color:'red'},
    32:{name:'v', color:'yellow'},
    33:{name:'w', color:'lime'},
    34:{name:'x', color:'blue'},
    35:{name:'y', color:'red'},
    36:{name:'z', color:'yellow'},
    37:{name:'enter', color:'lime'},
    38:{name:'delete', color:'blue'},
    39:{name:'space', color:'red'},
    40:{name:'number', color:'yellow'},
    41:{name:'lower-case', color:'lime'},
    42:{name:'upper-case', color:'blue'}
}
export {labelMap}


export const drawRect = (model, boxes, classes, scores, threshold, imgWidth, imgHeight, ctx)=>{
    //Animation ontop of webcame frame
    for(let i=0; i<=boxes.length; i++){
        if(boxes[i] && classes[i] && scores[i]>threshold){
            
            const [y,x,b,a] = boxes[i]
            let text = classes[i]
            if (model === "modelTwo"){
                text +=10
            }
            
            ctx.strokeStyle = labelMap[text]['color']
            ctx.lineWidth = 10
            ctx.fillStyle = 'white'
            ctx.font = '30px Arial'         
            
            ctx.beginPath()
            ctx.fillText(labelMap[text]['name'] + ' - ' + Math.round(scores[i]*100)/100, x*imgWidth, y*imgHeight-10)
            ctx.rect(x*imgWidth, y*imgHeight, (a-x)*imgWidth, (b-y)*imgHeight);
            ctx.stroke()
        }
    }
}

export const getChar = (model, mode, classes, scores, threshold) => {
     if(scores[0] > threshold ){

        //MULTI-MODE FEATURE within loop
        //Loop through detected classes that are above threshold (if below, loop broken)
        console.log("classes:")
        for(let i=0; i<scores.length; i++){
            var labelno = classes[i]
            if (model === "modelTwo"){
                labelno +=10
            }
            
            // Class_name = detected gesture's meaning
            var class_name = labelMap[labelno]["name"];
            if(mode === "number" && is_numeric(class_name) === true && scores[i] > threshold){
                // Number mode active: If isLetter = false (is number) and above threshold accuracy, loop entered
                // Latest class_name definition = number (with highest and above threshold accuracy)
                break;
            }else if((mode === "lower-case" || mode === "upper-case" ) && is_numeric(class_name) === false && scores[i] > threshold){
                //For Lower or Upper case mode active: 
                break;
            }else if(scores[i] <= threshold){
                //Fail safe if no conditions met, just take highest detection.
                labelno = classes[0]
                if (model === "modelTwo"){
                    labelno +=10
                }
                class_name = labelMap[labelno]["name"];
                break;
            }
        }
        return class_name;
    }
    return "";
}

function is_numeric(str){
    return /^\d+$/.test(str);
}

export var textChanges = (mode, text, char) => {
    
    //Changing DisplayedText, for all cases
    switch(char){
        case "number": case "lower-case": case "upper-case":
            //do nothing
            break;
        case "delete":
            //remove last recorded gesture
            text = text.slice(0, -1);
            break;
        case "enter":
            //enter new line
            text+="\n";
            break;
        case "space":
            text+=" ";
            break;
        default:
            //add gesture, capitalise if in U-C mode
            if(mode === "upper-case"){
                char = char.toUpperCase()
            }
            text += char;
    }
    return text;
}