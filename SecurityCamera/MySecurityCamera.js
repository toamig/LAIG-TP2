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
	}

	display(){
		this.scene.pushMatrix();
		this.scene.setActiveShader(this.securityShader);
		this.scene.RTT.bind();
		this.scene.rotate(Math.PI, 1, 0, 0);
		this.rectangle.display();
		this.scene.setActiveShader(this.scene.defaultShader);
		this.scene.pushMatrix();
	}
}