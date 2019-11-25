/**
* MyInterface class, creating a GUI interface.
*/
class MyInterface extends CGFinterface {
    /**
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * Initializes the interface.
     * @param {CGFapplication} application
     */
    init(application) {
        super.init(application);

        // init GUI. For more information on the methods, check:
        //  http://workshop.chromeexperiments.com/examples/gui
        this.gui = new dat.GUI();

        // add a group of controls (and open/expand by defult)

        this.initKeys();
        

        return true;
    }

    addViewsGroup(views){
        var viewsGroup = this.gui.addFolder('Views');
        viewsGroup.open();

        var viewIds = Object.keys(views);
        viewsGroup.add(this.scene, 'activeCamera', viewIds).name('Camera').onChange(this.scene.updateView.bind(this.scene));

        var viewIds = Object.keys(views);
        viewsGroup.add(this.scene, 'securityCam', viewIds).name('Security Camera').onChange(this.scene.updateView.bind(this.scene));
        
    }

    addLightController(lights){
        var lightsGroup = this.gui.addFolder('Lights');
        lightsGroup.open();
        
        for (var key in lights) {
            if (lights.hasOwnProperty(key)) {
                this.scene.lightsOn[key] = lights[key][0];
                lightsGroup.add(this.scene.lightsOn, key);
            }
        }
    }

    initKeys() {
        this.scene.gui=this;
        this.processKeyboard=function(){};
        this.activeKeys={};
    }

    processKeyDown(event) {
        this.activeKeys[event.code]=true;
    };

    processKeyUp(event) {
        if(event.code == "KeyM"){
            this.scene.graph.currentMaterial++;
            console.log("m");
        }
        this.activeKeys[event.code]=false;
    };

    isKeyPressed(keyCode) {
        return this.activeKeys[keyCode] || false;
    }

    
}