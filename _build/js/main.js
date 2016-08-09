jQuery(document).ready(function($) {


    var AudioContext = window.AudioContext || window.webkitAudioContext;
    var context,
        speaker,
        filters,
        lpFilter,
        audio,
        canvas,
        freqCount,
        freqMag,
        freqPhase,
        freqArray,
        step,
        fSlider,
        qDial,
        gDial;

    context = new AudioContext();
    speaker = context.destination;
    freqCount = 20000;
    freqArray = new Float32Array(freqCount);
    freqMag = new Float32Array(freqCount);
    freqPhase = new Float32Array(freqCount);
    for(var i=0;i<freqCount; ++i){
      freqArray[i] = 2000/freqCount*(i+1);
    }

    fSlider = $('#freq-slider');
    qDial = $('#q-dial');
    gDial = $('#gain-dial');

    filters = {'lowpass': {
        q: true,
        gain: false
      }, 'bandpass': {
        q: true,
        gain: true
      }, 'highpass': {
        q: true,
        gain: false
      }
    };

  canvas = document.getElementById('canvas');
  var canvasContext = canvas.getContext('2d');
  canvasContext.translate(0.5, 0.5);

  var WIDTH = canvas.width;
  var HEIGHT = canvas.height;

  //window.addEventListener('resize', resize, false);
  function getCanvasContext() {
      return $('#canvas')[0].getContext('2d');
  }

  function getViewportSize() {
      return {
          height: window.innerHeight,
          width: window.innerWidth
      };
  }

  function getCanvastSize() {
      var ctx = getCanvasContext();
      return {
          height: ctx.canvas.height,
          width: ctx.canvas.width
      };
  }

  function getPercentageOfWindow() {
      var viewportSize = getViewportSize();
      var canvasSize = getCanvastSize();
      return {
          x: canvasSize.width / (viewportSize.width - 10),
          y: canvasSize.height / (viewportSize.height - 10)
      };
  }

  var percentage = getPercentageOfWindow();

  function updateSizes() {
      var viewportSize = getViewportSize();
      var ctx = getCanvasContext();
      ctx.canvas.height = viewportSize.height * percentage.y;
      ctx.canvas.width = viewportSize.width * percentage.x;
  }

  $(window).on('resize', function() {
      updateSizes();
      updateFreq();
  });


  function drawFreqResponse(mag, phase){
    canvasContext.clearRect(0,0, WIDTH, HEIGHT);
    var stepSize = (canvas.width/freqCount);

    //magnitude
    canvasContext.strokeStyle = 'white';
    canvasContext.beginPath();
    for(step = 0; step<freqCount; step++){
      canvasContext.lineTo(
        step*stepSize,
        canvas.height-mag[step]*90);
    }
    canvasContext.stroke();
    //phase
    canvasContext.strokeStyle = 'red';
    canvasContext.beginPath();
    for(step = 0; step<freqCount; ++step){
      canvasContext.lineTo(
        step*stepSize,
        canvas.height-(phase[step]*90+400)/Math.PI);
  }
  canvasContext.stroke();
}

function updateFreq(){
  lpFilter.getFrequencyResponse(freqArray, freqMag, freqPhase);
  drawFreqResponse(freqMag, freqPhase);
}

window.addEventListener('load', function(){
  audio = $('#track');
  //audio.crossOrigin = 'anonymous';

  //var source = context.createMediaElementSource(audio);

  lpFilter = context.createBiquadFilter();
  lpFilter.type = 'lowpass';
  lpFilter.frequency.value = 50;
  lpFilter.Q.value = 0;
  lpFilter.gain.value = 3;
  lpFilter.connect(speaker);

  updateFreq();
}, false);

  $('#q-dial').knob({
    'min': -50,
    'max': 50,
    'cursor': true,
    'angleOffset': -135,
    'stopper': true,
    'displayInput': false,
    'displayPrevious': true,
    'angleArc': 270,
    'width': 100,
    'height': 100,
    'lineCap': 'round',
    'fgColor': '#c8bc4a',
    'bgColor': '#666666',
    'release': function(value){
      this.value = value/100;
      lpFilter.Q.value = value/100;
      updateFreq();
    }
  });

  $('#gain-dial').knob({
    'min': -50,
    'max': 50,
    'cursor': true,
    'angleOffset': -135,
    'stopper': true,
    'displayInput': false,
    'displayPrevious': true,
    'angleArc': 270,
    'width': 100,
    'height': 100,
    'lineCap': 'round',
    'fgColor': '#c8bc4a',
    'bgColor': '#666666',
    'release': function(value){
      lpFilter.gain.value = value/100;
      updateFreq();
    }
  });

  $('#freq-slider').on('input', function(){
    lpFilter.frequency.value = this.value;
  });

  $('#freq-slider').on('input', function(){
    lpFilter.frequency.value = this.value;
    updateFreq();
  });



  //$('#gain-dial').on('input', function(value){
    //this.value = value;
    //lpFilter.gain.value = value;
    //updateFreq();
  //});



});
