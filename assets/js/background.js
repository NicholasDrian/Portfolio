var backgroundFragCode = `
precision highp float;
uniform vec2 center;
uniform vec2 mouseLocation;
uniform float scale;
uniform float width;
uniform float height;
uniform float time;
uniform float scroll;

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

    
    vec2 uv = vec2(gl_FragCoord.x, gl_FragCoord.y + scroll);

    float x = uv.x / width - 0.5; // -0.5 : 0.5
    float y = (uv.y / height - 0.5) * height / width;

    x /= scale;
    y /= scale;

    x += center.x;
    y += center.y;

    int i = iterate(x, y);
    if (i == MAX_ITER) gl_FragColor = vec4(1.0,1.0,1.0,1.0);
    else {

        float dx = gl_FragCoord.x;
        float dy = gl_FragCoord.y;
        float dist = sqrt(dx * dx + dy * dy);

        vec3 color = pallet(mod(float(i) / 50.0, 1.0), dist, i);
        gl_FragColor = vec4(color, 1.0);
    }

    gl_FragColor.xyz *= 0.1;
    gl_FragColor.xyz = vec3(1.0) - gl_FragColor.xyz;

}
`;