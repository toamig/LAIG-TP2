/**
 * MyComponent
 * @constructor
 * @param graph - Reference to MyScene graph
 * @param global - Component information
 */
class MyComponent{

    constructor(graph, global){
        this.graph = graph;
        this.id = global[0]
        this.transformations = global[1];
        this.materials = global[2];
        this.texture = global[3];
        this.children = global[4];
        this.animation = global[5];

        this.actualMat = this.actualMat || this.graph.materials[this.materials[this.graph.currentMaterial%this.materials.length]]; 
        this.actualTex = this.actualTex || this.graph.textures[this.texture[0]];
        this.length_s = this.length_s || this.texture[1];
        this.length_t = this.length_t || this.texture[2];       
    }

    

    display(){
        
        switch(this.materials[this.graph.currentMaterial%this.materials.length]){
            case 'inherit':
                if(Array.isArray(this.texture)){
                    this.actualMat.setTexture(this.graph.textures[this.texture[0]]);
                }
                else{
                    switch(this.texture){
                        case 'none':
                            this.actualMat.setTexture(null);
                            break;
                        case 'inherit':
                            this.actualMat.setTexture(this.actualTex);
                            break;
                        default:
                            break;
                            
                    }
                }
                this.actualMat.setTextureWrap('REPEAT', 'REPEAT');
                this.actualMat.apply();  
                break;
            default:
                if(Array.isArray(this.texture)){
                    //this.graph.materials[this.materials[this.graph.currentMaterial%this.materials.length]].setTexture(this.actualTex);
                    this.graph.materials[this.materials[this.graph.currentMaterial%this.materials.length]].setTexture(this.graph.textures[this.texture[0]]);
                }
                else{
                    switch(this.texture){
                        case 'none':
                            this.graph.materials[this.materials[this.graph.currentMaterial%this.materials.length]].setTexture(null);
                            break;
                        case 'inherit':
                            this.graph.materials[this.materials[this.graph.currentMaterial%this.materials.length]].setTexture(this.actualTex);
                            break;
                        default:
                            break;
                    }
                }
                this.graph.materials[this.materials[this.graph.currentMaterial%this.materials.length]].setTextureWrap('REPEAT', 'REPEAT');
                this.graph.materials[this.materials[this.graph.currentMaterial%this.materials.length]].apply();  
                break;
        }

        


        this.graph.scene.pushMatrix(); 

        console.log(this.id);
        console.log(this.graph.nodes[this.children[0]]);
        if(this.graph.nodes[this.children[0]].constructor.name != 'MyComponent'){

            if(this.animation.length){
                this.animation[0].apply();
            }

            for(var transfkey in this.transformations){
                this.graph.scene.multMatrix(this.transformations[transfkey]);
            }
            
        }
        else{
            
            for(var transfkey in this.transformations){
                this.graph.scene.multMatrix(this.transformations[transfkey]);
            }

            if(this.animation.length){
                this.animation[0].apply();
            }

        }                


        for(var key in this.children) {
            if(this.graph.nodes[this.children[key]].constructor.name == 'MyComponent'){

                switch(this.graph.materials[this.materials[this.graph.currentMaterial%this.materials.length]]){
                    case 'inherit': 
                        this.graph.nodes[this.children[key]].setCurrentMaterial(this.actualMat);
                        break;
                    default:
                        this.graph.nodes[this.children[key]].setCurrentMaterial(this.graph.materials[this.materials[this.graph.currentMaterial%this.materials.length]]);
                        break;
                }
                if(Array.isArray(this.texture)){
                    this.graph.nodes[this.children[key]].setCurrentTexture(this.graph.textures[this.texture[0]]);
                    this.graph.nodes[this.children[key]].setTextureCoords(this.texture[1], this.texture[2]);
                }
                else{
                    switch(this.texture){
                        case 'none':
                                this.graph.nodes[this.children[key]].setCurrentTexture(null);
                            break;
                        case 'inherit':
                                this.graph.nodes[this.children[key]].setCurrentTexture(this.actualTex);
                                this.graph.nodes[this.children[key]].setTextureCoords(this.length_s, this.length_t);
                            break;
                        default:
                            break;
                    }
                }
            }
            else{
                this.graph.nodes[this.children[key]].changeCoords(this.length_s, this.length_t);
            }
            
            this.graph.nodes[this.children[key]].display();
        }

        this.graph.scene.popMatrix();
    }

    setCurrentMaterial(mat){
        this.actualMat = mat;
    }

    setCurrentTexture(tex){
        this.actualTex = tex;
    }

    setTextureCoords(s, t){
        this.length_s = s;
        this.length_t = t;
    }
}

