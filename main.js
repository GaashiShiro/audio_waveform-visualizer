
const main=()=>{

    // Function to draw the waveform
    const drawWaveform = data => {
    const canvas = document.getElementById('waveformCanvas');
    const context = canvas.getContext('2d');

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = '#333';
    context.lineWidth = 1;

    // Calculate the width of each sample
    const sampleWidth = canvas.width / data.length;

    // Draw the waveform
    context.beginPath();
    data.forEach((value, i) => {
        const x = i * sampleWidth;
        const y = (value / 255) * canvas.height;

        if (i === 0) {
        context.moveTo(x, y);
        } else {
        context.lineTo(x, y);
        }
    });
    context.stroke();
    };

    // Function to draw the bars
    const drawBars = data => {
        const canvas = document.getElementById('waveformCanvas');
        const context = canvas.getContext('2d');
    
        context.clearRect(0, 0, canvas.width, canvas.height);
    
        // Set the desired width for each bar
        const barWidth = 7; // Adjust this value to make the bars wider or narrower
    
        // Draw the bars
        data.forEach((value, i) => {
        const x = i * (barWidth + 2); // Add some spacing between bars
        const barHeight = (value / 255) * canvas.height;
    
        // Assign a different color to each bar
        const hue = (i / data.length) * 360;
        context.fillStyle = `hsl(${hue}, 100%, 50%)`;
    
        context.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        });
    };
    

    // Function to draw dots
    const drawDots = data => {
        const canvas = document.getElementById('waveformCanvas');
        const context = canvas.getContext('2d');
    
        context.clearRect(0, 0, canvas.width, canvas.height);
    
        // Define the step size for iterating over the data array
        const stepSize = 10; // Adjust this value to control the number of dots displayed
    
        // Draw the dots
        for (let i = 0; i < data.length; i += stepSize) {
        const value = data[i];
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const red = Math.floor(Math.random() * 256);
        const green = Math.floor(Math.random() * 256);
        const blue = Math.floor(Math.random() * 256);
        context.fillStyle = `rgb(${red}, ${green}, ${blue})`;
        context.beginPath();
        context.arc(x, y, 2, 0, Math.PI * 2);
        context.fill();
        }
    };
    

    // Function to draw the spectrum
    const drawSpectrum = data => {
    const canvas = document.getElementById('waveformCanvas');
    const context = canvas.getContext('2d');

    context.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = canvas.width / data.length;
    const barHeightMultiplier = canvas.height / 255;

    data.forEach((value, i) => {
        const x = i * barWidth;
        const barHeight = value * barHeightMultiplier;

        context.fillStyle = `rgb(${value}, ${value}, ${value})`;
        context.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
    });
    };

    // Function to draw a circle
    const drawCircle = data => {
    const canvas = document.getElementById('waveformCanvas');
    const context = canvas.getContext('2d');

    context.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY);
    const angleIncrement = (2 * Math.PI) / data.length;

    context.strokeStyle = '#333';
    context.lineWidth = 1;

    context.beginPath();

    data.forEach((value, i) => {
        const angle = i * angleIncrement;
        const amplitude = (value / 255) * radius;

        const x = centerX + Math.cos(angle) * amplitude;
        const y = centerY + Math.sin(angle) * amplitude;

        if (i === 0) {
        context.moveTo(x, y);
        } else {
        context.lineTo(x, y);
        }
    });

    context.closePath();
    context.stroke();
    };

    // Load and process the audio file
    const audio = new Audio('./Bat_Country.mp3');
    audio.crossOrigin = 'anonymous';

    let audioCtx;
    let source;
    let analyser;
    let dataArray;
    let isPlaying = false;
    let shouldRenderFrame = false; // Flag to control rendering loop

    // Button elements
    const playButton = document.getElementById('playButton');
    const pauseButton = document.getElementById('pauseButton');
    const visualizationSelect = document.getElementById('visualizationSelect');

    // Visualization style
    let visualizationStyle = visualizationSelect.value;

    // Play button click event listener
    playButton.addEventListener('click', () => {
    if (!isPlaying) {
        if (audioCtx && audioCtx.state === 'suspended') {
        // Resume audio context if it exists and is suspended
        audioCtx.resume().then(() => {
            audio.play();
            isPlaying = true;
            shouldRenderFrame = true; // Start rendering loop
            renderFrame();
        });
        } else {
        // Create a new audio context
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        // Create a new source node
        source = audioCtx.createMediaElementSource(audio);
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 2048;
        const bufferLength = analyser.fftSize;
        dataArray = new Uint8Array(bufferLength);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);

        // Start rendering the waveform
        audio.play();
        isPlaying = true;
        shouldRenderFrame = true; // Start rendering loop
        renderFrame();
        }
    }
    });

    // Pause button click event listener
    pauseButton.addEventListener('click', () => {
    if (isPlaying && audioCtx && audioCtx.state === 'running') {
        audio.pause();
        audioCtx.suspend().then(() => {
        isPlaying = false;
        });
    }
    });

    // Visualization select change event listener
    visualizationSelect.addEventListener('change', () => {
    visualizationStyle = visualizationSelect.value;
    });

    // Function to render the waveform periodically
    const renderFrame = () => {
    if (shouldRenderFrame) {
        requestAnimationFrame(renderFrame);
        analyser.getByteTimeDomainData(dataArray);

        // Choose visualization style
        switch (visualizationStyle) {
        case 'waveform':
            drawWaveform(dataArray);
            break;
        case 'bars':
            drawBars(dataArray);
            break;
        case 'dots':
            drawDots(dataArray);
            break;
        case 'spectrum':
            drawSpectrum(dataArray);
            break;
        case 'circle':
            drawCircle(dataArray);
            break;
        default:
            drawWaveform(dataArray);
            break;
        }
    }
    };

}

main();
