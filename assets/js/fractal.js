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
        -0.5,0.5,0.0,
        -0.5,-0.5,0.0,
        0.5,-0.5,0.0, 
     ];
     
     indices = [0,1,2];
     var vertex_buffer = gl.createBuffer();
     gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
     gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
     gl.bindBuffer(gl.ARRAY_BUFFER, null);

     var Index_Buffer = gl.createBuffer();
     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Index_Buffer);
     gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

     var vertCode =
        'attribute vec3 coordinates;' +
            
        'void main(void) {' +
           ' gl_Position = vec4(coordinates, 1.0);' +
        '}';
     var vertShader = gl.createShader(gl.VERTEX_SHADER);
     gl.shaderSource(vertShader, vertCode);
     gl.compileShader(vertShader);

     var fragCode =
        'void main(void) {' +
           ' gl_FragColor = vec4(0.0, 0.0, 0.0, 0.1);' +
        '}';

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


	var tick = function() {

	  	canvas.width = window.innerWidth;
	    gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT,0);
        requestAnimationFrame(tick);

	}

	requestAnimationFrame(tick);

}; 