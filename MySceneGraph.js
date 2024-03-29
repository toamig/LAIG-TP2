var DEGREE_TO_RAD = Math.PI / 180;

// Order of the groups in the XML document.
var SCENE_INDEX = 0;
var VIEWS_INDEX = 1;
var GLOBALS_INDEX = 2;
var LIGHTS_INDEX = 3;
var TEXTURES_INDEX = 4;
var MATERIALS_INDEX = 5;
var TRANSFORMATIONS_INDEX = 6;
var ANIMATIONS_INDEX = 7;
var PRIMITIVES_INDEX = 8;
var COMPONENTS_INDEX = 9;

/**
 * MySceneGraph class, representing the scene graph.
 */
class MySceneGraph {
    /**
     * @constructor
     */
    constructor(filename, scene) {
        this.loadedOk = null;

        // Establish bidirectional references between scene and graph.
        this.scene = scene;
        scene.graph = this;

        this.nodes = [];

        this.idRoot = this.idRoot || null;                       // The id of the root element.
        this.referenceLength = this.referenceLength || null;     // Default axis length.
        this.defaultCamera = this.defaultCamera || null;         // The id of the default camera.
        this.currentMaterial = 0;

        this.axisCoords = [];
        this.axisCoords['x'] = [1, 0, 0];
        this.axisCoords['y'] = [0, 1, 0];
        this.axisCoords['z'] = [0, 0, 1];

        // File reading 
        this.reader = new CGFXMLreader(); 

        /*
         * Read the contents of the xml file, and refer to this class for loading and error handlers.
         * After the file is read, the reader calls onXMLReady on this object.
         * If any error occurs, the reader calls onXMLError on this object, with an error message
         */
        this.reader.open('scenes/' + filename, this);
    }

    /*
     * Callback to be executed after successful reading
     */
    onXMLReady() {
        this.log("XML Loading finished.");
        var rootElement = this.reader.xmlDoc.documentElement;

        // Here should go the calls for different functions to parse the various blocks
        var error = this.parseXMLFile(rootElement);

        if (error != null) {
            this.onXMLError(error);
            return;
        }

        this.loadedOk = true;

        // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
        this.scene.onGraphLoaded();
    }

    /**
     * Parses the XML file, processing each block.
     * @param {XML root element} rootElement
     */
    parseXMLFile(rootElement) {
        if (rootElement.nodeName != "lxs")
            return "root tag <lxs> missing";

        var nodes = rootElement.children;

        // Reads the names of the nodes to an auxiliary buffer.
        var nodeNames = [];

        for (var i = 0; i < nodes.length; i++) {
            nodeNames.push(nodes[i].nodeName);
        }

        var error;

        // Processes each node, verifying errors.

        // <scene>
        var index;
        if ((index = nodeNames.indexOf("scene")) == -1)
            return "tag <scene> missing";
        else {
            if (index != SCENE_INDEX)
                this.onXMLMinorError("tag <scene> out of order " + index);

            //Parse scene block
            if ((error = this.parseScene(nodes[index])) != null)
                return error;
        }

        // <views>
        if ((index = nodeNames.indexOf("views")) == -1)
            return "tag <views> missing";
        else {
            if (index != VIEWS_INDEX)
                this.onXMLMinorError("tag <views> out of order");

            //Parse views block
            if ((error = this.parseView(nodes[index])) != null)
                return error;
        }

        // <globals>
        if ((index = nodeNames.indexOf("globals")) == -1)
            return "tag <globals> missing";
        else {
            if (index != GLOBALS_INDEX)
                this.onXMLMinorError("tag <globals> out of order");

            //Parse globals block
            if ((error = this.parseGlobals(nodes[index])) != null)
                return error;
        }

        // <lights>
        if ((index = nodeNames.indexOf("lights")) == -1)
            return "tag <lights> missing";
        else {
            if (index != LIGHTS_INDEX)
                this.onXMLMinorError("tag <lights> out of order");

            //Parse lights block
            if ((error = this.parseLights(nodes[index])) != null)
                return error;
        }
        // <textures>
        if ((index = nodeNames.indexOf("textures")) == -1)
            return "tag <textures> missing";
        else {
            if (index != TEXTURES_INDEX)
                this.onXMLMinorError("tag <textures> out of order");

            //Parse textures block
            if ((error = this.parseTextures(nodes[index])) != null)
                return error;
        }

        // <materials>
        if ((index = nodeNames.indexOf("materials")) == -1)
            return "tag <materials> missing";
        else {
            if (index != MATERIALS_INDEX)
                this.onXMLMinorError("tag <materials> out of order");

            //Parse materials block
            if ((error = this.parseMaterials(nodes[index])) != null)
                return error;
        }

        // <transformations>
        if ((index = nodeNames.indexOf("transformations")) == -1)
            return "tag <transformations> missing";
        else {
            if (index != TRANSFORMATIONS_INDEX)
                this.onXMLMinorError("tag <transformations> out of order");

            //Parse transformations block
            if ((error = this.parseTransformations(nodes[index])) != null)
                return error;
        }

        // <animations>
        if ((index = nodeNames.indexOf("animations")) == -1)
            return "tag <animations> missing";
        else {
            if (index != ANIMATIONS_INDEX)
                this.onXMLMinorError("tag <animations> out of order");
    
            //Parse primitives block
            if ((error = this.parseAnimations(nodes[index])) != null)
                return error;
        }

        // <primitives>
        if ((index = nodeNames.indexOf("primitives")) == -1)
            return "tag <primitives> missing";
        else {
            if (index != PRIMITIVES_INDEX)
                this.onXMLMinorError("tag <primitives> out of order");

            //Parse primitives block
            if ((error = this.parsePrimitives(nodes[index])) != null)
                return error;
        }

        // <components>
        if ((index = nodeNames.indexOf("components")) == -1)
            return "tag <components> missing";
        else {
            if (index != COMPONENTS_INDEX)
                this.onXMLMinorError("tag <components> out of order");

            //Parse components block
            if ((error = this.parseComponents(nodes[index])) != null)
                return error;
        }
        this.log("all parsed");
    }

    /**
     * Parses the <scene> block. 
     * @param {scene block element} sceneNode
     */
    parseScene(sceneNode) {

        // Get root of the scene.
        var rootId = this.reader.getString(sceneNode, 'root');
        if (rootId == null)
            return "no root defined for scene";

        this.idRoot = rootId;

        // Get axis length        
        var axis_length = this.reader.getFloat(sceneNode, 'axis_length');
        if (axis_length == null)
            this.onXMLMinorError("no axis_length defined for scene; assuming 'length = 1'");

        this.referenceLength = axis_length || 1;

        this.log("Parsed scene");

        return null;
    }

    /**
     * Parses the <views> block.
     * @param {view block element} viewsNode
     */
    parseView(viewsNode) {
        var children = viewsNode.children;

        this.views = [];
        var numViews = 0;

        var grandChildren = [];
        var nodeNames = [];

        // Any number of views.
        for (var i = 0; i < children.length; i++) {

            // Storing view information
            var global = [];
            var attributeNames = [];

            //Check type of view
            if (children[i].nodeName != "perspective" && children[i].nodeName != "ortho") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }
            else {
                attributeNames.push(...["from", "to"]);
            }

            // Get id of the current view.
            var viewId = this.reader.getString(children[i], 'id'); 
            if (viewId == null)
                return "no ID defined for view";

            // Checks for repeated IDs.
            if (this.views[viewId] != null)
                return "ID must be unique for each view (conflict: ID = " + viewId + ")";

            if (children[i].nodeName == "perspective"){
                var angle = this.reader.getFloat(children[i], 'angle');
                if (!(angle != null && !isNaN(angle)))
                    return "unable to parse angle of the view for ID = " + viewId;

                global.push(DEGREE_TO_RAD*angle);
            }
            else{
                var leftVal = this.reader.getFloat(children[i], 'left');
                if (!(leftVal != null && !isNaN(leftVal)))
                    return "unable to parse left value of the view for ID = " + viewId;
                
                var rightVal = this.reader.getFloat(children[i], 'right');
                if (!(rightVal != null && !isNaN(rightVal)))
                    return "unable to parse right value of the view for ID = " + viewId;

                var topVal = this.reader.getFloat(children[i], 'top');
                if (!(topVal != null && !isNaN(topVal)))
                    return "unable to parse top value of the view for ID = " + viewId;

                var bottomVal = this.reader.getFloat(children[i], 'bottom');
                if (!(bottomVal != null && !isNaN(bottomVal)))
                    return "unable to parse bottom value of the view for ID = " + viewId;

                global.push(...[leftVal, rightVal, bottomVal, topVal]);
            
            }

            //Get view variables
            var nearVal = this.reader.getFloat(children[i], 'near'); 
            if (nearVal == null)
                return "no near value defined for view";

            var farVal = this.reader.getFloat(children[i], 'far'); 
            if (farVal == null)
                return "no far value defined for view";

            global.push(...[nearVal, farVal]);          

            grandChildren = children[i].children;
            // Specifications for the current view.

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            for (var j = 0; j < attributeNames.length; j++) {
                var attributeIndex = nodeNames.indexOf(attributeNames[j]);

                if (attributeIndex != -1){
                    var aux = this.parseCoordinates3D(grandChildren[j], "view position for ID" + viewId);
                
                    if (!Array.isArray(aux))
                        return aux;

                    global.push(aux);
                }
                else
                    return "view " + attributeNames[i] + " undefined for ID = " + viewId;
 
            }

            // Gets the additional attributes of the ortho view
            if (children[i].nodeName == "ortho") {
                var upIndex = nodeNames.indexOf("up");

                // Retrieves the up coordinates.
                if (upIndex == 2) {
                    var aux = this.parseCoordinates3D(grandChildren[upIndex], "up coordinates for ID " + viewId);

                    if (!Array.isArray(aux))
                        return aux;
                }
                else{
                    var aux = [0,1,0];
                }

                global.push(aux);
            }
            
            if (children[i].nodeName == "perspective"){
                var cam = new CGFcamera(global[0], global[1], global[2], global[3], global[4]);
                this.views[viewId] = cam;
            }
            else{
                var cam = new CGFcameraOrtho(global[0], global[1], global[2], global[3], global[4], global[5], global[6], global[7], global[8]);
                this.views[viewId] = cam;
            }

            numViews++;
        }

        if (numViews == 0)
            return "at least one view must be defined";

        this.log("Parsed views");
        return null;

    }

    /**
     * Parses the <globals> node.
     * @param {ambient block element} ambientsNode
     */
    parseGlobals(globalsNode) {

        var children = globalsNode.children;

        this.ambient = [];
        this.background = [];

        var nodeNames = [];

        for (var i = 0; i < children.length; i++)
            nodeNames.push(children[i].nodeName);

        var ambientIndex = nodeNames.indexOf("ambient");
        var backgroundIndex = nodeNames.indexOf("background");

        var color = this.parseColor(children[ambientIndex], "ambient");
        if (!Array.isArray(color))
            return color;
        else
            this.ambient = color;

        color = this.parseColor(children[backgroundIndex], "background");
        if (!Array.isArray(color))
            return color;
        else
            this.background = color;

        this.log("Parsed globals");

        return null;
    }

    /**
     * Parses the <light> node.
     * @param {lights block element} lightsNode
     */
    parseLights(lightsNode) {
        var children = lightsNode.children;

        this.lights = [];
        var numLights = 0;

        var grandChildren = [];
        var nodeNames = [];

        // Any number of lights.
        for (var i = 0; i < children.length; i++) {

            // Storing light information
            var global = [];
            var attributeNames = [];
            var attributeTypes = [];

            //Check type of light
            if (children[i].nodeName != "omni" && children[i].nodeName != "spot") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }
            else {
                attributeNames.push(...["location", "ambient", "diffuse", "specular"]);
                attributeTypes.push(...["position", "color", "FIndex", "color"]);
            }

            // Get id of the current light.
            var lightId = this.reader.getString(children[i], 'id');
            if (lightId == null)
                return "no ID defined for light";

            // Checks for repeated IDs.
            if (this.lights[lightId] != null)
                return "ID must be unique for each light (conflict: ID = " + lightId + ")";

            // Light enable/disable
            var enableLight = true;
            var aux = this.reader.getBoolean(children[i], 'enabled');
            if (!(aux != null && !isNaN(aux) && (aux == true || aux == false)))
                this.onXMLMinorError("unable to parse value component of the 'enable light' field for ID = " + lightId + "; assuming 'value = 1'");

            enableLight = aux;

            //Add enabled boolean and type name to light info
            global.push(enableLight);
            global.push(children[i].nodeName);

            grandChildren = children[i].children;
            // Specifications for the current light.

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            for (var j = 0; j < attributeNames.length; j++) {
                var attributeIndex = nodeNames.indexOf(attributeNames[j]);

                if (attributeIndex != -1) {
                    if (attributeTypes[j] == "position")
                        var aux = this.parseCoordinates4D(grandChildren[attributeIndex], "light position for ID" + lightId);
                    else
                        var aux = this.parseColor(grandChildren[attributeIndex], attributeNames[j] + " illumination for ID" + lightId);

                    if (!Array.isArray(aux))
                        return aux;

                    global.push(aux);
                }
                else
                    return "light " + attributeNames[i] + " undefined for ID = " + lightId;
            }

            // Gets the additional attributes of the spot light
            if (children[i].nodeName == "spot") {
                var angle = this.reader.getFloat(children[i], 'angle');
                if (!(angle != null && !isNaN(angle)))
                    return "unable to parse angle of the light for ID = " + lightId;

                var exponent = this.reader.getFloat(children[i], 'exponent');
                if (!(exponent != null && !isNaN(exponent)))
                    return "unable to parse exponent of the light for ID = " + lightId;

                var targetIndex = nodeNames.indexOf("target");

                // Retrieves the light target.
                var targetLight = [];
                if (targetIndex != -1) {
                    var aux = this.parseCoordinates3D(grandChildren[targetIndex], "target light for ID " + lightId);
                    if (!Array.isArray(aux))
                        return aux;

                    targetLight = aux;
                }
                else
                    return "light target undefined for ID = " + lightId;

                global.push(...[angle, exponent, targetLight]);
            }

            // Gets the light attenuation
            for (var j = 0; j < grandChildren.length; j++) {

                if (grandChildren[j].nodeName == "attenuation") {
                    var constant = this.reader.getFloat(grandChildren[j], 'constant');
                    if (!(constant != null && !isNaN(constant)))
                        return "unable to parse constant attenuation of the light for ID = " + lightId;
    
                    if(constant != 0){
                        global.push('constant', constant);
                    }
    
                    var linear = this.reader.getFloat(grandChildren[j], 'linear');
                    if (!(linear != null && !isNaN(linear)))
                        return "unable to parse linear attenuation of the light for ID = " + lightId;
    
                    if(linear != 0){
                        global.push('linear', linear);
                    }
    
                    var quadratic = this.reader.getFloat(grandChildren[j], 'quadratic');
                    if (!(quadratic != null && !isNaN(quadratic)))
                        return "unable to parse quadratic attenuation of the light for ID = " + lightId;
    
                    if(quadratic != 0){
                        global.push('quadratic', quadratic);
                    }
                }
            }            

            this.lights[lightId] = global;
            numLights++;
        }

        if (numLights == 0)
            return "at least one light must be defined";
        else if (numLights > 8)
            this.onXMLMinorError("too many lights defined; WebGL imposes a limit of 8 lights");

        this.log("Parsed lights");
        return null;
    }

    /**
     * Parses the <textures> block. 
     * @param {textures block element} texturesNode
     */
    parseTextures(texturesNode) {
        var children = texturesNode.children;

        this.textures = [];
        var numTextures = 0;

        //For each texture in textures block, check ID and file URL
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "texture") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current texture.
            var texId = this.reader.getString(children[i], 'id');
            if (texId == null)
                return "no ID defined for texture";

            // Get file url        
            var file_url = this.reader.getString(children[i], 'file');
            if (file_url == null)
                this.onXMLMinorError("no file defined for texture");

            // Checks for repeated IDs.
            if (this.textures[texId] != null)
            return "ID must be unique for each texture (conflict: ID = " + texID + ")"; 

            this.textures[texId] = new CGFtexture(this.scene, file_url);
            numTextures++;
        }

        if (numTextures == 0)
            return "at least one texture must be defined";

        this.log("Parsed textures");
        return null;
    }

    /**
     * Parses the <materials> node.
     * @param {materials block element} materialsNode
     */
    parseMaterials(materialsNode) {
        var children = materialsNode.children;

        this.materials = [];
        var numMaterials = 0;

        var grandChildren = [];
        var nodeNames = [];

        // Any number of materials.
        for (var i = 0; i < children.length; i++) {

            //storing materials information;
            var global = [];
            var attributeNames = [];

            if (children[i].nodeName != "material") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }
            else{
                attributeNames.push(...["emission", "ambient", "diffuse", "specular"]);
            }

            // Get id of the current material.
            var materialId = this.reader.getString(children[i], 'id');
            if (materialId == null)
                return "no ID defined for material";

            // Checks for repeated IDs.
            if (this.materials[materialId] != null)
                return "ID must be unique for each material (conflict: ID = " + materialId + ")";

            // Get shininess value
            var shininess = this.reader.getFloat(children[i], 'shininess');
            if (!(shininess != null && !isNaN(shininess)))
                this.onXMLMinorError("unable to parse value component of the 'shininess' field for ID = " + materialId);

            grandChildren = children[i].children;
            // Specifications for the current material.

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            for (var j = 0; j < attributeNames.length; j++) {
                var attributeIndex = nodeNames.indexOf(attributeNames[j]);

                if (attributeIndex != -1){
                    var aux = this.parseColor(grandChildren[j], "material color for ID" + materialId);
                
                    if (!Array.isArray(aux))
                        return aux;

                    global.push(aux);
                }
                else
                    return "material " + attributeNames[i] + " undefined for ID = " + materialId;
 
            }
            var mat = new CGFappearance(this.scene);
            mat.setEmission(global[0][0], global[0][1], global[0][2], global[0][3]);
            mat.setAmbient(global[1][0], global[1][1], global[1][2], global[1][3]);
            mat.setDiffuse(global[2][0], global[2][1], global[2][2], global[2][3]);
            mat.setSpecular(global[3][0], global[3][1], global[3][2], global[3][3]);
            mat.setShininess(shininess);

            this.materials[materialId] = mat;
            numMaterials++;
        }

        if (numMaterials == 0)
            return "at least one material must be defined";

        this.log("Parsed materials");
        return null;
    }

    /**
     * Parses the <transformations> block.
     * @param {transformations block element} transformationsNode
     */
    parseTransformations(transformationsNode) {
        var children = transformationsNode.children;

        this.transformations = [];

        var grandChildren = [];

        // Any number of transformations.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "transformation") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current transformation.
            var transformationId = this.reader.getString(children[i], 'id');
            if (transformationId == null)
                return "no ID defined for transformation";

            // Checks for repeated IDs.
            if (this.transformations[transformationId] != null)
                return "ID must be unique for each transformation (conflict: ID = " + transformationId + ")";

            grandChildren = children[i].children;
            // Specifications for the current transformation.

            var transfMatrix = mat4.create();

            for (var j = 0; j < grandChildren.length; j++) {
                switch (grandChildren[j].nodeName) {
                    case 'translate':
                        var coordinates = this.parseCoordinates3D(grandChildren[j], "translate transformation for ID " + transformationId);
                        if (!Array.isArray(coordinates))
                            return coordinates;

                        transfMatrix = mat4.translate(transfMatrix, transfMatrix, coordinates);
                        break;
                    case 'scale':
                        var scaleX = this.reader.getFloat(grandChildren[j], 'x');
                        if (!(scaleX != null && !isNaN(scaleX)))
                            return "unable to parse x scale value for transformation ID = " + transformationId;
                        var scaleY = this.reader.getFloat(grandChildren[j], 'y');
                        if (!(scaleY != null && !isNaN(scaleY)))
                            return "unable to parse y scale value for transformation ID = " + transformationId;
                        var scaleZ = this.reader.getFloat(grandChildren[j], 'z');
                        if (!(scaleZ != null && !isNaN(scaleZ)))
                            return "unable to parse z scale value for transformation ID = " + transformationId;

                        transfMatrix = mat4.scale(transfMatrix, transfMatrix, [scaleX, scaleY, scaleZ]);
                        break;
                    case 'rotate':
                        var axis = this.reader.getString(grandChildren[j], 'axis');
                        if (!(axis == 'x' || axis == 'y' || axis == 'z'))
                            return "unable to parse axis of the transformation for ID = " + transformationId;
                        var angle = this.reader.getFloat(grandChildren[j], 'angle');
                        if (!(angle != null && !isNaN(angle)))
                            return "unable to parse angle of the transformation for ID = " + transformationId;
                        
                        var axisVec3 = [];
                        switch(axis){
                            case 'x': axisVec3.push(...[1, 0, 0]);break;
                            case 'y': axisVec3.push(...[0, 1, 0]);break;
                            case 'z': axisVec3.push(...[0, 0, 1]);break;
                        }
                        transfMatrix = mat4.rotate(transfMatrix, transfMatrix, angle * DEGREE_TO_RAD, axisVec3);
                        break;
                }
            }
            this.transformations[transformationId] = transfMatrix;
        }

        this.log("Parsed transformations");
        return null;
    }

    /**
     * Parses the <animations> block.
     * @param {animations block element} animationsNode
     */
    parseAnimations(animationsNode) {
        var children = animationsNode.children;

        this.animations = [];

        var grandChildren = [];

        var grandGrandChildren = [];

        // Any number of animations.
        for (var i = 0; i < children.length; i++) {

            //storing animations information;
            var global = [];

            var keyframes = [];

            if (children[i].nodeName != "animation") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current animation.
            var animationId = this.reader.getString(children[i], 'id');
            if (animationId == null)
                return "no ID defined for animation";

            // Checks for repeated IDs.
            if (this.animations[animationId] != null)
                return "ID must be unique for each animation (conflict: ID = " + animationId + ")";

            global.push(animationId);

            grandChildren = children[i].children;

            // Any number of keyframes.
            for (var j = 0; j < grandChildren.length; j++) {

                var keyframe = [];

                if (grandChildren[j].nodeName != "keyframe") {
                    this.onXMLMinorError("unknown tag <" + grandChildren[j].nodeName + ">");
                    continue;
                }

                // Get id of the current animation.
                var keyframeinstant = this.reader.getFloat(grandChildren[j], 'instant');
                if (keyframeinstant == null)
                    return "no instant defined for keyframe on animation ID" + animationId;

                keyframe.push(keyframeinstant);

                grandGrandChildren = grandChildren[j].children;

                // Get animation info.
                for (var k = 0; k < grandGrandChildren.length; k++) {

                    switch (grandGrandChildren[k].nodeName) {

                        case "translate": 
                            var translateCoords = this.parseCoordinates3D(grandGrandChildren[k], "translate on animation ID " + animationId);
                            if (!Array.isArray(translateCoords))
                                return translateCoords;
                            keyframe.push(translateCoords);
                            break;
                        
                        case "rotate":
                            var rotateCoords = this.parseCoordinatesRotate(grandGrandChildren[k], "rotate on animation ID " + animationId);
                            if (!Array.isArray(rotateCoords))
                                return rotateCoords;
                            keyframe.push(rotateCoords);
                            break;
                        
                        case "scale":
                            var scaleCoords = this.parseCoordinates3D(grandGrandChildren[k], "scale on animation ID " + animationId);
                            if (!Array.isArray(scaleCoords))
                                return scaleCoords;
                            keyframe.push(scaleCoords);
                            break;

                        default:
                            this.onXMLMinorError("unknown tag <" + grandGrandChildren[k].nodeName + ">");
                            continue;

                    }
                    
                }

                keyframes.push(keyframe);
                
            }

            global.push(keyframes);
            
            this.animations[animationId] = new KeyframeAnimation(this.scene, global[0], global[1]);

        }

    }

    /**
     * Parses the <primitives> block.
     * @param {primitives block element} primitivesNode
     */
    parsePrimitives(primitivesNode) {
        var children = primitivesNode.children;

        this.primitives = [];

        var grandChildren = [];

        // Any number of primitives.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "primitive") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current primitive.
            var primitiveId = this.reader.getString(children[i], 'id');
            if (primitiveId == null)
                return "no ID defined for primitive";

            // Checks for repeated IDs.
            if (this.primitives[primitiveId] != null)
                return "ID must be unique for each primitive (conflict: ID = " + primitiveId + ")";

            grandChildren = children[i].children;

            // Validate the primitive type
            if (grandChildren.length != 1 ||
                (grandChildren[0].nodeName != 'rectangle' && grandChildren[0].nodeName != 'triangle' &&
                    grandChildren[0].nodeName != 'cylinder' && grandChildren[0].nodeName != 'sphere' &&
                    grandChildren[0].nodeName != 'torus' && grandChildren[0].nodeName != 'cylinder2' && 
                    grandChildren[0].nodeName != 'plane' && grandChildren[0].nodeName != 'patch')) {
                return "There must be exactly 1 primitive type (rectangle, triangle, cylinder, sphere or torus)"
            }

            // Specifications for the current primitive.
            var primitiveType = grandChildren[0].nodeName;

            // Retrieves the primitive coordinates.
            if (primitiveType == 'rectangle') {

                
                // x1
                var x1 = this.reader.getFloat(grandChildren[0], 'x1');
                if (!(x1 != null && !isNaN(x1)))
                    return "unable to parse x1 of the primitive coordinates for ID = " + primitiveId;

                // y1
                var y1 = this.reader.getFloat(grandChildren[0], 'y1');
                if (!(y1 != null && !isNaN(y1)))
                    return "unable to parse y1 of the primitive coordinates for ID = " + primitiveId;

                // x2
                var x2 = this.reader.getFloat(grandChildren[0], 'x2');
                if (!(x2 != null && !isNaN(x2) && x2 > x1))
                    return "unable to parse x2 of the primitive coordinates for ID = " + primitiveId;

                // y2
                var y2 = this.reader.getFloat(grandChildren[0], 'y2');
                if (!(y2 != null && !isNaN(y2) && y2 > y1)) 
                    return "unable to parse y2 of the primitive coordinates for ID = " + primitiveId;

                var rect = new MyRectangle(this.scene, primitiveId, x1, x2, y1, y2);

                this.primitives[primitiveId] = rect;
            }
            else if(primitiveType == 'cylinder'){
                // base
                var base = this.reader.getFloat(grandChildren[0], 'base');
                if (!(base != null && !isNaN(base) && base >= 0))
                    return "unable to parse base of the primitive for ID = " + primitiveId;

                // top
                var top = this.reader.getFloat(grandChildren[0], 'top');
                if (!(top != null && !isNaN(top) && top >= 0))
                    return "unable to parse top of the primitive for ID = " + primitiveId;

                // height
                var height = this.reader.getFloat(grandChildren[0], 'height');
                if (!(height != null && !isNaN(height) && height > 0))
                    return "unable to parse height of the primitive for ID = " + primitiveId;

                // slices
                var slices = this.reader.getFloat(grandChildren[0], 'slices');
                if (!(slices != null && !isNaN(slices) && slices >= 3)) 
                    return "unable to parse slices of the primitive for ID = " + primitiveId;

                // stacks
                var stacks = this.reader.getFloat(grandChildren[0], 'stacks');
                if (!(stacks != null && !isNaN(stacks) && stacks >= 1)) 
                    return "unable to parse stacks of the primitive for ID = " + primitiveId;

                var cyl = new MyCylinder(this.scene, primitiveId, base, top, height, slices, stacks);
                
                this.primitives[primitiveId] = cyl;
            }
            else if(primitiveType == 'cylinder2'){
                // base
                var base = this.reader.getFloat(grandChildren[0], 'base');
                if (!(base != null && !isNaN(base) && base >= 0))
                    return "unable to parse base of the primitive for ID = " + primitiveId;

                // top
                var top = this.reader.getFloat(grandChildren[0], 'top');
                if (!(top != null && !isNaN(top) && top >= 0))
                    return "unable to parse top of the primitive for ID = " + primitiveId;

                // height
                var height = this.reader.getFloat(grandChildren[0], 'height');
                if (!(height != null && !isNaN(height) && height > 0))
                    return "unable to parse height of the primitive for ID = " + primitiveId;

                // slices
                var slices = this.reader.getFloat(grandChildren[0], 'slices');
                if (!(slices != null && !isNaN(slices) && slices >= 3)) 
                    return "unable to parse slices of the primitive for ID = " + primitiveId;

                // stacks
                var stacks = this.reader.getFloat(grandChildren[0], 'stacks');
                if (!(stacks != null && !isNaN(stacks) && stacks >= 1)) 
                    return "unable to parse stacks of the primitive for ID = " + primitiveId;

                var cyl = new MyCylinder2(this.scene, primitiveId, base, top, height, slices, stacks);
                
                this.primitives[primitiveId] = cyl;
            }
            else if(primitiveType == 'sphere'){
                // radius
                var radius = this.reader.getFloat(grandChildren[0], 'radius');
                if (!(radius != null && !isNaN(radius) && radius >= 0))
                    return "unable to parse radius of the primitive for ID = " + primitiveId;

                // slices
                var slices = this.reader.getFloat(grandChildren[0], 'slices');
                if (!(slices != null && !isNaN(slices) && slices >= 3)) 
                    return "unable to parse slices of the primitive for ID = " + primitiveId;

                // stacks
                var stacks = this.reader.getFloat(grandChildren[0], 'stacks');
                if (!(stacks != null && !isNaN(stacks) && stacks >= 1)) 
                    return "unable to parse stacks of the primitive for ID = " + primitiveId;

                var sphere = new MySphere(this.scene, primitiveId, radius, slices, stacks);
                
                this.primitives[primitiveId] = sphere;
            }
            else if(primitiveType == 'triangle'){
                // x1
                var x1 = this.reader.getFloat(grandChildren[0], 'x1');
                if (!(x1 != null && !isNaN(x1)))
                    return "unable to parse x1 of the primitive coordinates for ID = " + primitiveId;

                // y1
                var y1 = this.reader.getFloat(grandChildren[0], 'y1');
                if (!(y1 != null && !isNaN(y1))) 
                    return "unable to parse y1 of the primitive coordinates for ID = " + primitiveId;

                // z1
                var z1 = this.reader.getFloat(grandChildren[0], 'z1');
                if (!(z1 != null && !isNaN(z1))) 
                    return "unable to parse z1 of the primitive coordinates for ID = " + primitiveId;

                // x2
                var x2 = this.reader.getFloat(grandChildren[0], 'x2');
                if (!(x2 != null && !isNaN(x2)))
                    return "unable to parse x2 of the primitive coordinates for ID = " + primitiveId;

                // y2
                var y2 = this.reader.getFloat(grandChildren[0], 'y2');
                if (!(y2 != null && !isNaN(y2))) 
                    return "unable to parse y2 of the primitive coordinates for ID = " + primitiveId;

                // z2
                var z2 = this.reader.getFloat(grandChildren[0], 'z2');
                if (!(z2 != null && !isNaN(z2))) 
                    return "unable to parse z2 of the primitive coordinates for ID = " + primitiveId;
                
                // x3
                var x3 = this.reader.getFloat(grandChildren[0], 'x3');
                if (!(x3 != null && !isNaN(x3)))
                    return "unable to parse x3 of the primitive coordinates for ID = " + primitiveId;

                // y3
                var y3 = this.reader.getFloat(grandChildren[0], 'y3');
                if (!(y3 != null && !isNaN(y3))) 
                    return "unable to parse y3 of the primitive coordinates for ID = " + primitiveId;

                // z3
                var z3 = this.reader.getFloat(grandChildren[0], 'z3');
                if (!(z3 != null && !isNaN(z3))) 
                    return "unable to parse z3 of the primitive coordinates for ID = " + primitiveId;
                
                var triangle = new MyTriangle(this.scene, primitiveId, x1, y1, z1, x2, y2, z2, x3, y3, z3);
                
                this.primitives[primitiveId] = triangle;
            }
            else if(primitiveType == 'torus'){
                // inner
                var inner = this.reader.getFloat(grandChildren[0], 'inner');
                if (!(inner != null && !isNaN(inner) && inner >= 0))
                    return "unable to parse inner of the primitive for ID = " + primitiveId;

                // outer
                var outer = this.reader.getFloat(grandChildren[0], 'outer');
                if (!(outer != null && !isNaN(outer) && outer >= 0))
                    return "unable to parse outer of the primitive for ID = " + primitiveId;

                // slices
                var slices = this.reader.getFloat(grandChildren[0], 'slices');
                if (!(slices != null && !isNaN(slices) && slices >= 3)) 
                    return "unable to parse slices of the primitive for ID = " + primitiveId;

                // loops
                var loops = this.reader.getFloat(grandChildren[0], 'loops');
                if (!(loops != null && !isNaN(loops) && loops >= 1)) 
                    return "unable to parse loops of the primitive for ID = " + primitiveId;

                var tor = new MyTorus(this.scene, primitiveId, inner, outer, slices, loops);
                
                this.primitives[primitiveId] = tor;
            }
            else if(primitiveType == 'plane'){
                // npartsU
                var npartsU = this.reader.getFloat(grandChildren[0], 'npartsU');
                if (!(npartsU != null && !isNaN(npartsU) && npartsU >= 0))
                    return "unable to parse npartsU of the primitive for ID = " + primitiveId;

                // npartsV
                var npartsV = this.reader.getFloat(grandChildren[0], 'npartsV');
                if (!(npartsV != null && !isNaN(npartsV) && npartsV >= 0))
                    return "unable to parse npartsV of the primitive for ID = " + primitiveId;

                var plane = new MyPlane(this.scene, primitiveId, npartsU, npartsV);
                
                this.primitives[primitiveId] = plane;
            }
            else if(primitiveType == 'plane'){
                // npartsU
                var npartsU = this.reader.getFloat(grandChildren[0], 'npartsU');
                if (!(npartsU != null && !isNaN(npartsU) && npartsU >= 0))
                    return "unable to parse npartsU of the primitive for ID = " + primitiveId;

                // npartsV
                var npartsV = this.reader.getFloat(grandChildren[0], 'npartsV');
                if (!(npartsV != null && !isNaN(npartsV) && npartsV >= 0))
                    return "unable to parse npartsV of the primitive for ID = " + primitiveId;

                var plane = new MyPlane(this.scene, primitiveId, npartsU, npartsV);
                
                this.primitives[primitiveId] = plane;
            }
            else if(primitiveType == "patch")
            {     
                // npointsU
                var npointsU = this.reader.getFloat(grandChildren[0], 'npointsU');
                if (!(npointsU != null && !isNaN(npointsU) && npointsU >= 0))
                    return "unable to parse npointsU of the primitive for ID = " + primitiveId;

                // npointsV
                var npointsV = this.reader.getFloat(grandChildren[0], 'npointsV');
                if (!(npointsV != null && !isNaN(npointsV) && npointsV >= 0))
                    return "unable to parse npointsV of the primitive for ID = " + primitiveId;
    
                // npartsU
                var npartsU = this.reader.getFloat(grandChildren[0], 'npartsU');
                if (!(npartsU != null && !isNaN(npartsU) && npartsU >= 0))
                    return "unable to parse npartsU of the primitive for ID = " + primitiveId;

                // npartsV
                var npartsV = this.reader.getFloat(grandChildren[0], 'npartsV');
                if (!(npartsV != null && !isNaN(npartsV) && npartsV >= 0))
                    return "unable to parse npartsV of the primitive for ID = " + primitiveId;
    
                var grandGrandChildren = grandChildren[0].children;
    
                var numControlPoints = 0;
                var controlPoints = [];   

                for(let i = 0; i < grandGrandChildren.length; i++)
                {

                    if(grandGrandChildren[i].nodeName != "controlpoint")
                    {
                        this.onXMLMinorError("wrong child tag <" + grandGrandChildren[i].nodeName + "> for patch primitive with ID = " + primitiveId);
                        continue;
                    }
                    
                    var controlPoint = [];

                    var xx = this.reader.getFloat(grandGrandChildren[i],'xx');
                    if(!(xx != null && !isNaN(xx))) return "unable to parse xx value of the controlPoint[" + (i + 1) + "], patch primitive with ID = " + primitiveId;
                    else controlPoint.push(xx);

                    var yy = this.reader.getFloat(grandGrandChildren[i],'yy');
                    if(!(yy != null && !isNaN(yy))) return "unable to parse yy value of the controlPoint[" + (i + 1) + "], patch primitive with ID = " + primitiveId;
                    else controlPoint.push(yy);

                    var zz = this.reader.getFloat(grandGrandChildren[i],'zz');
                    if(!(zz != null && !isNaN(zz))) return "unable to parse zz value of the controlPoint[" + (i + 1) + "], patch primitive with ID = " + primitiveId;
                    else controlPoint.push(zz);

                    controlPoint.push(1.0);

                    controlPoints.push(controlPoint);
                    numControlPoints++;                
                }

                if(numControlPoints != npointsU * npointsV) return "wrong number of correct points of Patch primitive for ID = " + primitiveId;

                var cp = [];
                var cpV = [];
                let counter = 0;

                for(var k = 0; k < npointsU; k++)
                {
                    cpV = [];
                    for(var j = 0; j < npointsV; j++)
                    {
                        cpV.push(controlPoints[counter]);
                        counter++;
                    }
                    cp.push(cpV);
                }

                var patch = new MyPatch(this.scene, primitiveId, npointsU, npointsV, npartsU, npartsV, cp);
                
                this.primitives[primitiveId] = patch;
            }
        }

        this.log("Parsed primitives");
        return null;
    }

    /**
   * Parses the <components> block.
   * @param {components block element} componentsNode
   */
    parseComponents(componentsNode) {
        var children = componentsNode.children;

        this.components = [];

        var grandChildren = [];
        var grandGrandChildren = [];
        var nodeNames = [];

        // Any number of components.
        for (var i = 0; i < children.length; i++) {

            // Storing component information
            var global = [];

            if (children[i].nodeName != "component") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current component.
            var componentId = this.reader.getString(children[i], 'id');
            if (componentId == null)
                return "no ID defined for componentId";

            global.push(componentId);

            // Checks for repeated IDs.
            if (this.components[componentId] != null)
                return "ID must be unique for each component (conflict: ID = " + componentId + ")";

            grandChildren = children[i].children;

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            var transformationIndex = nodeNames.indexOf("transformation");
            var animationsIndex = nodeNames.indexOf("animationref");
            var materialsIndex = nodeNames.indexOf("materials");
            var textureIndex = nodeNames.indexOf("texture");
            var childrenIndex = nodeNames.indexOf("children");

            var animations = [];

            for(var j = 0; j < grandChildren.length; j++){

                grandGrandChildren = grandChildren[j].children;

                var transformations = [];
                var materials = [];
                var texture = [];
                var child = [];
                

                // Transformation
                if(j == transformationIndex){

                    for(var k = 0; k < grandGrandChildren.length; k++){

                        var transfMatrix = mat4.create();

                        if(grandGrandChildren[k].nodeName == "transformationref"){
                            var transformationId = this.reader.getString(grandGrandChildren[k], 'id');
                            transformations.push(this.transformations[transformationId]);
                        }
                        else if(grandGrandChildren[k].nodeName == "translate"){
                            var coordinates = this.parseCoordinates3D(grandGrandChildren[k], "translate transformation for ID " + componentId);
                            transfMatrix = mat4.translate(transfMatrix, transfMatrix, coordinates);
                        }
                        else if(grandGrandChildren[k].nodeName == "scale"){
                            var scaleX = this.reader.getFloat(grandGrandChildren[k], 'x');
                            if (!(scaleX != null && !isNaN(scaleX)))
                                return "unable to parse x scale value for transformation ID = " + componentId;
                            var scaleY = this.reader.getFloat(grandGrandChildren[k], 'y');
                            if (!(scaleY != null && !isNaN(scaleY)))
                                return "unable to parse y scale value for transformation ID = " + componentId;
                            var scaleZ = this.reader.getFloat(grandGrandChildren[k], 'z');
                            if (!(scaleZ != null && !isNaN(scaleZ)))
                                return "unable to parse z scale value for transformation ID = " + componentId;

                            transfMatrix = mat4.scale(transfMatrix, transfMatrix, [scaleX, scaleY, scaleZ]);
                        }
                        else if(grandGrandChildren[k].nodeName == "rotate"){
                            var axis = this.reader.getString(grandGrandChildren[k], 'axis');
                            if (!(axis == 'x' || axis == 'y' || axis == 'z'))
                                return "unable to parse axis of the transformation for ID = " + componentId;
                            var angle = this.reader.getFloat(grandGrandChildren[k], 'angle');
                            if (!(angle != null && !isNaN(angle)))
                                return "unable to parse angle of the transformation for ID = " + componentId;
                        
                            var axisVec3 = [];
                            switch(axis){
                                case 'x': axisVec3.push(...[1, 0, 0]);break;
                                case 'y': axisVec3.push(...[0, 1, 0]);break;
                                case 'z': axisVec3.push(...[0, 0, 1]);break;
                                default: break;
                            }

                            transfMatrix = mat4.rotate(transfMatrix, transfMatrix, angle * DEGREE_TO_RAD, axisVec3);
                        }

                        transformations.push(transfMatrix);
                    }

                    global.push(transformations);
                }

                // Animation
                else if(j == animationsIndex){

                    var animationId = this.reader.getString(grandChildren[j], 'id');
                    if (animationId == null)
                        return "no ID defined for animation on component ID = " + componentId;

                    
                    animations.push(this.animations[animationId]);
                }

                // Materials
                else if(j == materialsIndex){

                    for(var k = 0; k < grandGrandChildren.length; k++){

                        if(grandGrandChildren[k].nodeName == "material"){
                            var materialId = this.reader.getString(grandGrandChildren[k], 'id');
                            if (materialId == null)
                                return "no ID defined for material on component ID = " + componentId;
                            materials.push(materialId);
                        }
                    }

                    global.push(materials);
                }

                // Texture
                else if(j == textureIndex){
                    
                    var textureId = this.reader.getString(grandChildren[j], 'id');
                    if (textureId == null)
                        return "no ID defined for texture on component ID = " + componentId;
                        
                    if(textureId != 'none' && textureId != 'inherit'){
                        var length_s = this.reader.getFloat(grandChildren[j], 'length_s');
                        if (!(length_s != null && !isNaN(length_s)))
                            return "unable to parse texture s length for component ID = " + componentId;
                        var length_t = this.reader.getFloat(grandChildren[j], 'length_t');
                        if (!(length_t != null && !isNaN(length_t)))
                            return "unable to parse texture t length for component ID = " + componentId;

                        texture.push(...[textureId, length_s, length_t]);
                        global.push(texture);
                    }
                    else{
                        global.push(textureId);
                    }

                    
                }

                // Children
                else if(j == childrenIndex){

                    for(var k = 0; k < grandGrandChildren.length; k++){

                        if(grandGrandChildren[k].nodeName == "componentref"){
                            var compId = this.reader.getString(grandGrandChildren[k], 'id');
                            child.push(compId); 
                        }
                        else if(grandGrandChildren[k].nodeName == "primitiveref"){
                            var primId = this.reader.getString(grandGrandChildren[k], 'id');
                            child.push(primId);
                        }
                        else{
                            this.onXMLMinorError("unknown tag <" + grandGrandChildren[k].nodeName + ">");
                        }
                    }

                    global.push(child);               
                }

            }

            global.push(animations);

            this.components[componentId] = global;
            
        }

        for(var key in this.components){
            this.nodes[key] = new MyComponent(this, this.components[key]);
        }
        for(var key in this.primitives){
            this.nodes[key] = this.primitives[key];
        }

        this.log("Parsed components");
        window.components = this.components;
        window.nodes = this.nodes;
        return null;
    }

    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinatesRotate(node, messageError) {
        var position = [];

        // x
        var x = this.reader.getFloat(node, 'angle_x');
        if (!(x != null && !isNaN(x)))
            return "unable to parse angle_x of the " + messageError;

        // y
        var y = this.reader.getFloat(node, 'angle_y');
        if (!(y != null && !isNaN(y)))
            return "unable to parse angle_y of the " + messageError;

        // z
        var z = this.reader.getFloat(node, 'angle_z');
        if (!(z != null && !isNaN(z)))
            return "unable to parse angle_z of the " + messageError;

        position.push(...[x, y, z]);

        return position;
    }

    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates3D(node, messageError) {
        var position = [];

        // x
        var x = this.reader.getFloat(node, 'x');
        if (!(x != null && !isNaN(x)))
            return "unable to parse x-coordinate of the " + messageError;

        // y
        var y = this.reader.getFloat(node, 'y');
        if (!(y != null && !isNaN(y)))
            return "unable to parse y-coordinate of the " + messageError;

        // z
        var z = this.reader.getFloat(node, 'z');
        if (!(z != null && !isNaN(z)))
            return "unable to parse z-coordinate of the " + messageError;

        position.push(...[x, y, z]);

        return position;
    }

    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates4D(node, messageError) {
        var position = [];

        //Get x, y, z
        position = this.parseCoordinates3D(node, messageError);

        if (!Array.isArray(position))
            return position;


        // w
        var w = this.reader.getFloat(node, 'w');
        if (!(w != null && !isNaN(w)))
            return "unable to parse w-coordinate of the " + messageError;

        position.push(w);

        return position;
    }

    /**
     * Parse the color components from a node
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseColor(node, messageError) {
        var color = [];

        // R
        var r = this.reader.getFloat(node, 'r');
        if (!(r != null && !isNaN(r) && r >= 0 && r <= 1))
            return "unable to parse R component of the " + messageError;

        // G
        var g = this.reader.getFloat(node, 'g');
        if (!(g != null && !isNaN(g) && g >= 0 && g <= 1))
            return "unable to parse G component of the " + messageError;

        // B
        var b = this.reader.getFloat(node, 'b');
        if (!(b != null && !isNaN(b) && b >= 0 && b <= 1))
            return "unable to parse B component of the " + messageError;

        // A
        var a = this.reader.getFloat(node, 'a');
        if (!(a != null && !isNaN(a) && a >= 0 && a <= 1))
            return "unable to parse A component of the " + messageError;

        color.push(...[r, g, b, a]);

        return color;
    }

    /*
     * Callback to be executed on any read error, showing an error on the console.
     * @param {string} message
     */
    onXMLError(message) {
        console.error("XML Loading Error: " + message);
        this.loadedOk = false;
    }

    /**
     * Callback to be executed on any minor error, showing a warning on the console.
     * @param {string} message
     */
    onXMLMinorError(message) {
        console.warn("Warning: " + message);
    }

    /**
     * Callback to be executed on any message.
     * @param {string} message
     */
    log(message) {
        console.log("   " + message);
    }

    /**
     * Displays the scene, processing each node, starting in the root node.
     */
    displayScene() {
        //To do: Create display loop for transversing the scene graph

        //To test the parsing/creation of the primitives, call the display function directly
        this.nodes[this.idRoot].display();
    }
}