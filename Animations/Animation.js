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
        
    }
}