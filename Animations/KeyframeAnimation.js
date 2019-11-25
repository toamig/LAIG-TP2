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
        var delta;
        var fraction;

        if(this.keyframes.length == 1){

            delta = this.keyframes[this.currentKeyframe][0];
            fraction = this.timeElapsed / delta;

            var translateX = this.keyframes[this.currentKeyframe][1][0] * fraction;
            var translateY = this.keyframes[this.currentKeyframe][1][1] * fraction;
            var translateZ = this.keyframes[this.currentKeyframe][1][2] * fraction;

            var rotateX = this.keyframes[this.currentKeyframe][2][0] * fraction;
            var rotateY = this.keyframes[this.currentKeyframe][2][1] * fraction;
            var rotateZ = this.keyframes[this.currentKeyframe][2][2] * fraction;

            var scaleX = 1 + (this.keyframes[this.currentKeyframe][3][0] - 1) * fraction;
            var scaleY = 1 + (this.keyframes[this.currentKeyframe][3][1] - 1) * fraction;
            var scaleZ = 1 + (this.keyframes[this.currentKeyframe][3][2] - 1) * fraction;

            this.currentTranslate = [translateX, translateY, translateZ];
            this.currentRotate = [rotateX, rotateY, rotateZ];
            this.currentScale = [scaleX, scaleY, scaleZ];
                
            if(this.timeElapsed > this.keyframes[this.currentKeyframe][0]){

                this.currentTranslate = this.keyframes[this.currentKeyframe][1];
                this.currentRotate = this.keyframes[this.currentKeyframe][2];
                this.currentScale = this.keyframes[this.currentKeyframe][3];

            }    
        
        }

        else if(this.currentKeyframe == this.keyframes.length-1){

            if(this.timeElapsed < this.keyframes[this.currentKeyframe][0]){

                delta = (this.keyframes[this.currentKeyframe][0] - this.keyframes[this.currentKeyframe - 1][0]) || (this.keyframes[this.currentKeyframe][0]);
                fraction = (this.timeElapsed - this.keyframes[this.currentKeyframe - 1][0]) / delta;

                var translateX = this.keyframes[this.currentKeyframe - 1][1][0] + (this.keyframes[this.currentKeyframe][1][0] - this.keyframes[this.currentKeyframe - 1][1][0]) * fraction;
                var translateY = this.keyframes[this.currentKeyframe - 1][1][1] + (this.keyframes[this.currentKeyframe][1][1] - this.keyframes[this.currentKeyframe - 1][1][1]) * fraction;
                var translateZ = this.keyframes[this.currentKeyframe - 1][1][2] + (this.keyframes[this.currentKeyframe][1][2] - this.keyframes[this.currentKeyframe - 1][1][2]) * fraction;

                var rotateX = this.keyframes[this.currentKeyframe - 1][2][0] + (this.keyframes[this.currentKeyframe][2][0] - this.keyframes[this.currentKeyframe - 1][2][0]) * fraction;
                var rotateY = this.keyframes[this.currentKeyframe - 1][2][1] + (this.keyframes[this.currentKeyframe][2][1] - this.keyframes[this.currentKeyframe - 1][2][1]) * fraction;
                var rotateZ = this.keyframes[this.currentKeyframe - 1][2][2] + (this.keyframes[this.currentKeyframe][2][2] - this.keyframes[this.currentKeyframe - 1][2][2]) * fraction;

                var scaleX = this.keyframes[this.currentKeyframe - 1][3][0] + (this.keyframes[this.currentKeyframe][3][0] - this.keyframes[this.currentKeyframe - 1][3][0]) * fraction;
                var scaleY = this.keyframes[this.currentKeyframe - 1][3][1] + (this.keyframes[this.currentKeyframe][3][1] - this.keyframes[this.currentKeyframe - 1][3][1]) * fraction;
                var scaleZ = this.keyframes[this.currentKeyframe - 1][3][2] + (this.keyframes[this.currentKeyframe][3][2] - this.keyframes[this.currentKeyframe - 1][3][2]) * fraction;
                
                this.currentTranslate = [translateX, translateY, translateZ];
                this.currentRotate = [rotateX, rotateY, rotateZ];
                this.currentScale = [scaleX, scaleY, scaleZ];

            }
            else{

                this.currentTranslate = this.keyframes[this.currentKeyframe][1];
                this.currentRotate = this.keyframes[this.currentKeyframe][2];
                this.currentScale = this.keyframes[this.currentKeyframe][3];

            }
                        

        }
        else if(this.currentKeyframe == 0){

            delta = this.keyframes[this.currentKeyframe][0];
            fraction = this.timeElapsed / delta;

            var translateX = this.keyframes[this.currentKeyframe][1][0] * fraction;
            var translateY = this.keyframes[this.currentKeyframe][1][1] * fraction;
            var translateZ = this.keyframes[this.currentKeyframe][1][2] * fraction;

            var rotateX = this.keyframes[this.currentKeyframe][2][0] * fraction;
            var rotateY = this.keyframes[this.currentKeyframe][2][1] * fraction;
            var rotateZ = this.keyframes[this.currentKeyframe][2][2] * fraction;

            var scaleX = 1 + (this.keyframes[this.currentKeyframe][3][0] - 1) * fraction;
            var scaleY = 1 + (this.keyframes[this.currentKeyframe][3][1] - 1) * fraction;
            var scaleZ = 1 + (this.keyframes[this.currentKeyframe][3][2] - 1) * fraction;

            this.currentTranslate = [translateX, translateY, translateZ];
            this.currentRotate = [rotateX, rotateY, rotateZ];
            this.currentScale = [scaleX, scaleY, scaleZ];
                
            if(this.timeElapsed > this.keyframes[this.currentKeyframe][0]){
                this.currentKeyframe++;
            }    

        }
        else{

            delta = (this.keyframes[this.currentKeyframe][0] - this.keyframes[this.currentKeyframe - 1][0]) || (this.keyframes[this.currentKeyframe][0]);
            fraction = (this.timeElapsed - this.keyframes[this.currentKeyframe - 1][0]) / delta;

            var translateX = this.keyframes[this.currentKeyframe - 1][1][0] + (this.keyframes[this.currentKeyframe][1][0] - this.keyframes[this.currentKeyframe - 1][1][0]) * fraction;
            var translateY = this.keyframes[this.currentKeyframe - 1][1][1] + (this.keyframes[this.currentKeyframe][1][1] - this.keyframes[this.currentKeyframe - 1][1][1]) * fraction;
            var translateZ = this.keyframes[this.currentKeyframe - 1][1][2] + (this.keyframes[this.currentKeyframe][1][2] - this.keyframes[this.currentKeyframe - 1][1][2]) * fraction;

            var rotateX = this.keyframes[this.currentKeyframe - 1][2][0] + (this.keyframes[this.currentKeyframe][2][0] - this.keyframes[this.currentKeyframe - 1][2][0]) * fraction;
            var rotateY = this.keyframes[this.currentKeyframe - 1][2][1] + (this.keyframes[this.currentKeyframe][2][1] - this.keyframes[this.currentKeyframe - 1][2][1]) * fraction;
            var rotateZ = this.keyframes[this.currentKeyframe - 1][2][2] + (this.keyframes[this.currentKeyframe][2][2] - this.keyframes[this.currentKeyframe - 1][2][2]) * fraction;

            var scaleX = this.keyframes[this.currentKeyframe - 1][3][0] + (this.keyframes[this.currentKeyframe][3][0] - this.keyframes[this.currentKeyframe - 1][3][0]) * fraction;
            var scaleY = this.keyframes[this.currentKeyframe - 1][3][1] + (this.keyframes[this.currentKeyframe][3][1] - this.keyframes[this.currentKeyframe - 1][3][1]) * fraction;
            var scaleZ = this.keyframes[this.currentKeyframe - 1][3][2] + (this.keyframes[this.currentKeyframe][3][2] - this.keyframes[this.currentKeyframe - 1][3][2]) * fraction;

            this.currentTranslate = [translateX, translateY, translateZ];
            this.currentRotate = [rotateX, rotateY, rotateZ];
            this.currentScale = [scaleX, scaleY, scaleZ];
            
            if(this.timeElapsed > this.keyframes[this.currentKeyframe][0]){
                this.currentKeyframe++;
            }

        }
    
    }

    apply(){

        this.scene.translate(...this.currentTranslate);
        this.scene.rotate(this.currentRotate[0]*DEGREE_TO_RAD, 1, 0, 0);
        this.scene.rotate(this.currentRotate[1]*DEGREE_TO_RAD, 0, 1, 0);
        this.scene.rotate(this.currentRotate[2]*DEGREE_TO_RAD, 0, 0, 1);
        this.scene.scale(...this.currentScale);
        
        
    }
}