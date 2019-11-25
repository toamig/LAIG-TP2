/**
 * MyPlane
 * @constructor
 * @param scene - Reference to MyScene object
 * @param id - Object id
 * @param npartsU - U divisions
 * @param npartsU - V divisions
 */
class MyPlane extends CGFobject {
	constructor(scene, id, npartsU, npartsV){
        super(scene);
        this.id = id;
        this.npartsU = npartsU;
        this.npartsV = npartsV;
        this.length_s = 1;
		this.length_t = 1;

        this.createNurbs();
        this.initBuffers();
    }
    
    createNurbs(){
        this.makeSurface(1, // degree on U: 2 control vertexes U
            1, // degree on V: 2 control vertexes on V
            [	[
                    [ 0.5, 0.0, -0.5, 1 ],
                    [ 0.5, 0.0,  0.5, 1 ]							 
                ],
                [
                    [-0.5, 0.0, -0.5, 1 ],
                    [-0.5, 0.0,  0.5, 1 ]
                    
                ]
            ] 
            );

    }

	makeSurface(degree1, degree2, controlvertexes) {
			
		var nurbsSurface = new CGFnurbsSurface(degree1, degree2, controlvertexes);

		this.plane = new CGFnurbsObject(this.scene, this.npartsU, this.npartsV, nurbsSurface ); // must provide an object with the function getPoint(u, v) (CGFnurbsSurface has it)

    }
    
    changeCoords(s, t){
		this.length_s = s;
		this.length_t = t;
		this.updateTexCoords([0, 1/this.length_t,
			1/this.length_s, 1/this.length_t,
			0, 0,
			1/this.length_s, 0]);
	}

	display() {
		this.plane.display();
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