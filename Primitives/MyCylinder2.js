/**
 * MyCylinder2
 * @constructor
 * @param scene - Reference to MyScene object
 * @param id - Object id
 * @param base - Cylinder base radius
 * @param top - Cylinder top radius
 * @param height - Cylinder height
 * @param slices - Cylinder slices
 * @param stacks - Cylinder stacks
 */
class MyCylinder2 extends CGFobject {
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

        this.createNurbs();
        this.initBuffers();
    }
    
    createNurbs(){
        this.makeSurface(1, // degree on U: 2 control vertexes U
            8, // degree on V: 9 control vertexes on V
            [
                [
                    [       0.0, -this.base, 0.0,                1.0],
                    [-this.base, -this.base, 0.0, Math.sqrt(2) / 2.0],
                    [-this.base,        0.0, 0.0,                1.0],
                    [-this.base,  this.base, 0.0, Math.sqrt(2) / 2.0],
                    [       0.0,  this.base, 0.0,                1.0],
                    [ this.base,  this.base, 0.0, Math.sqrt(2) / 2.0],
                    [ this.base,        0.0, 0.0,                1.0],
                    [ this.base, -this.base, 0.0, Math.sqrt(2) / 2.0],
                    [       0.0, -this.base, 0.0,                1.0]                
                ],
                [
                    [      0.0, -this.top, this.height,                1.0],
                    [-this.top, -this.top, this.height, Math.sqrt(2) / 2.0],
                    [-this.top,       0.0, this.height,                1.0],
                    [-this.top,  this.top, this.height, Math.sqrt(2) / 2.0],
                    [      0.0,  this.top, this.height,                1.0],
                    [ this.top,  this.top, this.height, Math.sqrt(2) / 2.0],
                    [ this.top,       0.0, this.height,                1.0],
                    [ this.top, -this.top, this.height, Math.sqrt(2) / 2.0],
                    [      0.0, -this.top, this.height,                1.0]                 
                ]
            ],
            );

    }

	makeSurface(degree1, degree2, controlvertexes) {
			
		var nurbsSurface = new CGFnurbsSurface(degree1, degree2, controlvertexes);

		this.cyl = new CGFnurbsObject(this.scene, this.slices, this.stacks, nurbsSurface ); // must provide an object with the function getPoint(u, v) (CGFnurbsSurface has it)

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

	display() {
		this.cyl.display();
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