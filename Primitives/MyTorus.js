/**
 * MyTorus
 * @constructor
 * @param scene - Reference to MyScene object
 * @param inner - The "tube" radius
 * @param outer - Radius of the "circular axis" of the torus
 * @param slices - Torus slices
 * @param loops - Torus loops
 */

class MyTorus extends CGFobject {
	constructor(scene, id, inner, outer, slices, loops) {
		super(scene);
		this.id = id;
		this.slices = slices;
		this.loops = loops;
		this.inner = inner;
		this.outer = outer;
		this.length_s = 1;
		this.length_t = 1;

		this.initBuffers();
	};

	initBuffers() {
		this.vertices = [];
		this.indices = [];
		this.normals = [];
		this.texCoords = [];

		var r = this.inner;
        var R = this.outer;

		for (var i = 0; i <= this.slices; i++) {

			var angInt = i * 2 * Math.PI / this.slices;
			var cosAngInt = Math.cos(angInt);
			var sinAngInt = Math.sin(angInt);

			for (var j = 0; j <= this.loops; j++) {

				var angExt = j * 2 * Math.PI / this.loops;
				var cosAngExt = Math.cos(angExt);
				var sinAngExt = Math.sin(angExt);

				var x = (R + r * cosAngInt) * cosAngExt;
				var y = (R + r * cosAngInt) * sinAngExt;
				var z = r * sinAngInt;
				
				var normx = (r * cosAngInt) * cosAngExt;
				var normy = (r * cosAngInt) * sinAngExt;
                var normz = r * sinAngInt;
                
				var s = (i / this.slices);
				var t = (j / this.loops);

				this.vertices.push(x, y, z);
				this.normals.push(normx, normy, normz);
				this.texCoords.push(s, t);
			}
		}

		for (var i = 0; i < this.slices; i++) {
			for (var j = 0; j < this.loops; j++) {

				var first = (i * (this.loops + 1)) + j;
				var second = first + this.loops + 1;

				this.indices.push(first, second + 1, second);
				this.indices.push(first, first + 1, second + 1);
			}
        }
        this.primitiveType = this.scene.gl.TRIANGLES;
 	    this.initGLBuffers();
	}

	changeCoords(s, t){
		this.length_s = s;
		this.length_t = t;
		var newCoords = []
		for (var i = 0; i <= this.slices; i++) {
			for (var j = 0; j <= this.loops; j++) {
				var ss = (i / this.slices);
				var tt = (j / this.loops);

				newCoords.push(ss/this.length_s, tt/this.length_t);
			}
		}
		this.updateTexCoords(newCoords);
	}
	
	/**
	 * @method updateTexCoords
	 * Updates the list of texture coordinates of the torus
	 * @param {Array} coords - Array of texture coordinates
	 */
	updateTexCoords(coords) {
		this.texCoords = [...coords];
		this.updateTexCoordsGLBuffers();
	}
}