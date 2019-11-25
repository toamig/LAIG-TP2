var DEGREE_TO_RAD = Math.PI / 180;

/**
 * XMLscene class, representing the scene that is to be rendered.
 */
class XMLscene extends CGFscene {
    /**
     * @constructor
     * @param {MyInterface} myinterface 
     */
    constructor(myinterface) {
        super();

        this.interface = myinterface;
        this.lightsOn = [];
        this.keyToLight = [];
        
    }

    /**
     * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
     * @param {CGFApplication} application
     */
    init(application) {
        super.init(application);

        this.sceneInited = false;

        this.initCameras();

        this.enableTextures(true);

        this.gl.clearDepth(100.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);

        this.axis = new CGFaxis(this);
        this.setUpdatePeriod(50);

        this.RTT = new CGFtextureRTT(this, this.gl.canvas.width, this.gl.canvas.height);
        this.rectangle = new MySecurityCamera(this);

        //Variables connected to MyInterface
        this.activeCamera = 'defaultCamera';
        this.securityCam = 'securityCamera';
        
        
    }

    /** 
     * Called by interface to update the camera.
     */
    updateView(){
        this.InterfaceCamera = this.graph.views[this.activeCamera];
        this.camera = this.InterfaceCamera;
        this.interface.setActiveCamera(this.camera);
    }
    /** 
     * Called by interface to update the security camera.
     */
    updateSecurityView(){
        this.security = this.graph.views[this.securityCam];
    }
    /**
     * Initializes the scene cameras.
     */
    initCameras() {
        this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
        this.security = new CGFcamera(0.7, 0.1, 500, vec3.fromValues(45, 23, 15), vec3.fromValues(13, 3, 15));
    }
    /**
     * Initializes the scene lights with the values read from the XML file.
     */
    initLights() {
        var i = 0;
        // Lights index.

        // Reads the lights from the scene graph.
        for (var key in this.graph.lights) {
            if (i >= 8)
                break;              // Only eight lights allowed by WebGL.

            if (this.graph.lights.hasOwnProperty(key)) {
                var light = this.graph.lights[key];

                this.lights[i].setPosition(light[2][0], light[2][1], light[2][2], light[2][3]);
                this.lights[i].setAmbient(light[3][0], light[3][1], light[3][2], light[3][3]);
                this.lights[i].setDiffuse(light[4][0], light[4][1], light[4][2], light[4][3]);
                this.lights[i].setSpecular(light[5][0], light[5][1], light[5][2], light[5][3]);

                if (light[1] == "spot") {
                    this.lights[i].setSpotCutOff(light[6]);
                    this.lights[i].setSpotExponent(light[7]);
                    this.lights[i].setSpotDirection(light[8][0], light[8][1], light[8][2]);
                }

                switch (light[6]){
                    case "constant": 
                        this.lights[i].setConstantAttenuation(light[7]);
                        break;
                    case "linear": 
                        this.lights[i].setLinearAttenuation(light[7]);
                        break;
                    case "quadratic": 
                        this.lights[i].setQuadraticAttenuation(light[7]);
                        break;
                }

                this.lights[i].setVisible(true);
                if (light[0])
                    this.lights[i].enable();
                else
                    this.lights[i].disable();

                this.lights[i].update();

                this.keyToLight[key] = i;

                i++;
            }
        }
    }

    setDefaultAppearance() {
        this.setAmbient(0.2, 0.4, 0.8, 1.0);
        this.setDiffuse(0.2, 0.4, 0.8, 1.0);
        this.setSpecular(0.2, 0.4, 0.8, 1.0);
        this.setShininess(10.0);
    }
    /** Handler called when the graph is finally loaded. 
     * As loading is asynchronous, this may be called already after the application has started the run loop
     */
    onGraphLoaded() {
        this.axis = new CGFaxis(this, this.graph.referenceLength);

        this.gl.clearColor(this.graph.background[0], this.graph.background[1], this.graph.background[2], this.graph.background[3]);

        this.setGlobalAmbientLight(this.graph.ambient[0], this.graph.ambient[1], this.graph.ambient[2], this.graph.ambient[3]);

        this.initLights();

        this.interface.addViewsGroup(this.graph.views);
        this.updateView();
        this.updateSecurityView();

        this.interface.addLightController(this.graph.lights);

        this.sceneInited = true;

        
    }

    update(time){
		this.deltaTime = (time - this.lastTime)/1000 || 0;
        this.lastTime = time;

        for (var key in this.graph.animations) {
            this.graph.animations[key].update(this.deltaTime);
        }

		this.rectangle.securityShader.setUniformsValues({ timeFactor: time / 100 % (1000*Math.PI) });
    }

    /**
     * Displays rendered scene.
     */
    display() {
        
        this.RTT.attachToFrameBuffer();
        if(this.sceneInited)
            this.updateSecurityView();
            this.render(this.security);
        this.RTT.detachFromFrameBuffer();

        if(this.sceneInited)
            this.render(this.InterfaceCamera);

        this.gl.disable(this.gl.DEPTH_TEST);
        this.rectangle.display();
        this.gl.enable(this.gl.DEPTH_TEST);   
        
        
    }

    /**
     * Renders the scene.
     */
    render(currentCamera) {
        // ---- BEGIN Background, camera and axis setup
        if(this.sceneInited)
            this.camera = currentCamera;
            this.interface.setActiveCamera(currentCamera);

        // Clear image and depth buffer everytime we update the scene
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // Initialize Model-View matrix as identity (no transformation
        this.updateProjectionMatrix();
        this.loadIdentity();

        // Apply transformations corresponding to the camera position relative to the origin
        this.applyViewMatrix();

        this.pushMatrix();
        this.axis.display();

        for (var key in this.lightsOn) {
            var i = this.keyToLight[key];
            if(this.lightsOn[key]){
                this.lights[i].setVisible(true);
                this.lights[i].enable();
            }
            else{
                this.lights[i].setVisible(false);
                this.lights[i].disable();
            }
            this.lights[i].update();
        }

        if (this.sceneInited) {
            // Draw axis
            this.setDefaultAppearance();

            // Displays the scene (MySceneGraph function).
            this.graph.displayScene();
        }

        this.popMatrix();
        // ---- END Background, camera and axis setup
    }
}