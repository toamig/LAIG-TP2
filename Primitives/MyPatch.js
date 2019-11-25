/**
 * MyPatch
 * @constructor
 * @param scene - Reference to MyScene object
 * @param id - Object id
 * @param npointsU - Degree in U
 * @param npointsV - Degree in V
 * @param npartsU - U divisions
 * @param npartsV - V divisions
 * @param controlPoints - Array of control points
 */
class MyPatch extends CGFobject {
    constructor(scene, id, npointsU, npointsV, npartsU, npartsV, controlPoints){
        super(scene);
        this.id = id;
        this.npointsU = npointsU;
        this.npointsV = npointsV;
        this.npartsU = npartsU;
        this.npartsV = npartsV;
        this.controlPoints = controlPoints;

        var nurbsSurface = new CGFnurbsSurface(this.npointsU - 1, this.npointsV - 1, this.controlPoints);
        this.patch = new CGFnurbsObject(this.scene, this.npartsU, this.npartsV, nurbsSurface);
        
    }

    changeCoords(s, t){
        this.length_s = s;
		this.length_t = t;
		this.updateTexCoords([0, 1/this.length_t,
			1/this.length_s, 1/this.length_t,
			0, 0,
			1/this.length_s, 0]);
	} 
    
    display()
    {
        this.patch.display();        
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