/**
 * MySecurityCamera
 * @constructor
 * @param scene - Reference to MyScene object
 */
class MySecurityCamera extends CGFobject {
		constructor(scene) {
		super(scene);

		this.rectangle = new MyRectangle(this.scene, 1, 0.5, 1, -1, -0.5);

		this.securityShader = new CGFshader(this.scene.gl, "SecurityCamera/security.vert", "SecurityCamera/security.frag");
		this.securityShader.setUniformsValues({ uSampler: 1 });

		this.noShader = new CGFshader(this.scene.gl, "SecurityCamera/none.vert", "SecurityCamera/none.frag");
		this.noShader.setUniformsValues({ uSampler: 1 });
	}

	display(){
		this.scene.RTT.bind();
		this.scene.pushMatrix();
		this.scene.setActiveShader(this.securityShader);
		this.rectangle.display();
		this.scene.setActiveShader(this.noShader);
		this.scene.pushMatrix();
	}
}