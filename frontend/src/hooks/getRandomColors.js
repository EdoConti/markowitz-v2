// getRandomColors.js
const getRandomColors = (n, saturation=70, lightness=50) => 
    Array.from({ length: n }, (_, i) => {
      const hue = Math.round((360 * i) / n);
      return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    });
  
  export default getRandomColors;  