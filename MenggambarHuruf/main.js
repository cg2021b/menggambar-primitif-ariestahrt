// Global Variable Vertices
var shaderProgram = null;
var gl = null;
var global_vertices = [];

global_vertices.push([
    -0.2,0.0,    1.0,0.0,0.0,
    -0.3,0.0,    1.0,0.0,0.0,
    0.0,0.4,    1.0,0.0,0.0,
    0.0,0.6,    1.0,0.0,0.0,
]);

global_vertices.push([
    math_FindX({x:-0.2, y:0}, {x:0, y:0.4}, 0.2),0.2,    1.0,0.0,0.0,
    0.0,0.2,    1.0,0.0,0.0,
    math_FindX({x:-0.2, y:0}, {x:0, y:0.4}, 0.2),0.3,    1.0,0.0,0.0,
    0.0,0.3,    1.0,0.0,0.0,
]);

a_vertices_mirror = math_TransformByX(0, global_vertices[0], 0, 5);
global_vertices.push(a_vertices_mirror);
a_vertices_2_mirror = math_TransformByX(0, global_vertices[1], 0, 5);
global_vertices.push(a_vertices_2_mirror);

// Initialize a shader program, so WebGL knows how to draw our data
function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    // Create the shader program
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert(
            "Unable to initialize the shader program: " +
            gl.getProgramInfoLog(shaderProgram)
        );
        return null;
    }

    return shaderProgram;
}

// Function to load shader
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    // See if it compiled successfully
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

// Function to initiate buffer
function initBuffer(gl, vertices){
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    return positionBuffer;
}

function drawShape(gl, vertices, program){
    initBuffer(gl, vertices);
    
    var aPosition = gl.getAttribLocation(program, "a_Position");
    var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');
    gl.vertexAttribPointer(
        aPosition, // Attribute Pointer
        2, // Number of elements per attribute
        gl.FLOAT, // Type of Element
        gl.FALSE, // Normalized 
        5 * Float32Array.BYTES_PER_ELEMENT, // Sized of an individual vertex
        0 // Offset from beginning of a single fertex to this attribute
    );

    gl.vertexAttribPointer(
        colorAttribLocation, // Attribute Pointer
        3, // Number of elements per attribute
        gl.FLOAT, // Type of Element
        gl.FALSE, // Normalized 
        5 * Float32Array.BYTES_PER_ELEMENT, // Sized of an individual vertex
        2 * Float32Array.BYTES_PER_ELEMENT // Offset from beginning of a single fertex to this attribute
    );

    gl.enableVertexAttribArray(aPosition);
    gl.enableVertexAttribArray(colorAttribLocation);

    gl.drawArrays(gl.TRIANGLES , 0, 3);
    gl.drawArrays(gl.TRIANGLES , 1, 3);
}

function math_FindX(point1, point2, y){
    x = (y - point1.y)*(point2.x - point1.x)/(point2.y - point1.y) + point1.x;
    return x;
}

function math_TransformByX(x, vertices, offset, vertex_size){
    var vertices_size = parseInt(vertices.length / vertex_size);
    let result = [...vertices];
    for(let i=0; i<vertices_size; i++){
        let index_now = i*vertex_size + offset;
        result[index_now] = (result[index_now] + x)*-1;
    }
    return result;
}

function math_TranslateByX(x, vertices, offset, vertex_size){
    var vertices_size = parseInt(vertices.length / vertex_size);
    let result = [...vertices];
    for(let i=0; i<vertices_size; i++){
        let index_now = i*vertex_size + offset;
        result[index_now] = result[index_now] + x;
    }
    return result;
}

function math_TranslateByY(x, vertices, offset, vertex_size){
    var vertices_size = parseInt(vertices.length / vertex_size);
    let result = [...vertices];
    for(let i=0; i<vertices_size; i++){
        let index_now = i*vertex_size + offset + 1;
        result[index_now] = result[index_now] + x;
    }
    return result;
}

function translate(){
    let x_translate_value = $('#translate_x').val();
    let y_translate_value = $('#translate_y').val();

    $('#translate_x_val').html(x_translate_value);
    $('#translate_y_val').html(y_translate_value);

    // Clear Canvas
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // translate all vertices by x and y, then draw it
    global_vertices.forEach((element) => {
        // translate by x and y
        var translated = math_TranslateByX(parseFloat(x_translate_value/100), element, 0, 5);
        translated = math_TranslateByY(parseFloat(y_translate_value/100), translated, 0, 5);
        drawShape(gl, translated, shaderProgram);
    });
}

$( document ).ready(function() {
    var slider_x_translate = document.getElementById('translate_x');
    var slider_y_translate = document.getElementById('translate_y');

    slider_x_translate.addEventListener('input', translate);
    slider_y_translate.addEventListener('input', translate);
});

function main() {
    var canvas = document.getElementById("canvas");
    gl = canvas.getContext("webgl");

    // definisi vertex
    var vertexShaderCode = `
        precision mediump float;

        attribute vec2 a_Position;
        attribute vec3 vertColor;
        varying vec3 fragColor;

        void main(){
            fragColor = vertColor;
            gl_Position = vec4(a_Position, 0.0, 1.0);
        }
    `;
    
    // definisi fragment shader
    var fragmentShaderCode = `
        precision mediump float;
        varying vec3 fragColor;
        void main(){
            gl_FragColor = vec4(fragColor, 1.0);
        }
    `;

    // compile program
    shaderProgram = initShaderProgram(gl, vertexShaderCode, fragmentShaderCode);
    gl.useProgram(shaderProgram);

    // Clear Canvas
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    global_vertices.forEach((element) => {
        drawShape(gl, element, shaderProgram);
    });
}

main();