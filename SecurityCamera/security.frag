#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
uniform sampler2D uSampler;

struct lightProperties {
    vec4 position;                  // Default: (0, 0, 1, 0)
    vec4 ambient;                   // Default: (0, 0, 0, 1)
    vec4 diffuse;                   // Default: (0, 0, 0, 1)
    vec4 specular;                  // Default: (0, 0, 0, 1)
    vec4 half_vector;
    vec3 spot_direction;            // Default: (0, 0, -1)
    float spot_exponent;            // Default: 0 (possible values [0, 128]
    float spot_cutoff;              // Default: 180 (possible values [0, 90] or 180)
    float constant_attenuation;     // Default: 1 (value must be >= 0)
    float linear_attenuation;       // Default: 0 (value must be >= 0)
    float quadratic_attenuation;    // Default: 0 (value must be >= 0)
    bool enabled;                   // Default: false
};

#define NUMBER_OF_LIGHTS 8
uniform lightProperties uLight[NUMBER_OF_LIGHTS];

uniform float timeFactor;

void main() {

    vec4 color = texture2D(uSampler, vec2(vTextureCoord.x, 1.0 - vTextureCoord.y));

    if(mod(vTextureCoord.y * 45.0 + (timeFactor*0.5), 2.0) > 1.0) color = vec4(color.rgb * 1.3, 1.0);
    
    vec4 fragColor = vec4(color.rgb, 1.0);
    
    vec4 darkenLeft = vec4(fragColor.rgb * (vTextureCoord.x)*2.0, 1);
    vec4 darkenTopLeft = vec4(darkenLeft.rgb * vTextureCoord.y*2.0, 1);
	vec4 darkenRightTopLeft = vec4(darkenTopLeft.rgb * (1.0-vTextureCoord.x)*2.0, 1);
    vec4 darkenAllSides = vec4(darkenRightTopLeft.rgb * (1.0-vTextureCoord.y)*2.0, 1);

    


    gl_FragColor = darkenAllSides ;
    
    
}
