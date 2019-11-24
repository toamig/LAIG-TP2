/**
 * MySphere
 * @constructor
 * @param scene - Reference to MyScene object
 * @param radius - Sphere radius
 * @param slices - Sphere slices
 * @param stacks - Sphere stacks
 */
class MySphere extends CGFobject {
	constructor(scene, id, radius, slices, stacks) {
		super(scene);
		this.id = id;
		this.radius = radius;
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

        var delta_ang_slice = (2*Math.PI)/this.slices;
        var delta_ang_stack = (Math.PI/2)/this.stacks;
        var ang_slice = 0;
        var ang_stack = 0;
         
        for(var i = 0; i <= this.stacks; i++){

            ang_slice = 0;
            var stack_radius = this.radius * Math.cos(ang_stack);

            for(var j = 0; j <= this.slices; j++){

                this.vertices.push(stack_radius * Math.cos(ang_slice), stack_radius * Math.sin(ang_slice), this.radius * Math.sin(ang_stack));

                this.normals.push(stack_radius * Math.cos(ang_slice), stack_radius * Math.sin(ang_slice), this.radius * Math.sin(ang_stack));

                this.texCoords.push(j/this.slices,0.5-(0.5*(i/this.stacks)));

                ang_slice += delta_ang_slice;
            }
            ang_stack += delta_ang_stack;
        }

        ang_stack = 0;

        for(var i = 0; i <= this.stacks; i++){

            ang_slice = 0;
            var stack_radius = this.radius * Math.cos(ang_stack);

            for(var j = 0; j <= this.slices; j++){

                this.vertices.push(stack_radius * Math.cos(ang_slice), stack_radius * Math.sin(ang_slice), -this.radius * Math.sin(ang_stack));

                this.normals.push(stack_radius * Math.cos(ang_slice), stack_radius * Math.sin(ang_slice), -this.radius * Math.sin(ang_stack));

                this.texCoords.push(j/(this.slices),0.5+(0.5*(i/this.stacks)));

                ang_slice += delta_ang_slice;
            }
            ang_stack += delta_ang_stack;
        }

        for(var i = 0; i < (this.stacks*2)+1; i++){

            for(var j = 0; j < this.slices; j++){
                if(i < this.stacks){
                    this.indices.push(i*(this.slices+1)+j, (i+1)*(this.slices+1)+(j+1), (i+1)*(this.slices+1)+j);

                    this.indices.push(i*(this.slices+1)+j, i*(this.slices+1)+(j+1), (i+1)*(this.slices+1)+(j+1));
                }
                else if(i > this.stacks){
                    this.indices.push(i*(this.slices+1)+j, (i+1)*(this.slices+1)+j, (i+1)*(this.slices+1)+(j+1));

                    this.indices.push(i*(this.slices+1)+j, (i+1)*(this.slices+1)+(j+1), i*(this.slices+1)+(j+1));
                }
                
            }
        }

		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	}

	changeCoords(s, t){
		this.length_s = s;
        this.length_t = t;
        var newCoords= [];
        for(var i = 0; i <= this.stacks; i++){
            for(var j = 0; j <= this.slices; j++){
                newCoords.push((j/this.slices)/this.length_s,(0.5-(0.5*(i/this.stacks)))/this.length_t);
            }
        }
        for(var i = 0; i <= this.stacks; i++){
            for(var j = 0; j <= this.slices; j++){
                newCoords.push((j/(this.slices))/this.length_s,(0.5+(0.5*(i/this.stacks)))/this.length_t);
            }
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

