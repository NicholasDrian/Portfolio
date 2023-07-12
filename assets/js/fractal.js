var canvas = document.getElementById("screen");
var gl;

var Init = function () {

    gl = canvas.getContext('webgl2');
	console.log(gl.getParameter(gl.VERSION));
	console.log(gl.getParameter(gl.SHADING_LANGUAGE_VERSION));
	console.log(gl.getParameter(gl.VENDOR));

	if (!gl) gl = cnavas.getContext('expiramental-webgl');
	if (!gl) alert('Your browser does not support WebGL');
	
	gl.clearColor(0.2, 0.2, 0.7, 0.5);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LESS);

	gl.enable(gl.CULL_FACE);
	gl.cullFace(gl.BACK);

    Run();
    
}

var Run = function () {

    var vertices = [
        -1,1,0,
        -1,-1,0,
        1,-1,0, 
        1,1,0
     ];
     
     indices = [0,1,2,0,2,3];
     var vertex_buffer = gl.createBuffer();
     gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
     gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
     gl.bindBuffer(gl.ARRAY_BUFFER, null);

     var Index_Buffer = gl.createBuffer();
     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Index_Buffer);
     gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

     var vertCode = `
        precision mediump float;
        attribute vec3 coordinates;
        void main(void) {
           gl_Position = vec4(coordinates, 1.0);
        }
    `;
     var vertShader = gl.createShader(gl.VERTEX_SHADER);
     gl.shaderSource(vertShader, vertCode);
     gl.compileShader(vertShader);

     var fragCode = `
        precision mediump float;
        uniform vec2 center;
        uniform float scale;
        uniform float width;
        uniform float height;

        const int MAX_ITER = 300;
        const float MAX_SIZE_SQUARED = 10.0;

        int iterate(float x, float y) {
            float cr = x;
            float ci = y;
            float zr = 0.0;
            float zi = 0.0;
        
            for (int iter = 0; iter < MAX_ITER; iter++) {
        
                //Z^2
                float temp = zr;
                zr = zr * zr - zi * zi;
                zi = 2.0 * zi * temp;
        
                //+C
                zr += cr;
                zi += ci;
        
                if (zr * zr + zi * zi > MAX_SIZE_SQUARED) return iter;
            }
            return MAX_ITER;
        }

        void main(void) {
            
            float x = gl_FragCoord.x / width - 0.5; // -0.5 : 0.5
            float y = (gl_FragCoord.y / height - 0.5) * height / width;

            x *= scale;
            y *= scale;

            x += center.x;
            y += center.y;

            if (iterate(x, y) == MAX_ITER) {
                gl_FragColor = vec4(1,1,1,1);
            } else {
                gl_FragColor = vec4(0,0,0,1);
            }

        }
    `;

     var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
     gl.shaderSource(fragShader, fragCode);
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


     gl.uniform2fv(centerLocation, new Float32Array([-0.77712, 0.126]));
     gl.uniform1f(scaleLocation, 0.01);
     


	var tick = function() {

	  	canvas.width = window.innerWidth;
        gl.uniform1f(heightLocation, canvas.height);
        gl.uniform1f(widthLocation, canvas.width);
	    gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT,0);
        requestAnimationFrame(tick);

	}

	requestAnimationFrame(tick);

}; 