var tinker1FragCode = `
precision mediump float;

uniform vec2 mouseLocation;
uniform float width;
uniform float height;
uniform float time;

vec3 palette(float t) {

    vec3 a = vec3(0.100, 0.200, 0.600);
    vec3 b = vec3(0.500, 0.500, 0.500);
    vec3 c = vec3(1.000, 1.000, 1.000);
    vec3 d = vec3(0.000, 0.333, 0.667);

    return a + b * cos( 6.28318 * (c * t + d));

}

void main(void) {

    float dx = gl_FragCoord.x - mouseLocation.x;
    float dy = height - gl_FragCoord.y - mouseLocation.y;
    float dist = sqrt(dx*dx + dy*dy);
    
    vec2 uv = (gl_FragCoord.xy * 2.0 - vec2(width, height)) / height;


    uv *= 0.2;
    uv += sin(uv * 30.) / 20.;
    vec2 uv0 = uv;
    vec3 finalColor = vec3(0.0);

    for (float i = 0.0; i < 5.0; i++) {
        uv = fract(uv * pow(1.2, i)) - 0.5;
        float d = length(uv);
        
        vec3 col = palette(time + length(uv0) + i /3.0);
        d = sin(d*8. + time / 3000.)/8.;
        d = abs(d);
        d = 0.02 / d;
        finalColor += col * d;
    }

    
    finalColor = (vec3(1.0) - finalColor) * sin((dist - time / 10.) / 100.);
    
    //finalColor = fract(finalColor + vec3(gl_FragCoord.x / 1000.));
    finalColor.r /= 3.;
    finalColor.g /= 2.;
    finalColor.b *= 2.;
    finalColor += vec3(time / 2000.);
    finalColor = fract(finalColor);
    finalColor.b += 0.5;
    finalColor.r -= 0.5;

    gl_FragColor = vec4(finalColor,1.0);

}

`;

var tinker2FragCode = `
    precision mediump float;

    uniform vec2 mouseLocation;
    uniform float width;
    uniform float height;
    uniform float time;

    float normSin(float f) {
        return sin(f) / 2. + 1.;
    }


    float randomWave(float t) {
        return 
            (normSin(t * 1.5) +
            normSin(t * 3.3) +
            normSin(t * 8.5) +
            normSin(t * 15.3) +
            normSin(t * 27.7)) / 5.;
            
    }

    vec4 toColor(float val, vec2 uv) {
        val -= 0.5;
        return vec4(fract(randomWave(val + time / 10000. + uv.x) * 3.),0.0,fract(randomWave(val + time / 12000. + uv.y) * 3.),1.0);
    }


    void main() {

        vec2 uv = gl_FragCoord.xy / height;
        uv /= 3.;

        float val = 0.;
        val += normSin(uv.x * 50. + time / 1000.);
        val += normSin(uv.y * 60. + time / 9000.);
        val += normSin(uv.x * 40. + time / 1100.);
        val += normSin(uv.y * 30. + time / 1200.);
        val += normSin(uv.x * 20. + time / 1000.);
        val += normSin(uv.y * 10. + time / 9000.);
        val += normSin(uv.x * 20. + time / 1100.);
        val += normSin(uv.y * 30. + time / 1200.);
        val /= 8.;
        
        gl_FragColor = toColor(val, uv);

        float dx = gl_FragCoord.x - mouseLocation.x;
        float dy = gl_FragCoord.y - height + mouseLocation.y;
        float distMouse = sqrt(dx*dx + dy*dy);

        dx = gl_FragCoord.x - width / 2.;
        dy = gl_FragCoord.y - height / 2.;
        float distCenter = sqrt(dx*dx + dy*dy);
        
        if (distMouse < 600.) {
            vec4 other = vec4(gl_FragColor.y, gl_FragColor.x, 1. - gl_FragColor.x, 1.0);
            float lerp = distMouse / 500.;
            gl_FragColor = gl_FragColor * lerp + other * (1. - lerp);
        }

        if (distCenter < 400.) {
            float lerp = distCenter / 400.;
            lerp *= lerp;
            lerp = 1. - lerp;
            gl_FragColor += vec4(vec3(lerp), 1.0);
        }



        
    }

`