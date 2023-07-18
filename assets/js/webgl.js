var screen = document.getElementById("screen");
var tinker1 = document.getElementById("tinker1");
var tinker2 = document.getElementById("tinker2");
var background = document.getElementById("background");

var Init = function () {
    console.log("init");

    var screenInstance = new WebGLInstance(screen, fractalFragCode, true, false);
    var tinker1Instance = new WebGLInstance(tinker1, tinker1FragCode, true, false);
    var tinker2Instance = new WebGLInstance(tinker2, tinker2FragCode, true, false);
    var backgroundInstance = new WebGLInstance(background, backgroundFragCode, true, true);

}

class WebGLInstance {

    constructor (canvas, fragSource, matchScreenWidth, matchScreenHeight) {

        this.canvas = canvas;
        this.fragShader = fragShader;
        var gl = canvas.getContext('webgl2');

	    if (!gl) gl = canvas.getContext('expiramental-webgl');
	    if (!gl) alert('Your browser does not support WebGL');

	
	    gl.clearColor(0.2, 0.2, 0.7, 0.5);
	    gl.enable(gl.DEPTH_TEST);
	    gl.depthFunc(gl.LESS);

	    gl.enable(gl.CULL_FACE);
	    gl.cullFace(gl.BACK);

        var vertices = [
            -1,1,0,
            -1,-1,0,
            1,-1,0, 
            1,1,0
         ];
         
         var indices = [0,1,2,0,2,3];

         var vertex_buffer = gl.createBuffer();
         gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
         gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
         gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
         var Index_Buffer = gl.createBuffer();
         gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Index_Buffer);
         gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
         gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    
         var vertCode = `
            precision highp float;
            attribute vec3 coordinates;
            void main(void) {
               gl_Position = vec4(coordinates, 1.0);
            }
        `;
         var vertShader = gl.createShader(gl.VERTEX_SHADER);
         gl.shaderSource(vertShader, vertCode);
         gl.compileShader(vertShader);
    
    
    
         var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
         gl.shaderSource(fragShader, fragSource);
         gl.compileShader(fragShader);
    
         var shaderProgram = gl.createProgram();
         gl.attachShader(shaderProgram, vertShader);
         gl.attachShader(shaderProgram, fragShader);
         gl.linkProgram(shaderProgram);
         gl.useProgram(shaderProgram);
    
    
         gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
         gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Index_Buffer);
    
         var coord = gl.getAttribLocation(shaderProgram, "coordinates");
         gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0); 
         gl.enableVertexAttribArray(coord);
    
        var centerLocation = gl.getUniformLocation(shaderProgram, 'center');
        var scaleLocation = gl.getUniformLocation(shaderProgram, 'scale');
        var heightLocation = gl.getUniformLocation(shaderProgram, 'height');
        var widthLocation = gl.getUniformLocation(shaderProgram, 'width');
        var timeLocation = gl.getUniformLocation(shaderProgram, "time");
        var mouseLocation = gl.getUniformLocation(shaderProgram, 'mouseLocation');
        var scrollLocation = gl.getUniformLocation(shaderProgram, 'scroll');
    
        var center = [-0.981972213, -0.282552557];
        
        var boundsLocal = canvas.getBoundingClientRect();
        var boundsGlobal = document.body.getBoundingClientRect();
        
        window.addEventListener('mousemove', (event) => {
            
            gl.uniform2fv(mouseLocation, new Float32Array([
                event.clientX + document.documentElement.scrollLeft - boundsLocal.left + boundsGlobal.left, 
                event.clientY + document.documentElement.scrollTop - boundsLocal.top + boundsGlobal.top]));
        });
    
        var iter = 1800;
    
    
        var tick = function() {
    
            var shiftY = Math.sin(iter / 1000) * 0.01;
            var shiftX = Math.sin(iter / 100) * 0.001;
            var scale = Math.pow(1.1, Math.sin(iter / 600) * 20);
            gl.uniform2fv(centerLocation, new Float32Array([center[0] + shiftX / scale, center[1] + shiftY / scale]));
            gl.uniform1f(scaleLocation, 150 * scale);

            var scroll = document.documentElement.scrollTop;
            gl.uniform1f(scrollLocation, scroll);
    
            if (matchScreenWidth) canvas.width = window.innerWidth;
            var body = document.body;
            var height = Math.max( body.scrollHeight, body.offsetHeight );
            if (matchScreenHeight) canvas.height = height;
            gl.uniform1f(heightLocation, canvas.height);
            gl.uniform1f(widthLocation, canvas.width);
            gl.uniform1f(timeLocation, performance.now());
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT,0);
            requestAnimationFrame(tick);
            iter++;
    
            
    
        }

	    requestAnimationFrame(tick);
    }

    destroy() {

        console.log("destroying");

    }

}

