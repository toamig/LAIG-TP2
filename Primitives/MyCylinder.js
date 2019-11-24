/**
 * MyCylinder
 * @constructor
 * @param scene - Reference to MyScene object
 * @param base - Cylinder base radius
 * @param top - Cylinder top radius
 * @param height - Cylinder height
 * @param slices - Cylinder slices
 * @param stacks - Cylinder stacks
 */

class MyCylinder extends CGFobject {
	constructor(scene, id, base, top, height, slices, stacks) {
		super(scene);
		this.id = id;
		this.base = base;
		this.top = top;
		this.height = height;
		this.slices = slices;
		this.stacks = stacks;
		this.length_s = 1;
		this.length_t = 1;

		this.initBuffers();
	}

	initBuffers() {
		this.vertices = [];
        this.indices = [];
        this.normals = [];
		this.texCoords = [];
		
		var delta_ang_slice =-(2*Math.PI)/this.slices;  // sentido negativo??? Angle variation in each slice
		var delta_z = this.height/this.stacks; 			// Stack's height
		var delta_radius;								// Radius variation in each stack
		var normal_ang;									// Angle between cylinder's normal and XOY plane 
		var delta = Math.abs(this.top-this.base);		// Difference between top and base radius
		this.delta_s = 1/this.slices;
		this.delta_t = 1/this.stacks;
		
		// Initial values
		var radius = this.base;
		var z = 0;
		var s = 0;
		var t = 0; 

		if(this.top > this.base){
			delta_radius = (delta_z * delta)/this.height;
		}
		else{
			delta_radius = -(delta_z * delta)/this.height;
		}

		var alpha = Math.atan(delta/this.height);
		var beta = Math.PI/2 - alpha;
		normal_ang = Math.PI-(beta+Math.PI/2);
		
		for(var i = 0; i < this.stacks + 1; i++){
			
			s = 0

			var ang_slice = 0;

			for(var j = 0; j < this.slices + 1; j++){
				this.vertices.push(Math.cos(ang_slice)*radius,Math.sin(ang_slice)*radius,z);
			
				this.normals.push(Math.cos(ang_slice),Math.sin(ang_slice),Math.sin(normal_ang));

				this.texCoords.push(s,t);

				ang_slice += delta_ang_slice;

				s += this.delta_s;
			}

			radius += delta_radius;

			z += delta_z;

			t += this.delta_t;
		}

		for (var i = 0; i < this.stacks ; i++) {

			for (var j = 0; j < this.slices ; j++) {

				this.indices.push(i*(this.slices+1)+j+1,i*(this.slices+1)+j,(i+1)*(this.slices+1)+(j+1));
				
				this.indices.push((i+1)*(this.slices+1)+(j+1),i*(this.slices+1)+j,(i+1)*(this.slices+1)+j);
			}
		}
		
		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	}

	changeCoords(s, t){
		this.length_s = s;
		this.length_t = t;
		var newCoords = []
		var tt = 0
		for(var i = 0; i < this.stacks + 1; i++){
			var ss = 0
			for(var j = 0; j < this.slices + 1; j++){
				newCoords.push(ss/this.length_s,tt/this.length_t);
				ss += this.delta_s;
			}
			tt += this.delta_t;
		}
		this.updateTexCoords(newCoords);
	} 

	/**
	 * @method updateTexCoords
	 * Updates the list of texture coordinates of the rectangle
	 * @param {Array} coords - Array of texture coordinates
	 */
	updateTexCoords(coords) {
		this.texCoords = [...coords];
		this.updateTexCoordsGLBuffers();
	}
}