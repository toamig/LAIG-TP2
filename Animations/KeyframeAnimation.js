var DEGREE_TO_RAD = Math.PI / 180;

/**
 * KeyframeAnimation
 * @constructor
 */
class KeyframeAnimation extends Animation{
    constructor(scene, id, keyframes) {
        super(scene);
        this.id = id;
        this.keyframes = keyframes;
        this.currentKeyframe = 0;
        this.currentTranslate = [0, 0, 0];
        this.currentRotate = [0, 0, 0];
        this.currentScale = [1, 1, 1];

    }

    update(deltaTime){
        this.timeElapsed += deltaTime;
        if(this.currentKeyframe == this.keyframes.length-1){
            this.currentTranslate = this.keyframes[this.currentKeyframe][1];
            this.currentRotate = this.keyframes[this.currentKeyframe][2];
            this.currentScale = this.keyframes[this.currentKeyframe][3];

        }
        else if (this.timeElapsed > this.keyframes[this.currentKeyframe][0]){
            this.currentKeyframe++;
        }
        else{

            if(this.currentKeyframe != 0){
                
                var delta = (this.keyframes[this.currentKeyframe][0] - this.keyframes[this.currentKeyframe - 1][0]) || (this.keyframes[this.currentKeyframe][0]);
                var fraction = (this.timeElapsed - this.keyframes[this.currentKeyframe][0]) / delta;

                var translateX = ((this.keyframes[this.currentKeyframe][1][0] - this.keyframes[this.currentKeyframe - 1][1][0]) * fraction) || (this.keyframes[this.currentKeyframe][1][0] * fraction);
                var translateY = ((this.keyframes[this.currentKeyframe][1][1] - this.keyframes[this.currentKeyframe - 1][1][1]) * fraction) || (this.keyframes[this.currentKeyframe][1][1] * fraction);
                var translateZ = ((this.keyframes[this.currentKeyframe][1][2] - this.keyframes[this.currentKeyframe - 1][1][2]) * fraction) || (this.keyframes[this.currentKeyframe][1][2] * fraction);

                var rotateX = ((this.keyframes[this.currentKeyframe][2][0] - this.keyframes[this.currentKeyframe - 1][2][0]) * fraction) || (this.keyframes[this.currentKeyframe][2][0] * fraction);
                var rotateY = ((this.keyframes[this.currentKeyframe][2][1] - this.keyframes[this.currentKeyframe - 1][2][1]) * fraction) || (this.keyframes[this.currentKeyframe][2][1] * fraction);
                var rotateZ = ((this.keyframes[this.currentKeyframe][2][2] - this.keyframes[this.currentKeyframe - 1][2][2]) * fraction) || (this.keyframes[this.currentKeyframe][2][2] * fraction);

                var scaleX = ((this.keyframes[this.currentKeyframe][2][0] - this.keyframes[this.currentKeyframe - 1][2][0]) * fraction) || ((this.keyframes[this.currentKeyframe][2][0] - 1) * fraction);
                var scaleY = ((this.keyframes[this.currentKeyframe][2][1] - this.keyframes[this.currentKeyframe - 1][2][1]) * fraction) || ((this.keyframes[this.currentKeyframe][2][1] - 1) * fraction);
                var scaleZ = ((this.keyframes[this.currentKeyframe][2][2] - this.keyframes[this.currentKeyframe - 1][2][2]) * fraction) || ((this.keyframes[this.currentKeyframe][2][2] - 1) * fraction);

            }
            else{

                var delta = this.keyframes[this.currentKeyframe][0];
                var fraction = (this.timeElapsed - this.keyframes[this.currentKeyframe][0]) / delta;

                var translateX = this.keyframes[this.currentKeyframe][1][0] * fraction;
                var translateY = this.keyframes[this.currentKeyframe][1][1] * fraction;
                var translateZ = this.keyframes[this.currentKeyframe][1][2] * fraction;
    
                var rotateX = this.keyframes[this.currentKeyframe][2][0] * fraction;
                var rotateY = this.keyframes[this.currentKeyframe][2][1] * fraction;
                var rotateZ = this.keyframes[this.currentKeyframe][2][2] * fraction;
    
                var scaleX = (this.keyframes[this.currentKeyframe][2][0] - 1) * fraction;
                var scaleY = (this.keyframes[this.currentKeyframe][2][1] - 1) * fraction;
                var scaleZ = (this.keyframes[this.currentKeyframe][2][2] - 1) * fraction;
            }
            
            this.currentTranslate = [translateX, translateY, translateZ];
            this.currentRotate = [rotateX, rotateY, rotateZ];
            this.currentScale = [scaleX, scaleY, scaleZ];

        }
    }

    apply(){
        //var translateMatrix = mat4.create();

        this.scene.translate(...this.currentTranslate);
        this.scene.rotate(this.currentRotate[0], 1, 0, 0);
        this.scene.rotate(this.currentRotate[1], 0, 1, 0);
        this.scene.rotate(this.currentRotate[2], 0, 0, 1);
        this.scene.scale(...this.currentScale);
    }
}