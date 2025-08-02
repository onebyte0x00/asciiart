document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const imageUpload = document.getElementById('image-upload');
    const textInput = document.getElementById('text-input');
    const widthSlider = document.getElementById('width');
    const widthValue = document.getElementById('width-value');
    const styleSelect = document.getElementById('style');
    const invertCheckbox = document.getElementById('invert');
    const generateBtn = document.getElementById('generate-btn');
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');
    const asciiOutput = document.getElementById('ascii-output');
    
    // Character sets for different styles
    const charSets = {
        simple: '@%#*+=-:. ',
        detailed: '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^`\'. ',
        blocks: '█▓▒░ ',
        inverted: ' .:-=+*#%@',
        color: '@%#*+=-:. ' // Color uses simple chars but adds color later
    };
    
    // Update width value display
    widthSlider.addEventListener('input', function() {
        widthValue.textContent = this.value;
    });
    
    // Generate ASCII art
    generateBtn.addEventListener('click', generateAsciiArt);
    
    // Copy to clipboard
    copyBtn.addEventListener('click', function() {
        navigator.clipboard.writeText(asciiOutput.textContent)
            .then(() => alert('ASCII art copied to clipboard!'))
            .catch(err => console.error('Failed to copy: ', err));
    });
    
    // Download as text file
    downloadBtn.addEventListener('click', function() {
        const blob = new Blob([asciiOutput.textContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ascii-art.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
    
    // Main generation function
    function generateAsciiArt() {
        const width = parseInt(widthSlider.value);
        const style = styleSelect.value;
        const invert = invertCheckbox.checked;
        
        if (imageUpload.files && imageUpload.files[0]) {
            // Process image
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    asciiOutput.innerHTML = imageToAscii(img, width, style, invert);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(imageUpload.files[0]);
        } else if (textInput.value.trim()) {
            // Process text
            asciiOutput.textContent = textToAscii(textInput.value.trim(), width, style, invert);
        } else {
            alert('Please upload an image or enter some text!');
        }
    }
    
    // Convert image to ASCII
    function imageToAscii(img, width, style, invert) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Calculate height to maintain aspect ratio
        const ratio = img.height / img.width;
        const height = Math.floor(width * ratio * 0.5); // Adjust for character aspect ratio
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw image on canvas
        ctx.drawImage(img, 0, 0, width, height);
        
        // Get pixel data
        const imageData = ctx.getImageData(0, 0, width, height).data;
        
        // Get appropriate character set
        let chars = charSets[style];
        if (invert) chars = chars.split('').reverse().join('');
        
        let ascii = '';
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4;
                const r = imageData[index];
                const g = imageData[index + 1];
                const b = imageData[index + 2];
                
                // Calculate brightness (0-1)
                const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                
                // Map brightness to character
                const charIndex = Math.floor(brightness * (chars.length - 1));
                let char = chars[charIndex];
                
                // Handle color style
                if (style === 'color') {
                    char = `<span style="color: rgb(${r},${g},${b})">${char}</span>`;
                }
                
                ascii += char;
            }
            ascii += '\n';
        }
        
        return ascii;
    }
    
    // Convert text to ASCII art (simplified)
    function textToAscii(text, width, style, invert) {
        // This is a simplified version - you could implement a more complex text-to-ASCII
        // or use a canvas to render the text and then convert to ASCII as with images
        
        // For demonstration, we'll just create a simple bordered text box
        const chars = charSets[style];
        const borderChar = chars[0];
        const fillChar = chars[chars.length - 1];
        
        let ascii = '';
        const textWidth = Math.min(width - 4, text.length);
        
        // Top border
        ascii += borderChar.repeat(width) + '\n';
        
        // Empty line
        ascii += borderChar + fillChar.repeat(width - 2) + borderChar + '\n';
        
        // Text line (centered)
        const padding = Math.floor((width - 2 - textWidth) / 2);
        ascii += borderChar + fillChar.repeat(padding) + text.substring(0, textWidth) + 
                 fillChar.repeat(width - 2 - textWidth - padding) + borderChar + '\n';
        
        // Empty line
        ascii += borderChar + fillChar.repeat(width - 2) + borderChar + '\n';
        
        // Bottom border
        ascii += borderChar.repeat(width);
        
        return ascii;
    }
});
