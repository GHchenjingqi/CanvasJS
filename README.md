# Canvas Drawing Library

A lightweight JavaScript library for drawing on HTML5 Canvas with intuitive APIs and interactive features.

Quickly draw basic shapes, create animations, electronic seals, and canvas functions based on Canvas.

Support ESM, CJS, and IIFE.

If you find it useful, please give me stars. I really hope to receive your suggestions or join in to make CanvasJS more compliant and user-friendly.

NPM address: [https://www.npmjs.com/package/canvasbox](https://www.npmjs.com/package/canvasbox)

Git address：[https://github.com/GHchenjingqi/CanvasJS](https://github.com/GHchenjingqi/CanvasJS)

## Features

+ 🎨 Draw various shapes (lines, rectangles, circles, triangles, text, images, Bezier curves)
+ 📏 Customizable coordinate system with Y-axis inversion support
+ 🖱 Interactive elements with click event handling
+ ✏️ Freehand drawing mode
+ 🖼 Image rendering with rotation and anchor point control
+ 📊 Grid drawing for visual reference
+ 💾 Export canvas as image (PNG/JPEG) with download functionality
+ 🔄 Responsive design that adapts to window resizing

## Installation

### NPM

```bash
# https://www.npmjs.com/package/canvasbox
npm install canvasbox
```

## <font style="color:rgb(64, 64, 64);">Basic Usage</font>

### <font style="color:rgb(64, 64, 64);">Initialization</font>

```javascript
const canvas = new Canvas('#my-canvas', (canvas, ctx) => {
  // Your drawing code here
});

// Or with options
const canvas = new Canvas('#my-canvas', {
  // Optional configuration
});
canvas.render()
```

If you are using **Vue** or **React**, please ensure that the canvas tag element exists, otherwise the page will display 2 canvases.

```javascript
import Canvas from 'canvasbox'
import { onMounted } from 'vue';

onMounted(() => {
  const canvas = new Canvas("#canvas")
  canvas.drawingBoard({
    lineWidth: 3,
    color: 'red'
  });
})
```

### <font style="color:rgb(64, 64, 64);">Coordinate System</font>

```javascript
// Center the coordinate system (Y-axis points up)
canvas.center({ yUp: true });

// Custom origin point (50px from left, 30% from top)
canvas.center({ origin: [50, '30%'] });
```

## <font style="color:rgb(64, 64, 64);">Drawing Methods</font>

### <font style="color:rgb(64, 64, 64);">Lines</font>

```javascript
canvas.line({
  type: 'dash',       // 'solid' or 'dash'
  a: [10, 10],        // Start point
  b: [100, 100],      // End point
  color: 'red',       // Color
  line: 2,            // Line width
  dash: [5, 3]        // Dash pattern
});
```

### <font style="color:rgb(64, 64, 64);">Rects</font>

```javascript
canvas.rect({
  type: 'stroke',     // 'fill', 'stroke', or 'dash'
  position: [50, 50], // Top-left corner
  size: [100, 80],    // Width and height
  color: 'blue',
  line: 1,
  onClick: () => console.log('Rectangle clicked!')
});
```

### Triangles

```javascript
canvas.triangle({
  points: [[10, 10], [100, 10], [50, 100]],
  color: 'red',
  type: 'fill',
  onClick: function () {
    console.log('点击了三角形');
  }
});
```

### <font style="color:rgb(64, 64, 64);">Circles/Arcs</font><font style="color:rgb(73, 73, 73);background-color:rgb(250, 250, 250);"></font>

```javascript
canvas.arc({
  type: 'fill',
  center: [150, 150],
  radius: 40,
  startAngle: 0,
  endAngle: Math.PI * 1.5,
  color: 'green'
});
```

### <font style="color:rgb(64, 64, 64);">Text</font>

```javascript
canvas.text({
  position: [100, 100],
  text: 'Hello World',
  color: 'black',
  fontSize: 24,
  fontFamily: 'Arial',
  align: 'center',
  baseline: 'middle'
});
```

### <font style="color:rgb(64, 64, 64);">Images</font>

```javascript
canvas.image({
  src: 'path/to/image.png',
  position: [200, 200],
  size: [100, 100],   // Optional scaling
  rotation: Math.PI/4, // 45 degrees
  anchor: [0.5, 0.5]  // Center anchor
});
```

### <font style="color:rgb(64, 64, 64);">Freehand Drawing</font><font style="color:rgb(73, 73, 73);background-color:rgb(250, 250, 250);"></font>

```javascript
// Enable drawing mode
canvas.drawingBoard({
  lineWidth: 3,
  color: '#000000'
});
```

## <font style="color:rgb(64, 64, 64);">Advanced Features</font>

### <font style="color:rgb(64, 64, 64);">Event Handling</font><font style="color:rgb(73, 73, 73);background-color:rgb(250, 250, 250);"></font>

```javascript
// Add clickable shape
canvas.rect({
  position: [50, 50],
  size: [100, 100],
  onClick: () => alert('Rectangle clicked!')
});
```

### <font style="color:rgb(64, 64, 64);">Exporting Canvas</font>

```javascript
// Save as PNG
canvas.save({
  type: 'png',
  filename: 'my-drawing.png'
});

// Get as data URL
const dataURL = canvas.toDataURL('image/jpeg', 0.8);
```

### <font style="color:rgb(64, 64, 64);">Grid Display</font>

```javascript
canvas.drawGrid();
```

## <font style="color:rgb(64, 64, 64);">Examples</font>

<font style="color:rgb(64, 64, 64);">Check out the </font><font style="color:rgb(59, 130, 246);">examples folder</font><font style="color:rgb(64, 64, 64);"> for complete usage examples.

## Apis

- clear()                  —— Used for cleaning canvas
- center()                —— Used to change the origin point
- render()               —— Used for rendering canvas
- line()                    —— Used for drawing lines
- rect()                    —— Used for drawing rectangles
- triangle()              —— Used for drawing triangles
- arc()                     —— Used for drawing arc
- text()                    —— Used for drawing text
- bezier()                —— Used for drawing bezier
- image()                —— Used for drawing image
- drawingBoard()   —— Used to create a drawing board
- drawTextAlongArc() —— Used to create curved wrap around text
- drawGrid()           —— Used to create a drawing grid
- drawStar()            —— Used to create a drawing star
- toDataURL()         —— Convert canvas content into a data URL
- toBlob()                —— Convert canvas content to blob data
- save()                    —— Save PNG and download

## <font style="color:rgb(17, 17, 17);">Keywords</font>

[<font style="color:rgb(73, 73, 73);background-color:rgb(250, 250, 250);">Canvasbox</font>](https://www.npmjs.com/search?q=keywords:canvasbox)<font style="color:rgb(73, 73, 73);background-color:rgb(250, 250, 250);"> , CanvasJS, Electronic seals
</font>

<font style="color:rgb(73, 73, 73);background-color:rgb(250, 250, 250);"></font>
