/**
 * KeyframeAnimation
 * @constructor
 * @param scene - Reference to MyScene object
 */
class Animation {
    constructor(scene)
    {
        this.scene = scene;
        this.timeElapsed = 0;
    }

    update(deltaTime) {
        this.timeElapsed += deltaTime;
    }

    apply() {
        if(this.final) {
            this.finalMatrix = this.matrixAni;
            this.scene.multMatrix(this.finalMatrix);
        }
        else{
            this.scene.multMatrix(this.matrixAni);
        }
    }
}