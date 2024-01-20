async function loadImages() {
    const rpcUrl = 'https://sepolia.optimism.io';
    const web3 = new Web3(rpcUrl);
    const contractAddress = '0xba3c9069be6d29ae079b92200e797fd0190f8f2c';
    const abi = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"getAllImagePoints","outputs":[{"components":[{"internalType":"uint256","name":"x","type":"uint256"},{"internalType":"uint256","name":"y","type":"uint256"}],"internalType":"struct LineRenderer.Point[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getAllOriginPoints","outputs":[{"components":[{"internalType":"uint256","name":"x","type":"uint256"},{"internalType":"uint256","name":"y","type":"uint256"}],"internalType":"struct LineRenderer.Point[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getImageUrl","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"x","type":"uint256"},{"internalType":"uint256","name":"y","type":"uint256"}],"name":"moveOriginPoint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"x","type":"uint256"},{"internalType":"uint256","name":"y","type":"uint256"}],"name":"setImagePoint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"uint256","name":"x","type":"uint256"},{"internalType":"uint256","name":"y","type":"uint256"}],"internalType":"struct LineRenderer.Point[]","name":"points","type":"tuple[]"}],"name":"sumUpImages","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_baseImageUrl","type":"string"}],"name":"updateBaseImageUrl","outputs":[],"stateMutability":"nonpayable","type":"function"}]
    const contract = new web3.eth.Contract(abi, contractAddress);

    try {
        const imageUrls = await contract.methods.getImageUrl().call();
        displayImages(imageUrls);
        await displayPoints(contract);
    } catch (error) {
        console.error('Error fetching images:', error);
    }
}

function displayImages(imageUrls) {
    const container = document.getElementById('images');
    container.innerHTML = '';
    const urls = imageUrls.split(',');

    const maxWidthPercent = 90 / urls.length;
    urls.forEach(url => {
        const img = document.createElement('img');
        img.src = url;
        img.style.maxWidth = `${maxWidthPercent}vw`;
        img.style.height = 'auto';
        container.appendChild(img);
    });

    container.style.display = 'flex';
    container.style.flexDirection = 'row';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'center';
    container.style.flexWrap = 'nowrap';
}

function generateGrid() {
    const grid = document.getElementById('grid');
    grid.innerHTML = ''; 
    grid.style.display = 'flex';
    grid.style.flexDirection = 'column-reverse';

    // Generate rows from top to bottom, which will be bottom to top in Cartesian coordinates
    for (let y = 0; y < 5; y++) {
        const row = document.createElement('div');
        row.className = 'grid-row';
        row.style.display = 'flex';
        row.style.flexDirection = 'row';

        for (let x = 0; x < 5; x++) {
            const dot = document.createElement('div');
            dot.className = 'grid-dot';
            dot.textContent = '•';
            dot.style.display = 'flex';
            dot.style.alignItems = 'center';
            dot.style.justifyContent = 'center';
            dot.style.width = '20px';
            dot.style.height = '20px';
            dot.style.margin = '3vw';
            dot.dataset.x = x;
            dot.dataset.y = y;
            row.appendChild(dot);
        }
        grid.appendChild(row);
    }
}

async function displayPoints(contract) {
    const originPoints = await contract.methods.getAllOriginPoints().call();
    const imagePoints = await contract.methods.getAllImagePoints().call();
    let prevOriginPoints = new Set(originPoints.slice(0, -1).map(p => `${p.x},${p.y}`));
    let prevImagePoints = new Set(imagePoints.slice(0, -1).map(p => `${p.x},${p.y}`));

    originPoints.forEach((point, index) => {
        let symbol = prevOriginPoints.has(`${point.x},${point.y}`) ? '@' : 'o';
        if (index === originPoints.length - 1 && symbol !== '@') {
            symbol = 'o';
        }
        markPoint(point, symbol);
    });

    imagePoints.forEach((point, index) => {
        let symbol = prevImagePoints.has(`${point.x},${point.y}`) ? '#' : 'x';
        if (index === imagePoints.length - 1 && symbol !== '#') {
            symbol = 'x';
        }
        markPoint(point, symbol);
    });

    prevOriginPoints.forEach(key => {
        if (prevImagePoints.has(key)) {
            let [x, y] = key.split(',').map(Number);
            markPoint({ x, y }, '&');
        }
    });
}

function markPoint(point, mark) {
    const dots = document.getElementsByClassName('grid-dot');
    Array.from(dots).forEach(dot => {
        if (dot.dataset.x == point.x && dot.dataset.y == point.y) {
            dot.textContent = mark;
            dot.classList.add('symbol');
        }
    });
}

function toggleDisplay(elementId) {
    const elements = ['grid', 'infoText', 'images'];
    const elementToToggle = document.getElementById(elementId);

    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element !== elementToToggle) {
            element.style.display = 'none';
        }
    });

    if (elementToToggle.style.display === 'flex' || elementToToggle.style.display === 'block') {
        document.getElementById('images').style.display = 'flex';
        elementToToggle.style.display = 'none';
    } else {
        elementToToggle.style.display = elementId === 'grid' ? 'flex' : 'block';
        document.getElementById('images').style.display = 'none';
    }
}

document.getElementById('gridToggle').addEventListener('click', function() {
    toggleDisplay('grid');
});

document.getElementById('infoToggle').addEventListener('click', function() {
    toggleDisplay('infoText');
});

window.onload = function() {
    loadImages();
    generateGrid();
    document.getElementById('grid').style.display = 'none';
    document.getElementById('infoText').style.display = 'none';
    document.getElementById('images').style.display = 'flex';
};
