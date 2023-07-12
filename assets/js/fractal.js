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
        precision highp float;
        attribute vec3 coordinates;
        void main(void) {
           gl_Position = vec4(coordinates, 1.0);
        }
    `;
     var vertShader = gl.createShader(gl.VERTEX_SHADER);
     gl.shaderSource(vertShader, vertCode);
     gl.compileShader(vertShader);

     var fragCode = `
        precision highp float;
        uniform vec2 center;
        uniform vec2 mouseLocation;
        uniform float scale;
        uniform float width;
        uniform float height;
        uniform float time;

        const int MAX_ITER = 300;
        const float MAX_SIZE_SQUARED = 10.0;
        float MAX_DIST_MOUSE_INFLUANCE = height;

        vec3 pallet(float t, float dist, int i) {
            vec3 a = vec3(0.200, 0.200, 0.300);
            vec3 b = vec3(0.500, 0.500, 0.500);
            vec3 c = vec3(1.000, 1.000, 1.000);
            vec3 d = vec3(
                sin(time * 0.00012345),
                sin(time * -0.00052345),
                cos(time * 0.00001234));

            
            if (dist < MAX_DIST_MOUSE_INFLUANCE) {
                float normalized = (MAX_DIST_MOUSE_INFLUANCE - dist) / MAX_DIST_MOUSE_INFLUANCE;
                normalized *= normalized;

                float wave = (sin(float(i) + time / 100.0) + 1.0) / 2.0 * normalized;

                vec3 res = a + b * cos( 6.28318 * (c + (t + normalized) * d));

                //if (mod(float(i) + time / 100.0, 10.0) < 5.0) {
                //    res -= vec3(normalized, normalized, normalized);
                //}


                res += vec3(wave, wave, wave);

                return res;

            } else {
                return a + b * cos( 6.28318 * (c + t * d));
            }

            
        }

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

            x /= scale;
            y /= scale;

            x += center.x;
            y += center.y;

            int i = iterate(x, y);
            if (i == MAX_ITER) gl_FragColor = vec4(1.0,1.0,1.0,1.0);
            else {

                float dx = gl_FragCoord.x - mouseLocation.x;
                float dy = gl_FragCoord.y + mouseLocation.y - height;
                float dist = sqrt(dx * dx + dy * dy);

                vec3 color = pallet(mod(float(i) / 50.0, 1.0), dist, i);
                gl_FragColor = vec4(color, 1.0);
            }

            float distTitle = max(1.2 * gl_FragCoord.x, 2.0 * (height - gl_FragCoord.y));
            if (distTitle < height) {
                float norm = distTitle / height;

                norm *= norm;
                norm *= norm;


                gl_FragColor += vec4(1.0-norm, 1.0-norm, 1.0-norm, 0.0);
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
     var timeLocation = gl.getUniformLocation(shaderProgram, "time");
     var mouseLocation = gl.getUniformLocation(shaderProgram, 'mouseLocation');

     var center = [-0.981972213, -0.282552557];
    
     window.addEventListener('mousemove', (event) => {
        gl.uniform2fv(mouseLocation, new Float32Array([event.clientX, event.clientY]));
    });

    var iter = 0;

    //var title = document.getElementsByID("title");
    //title.scaleLocatio

	var tick = function() {

        var shiftY = Math.sin(iter / 1000) * 0.01;
        var shiftX = Math.sin(iter / 100) * 0.001;
        var scale = Math.pow(1.1, Math.sin(iter / 600) * 20);
        gl.uniform2fv(centerLocation, new Float32Array([center[0] + shiftX / scale, center[1] + shiftY / scale]));
        gl.uniform1f(scaleLocation, 150 * scale);

	  	canvas.width = window.innerWidth;
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

}; 