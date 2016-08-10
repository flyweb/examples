
Shader "Car/GlassReflect" {
Properties {
	_Color ("Main Color", Color) = (1,1,1,1)
	_ReflectColor ("Reflection Color", Color) = (1,1,1,0.5)
	_MainTex ("Base (RGB) RefStrength (A)", 2D) = "white" {} 
	_Cube ("Reflection Cubemap", Cube) = "_Skybox" { TexGen CubeReflect }
	_BumpMap ("Bumpmap (RGB Trans)", 2D) = "bump" {}

	_FresnelPower ("_FresnelPower", Range(0.05,5.0)) = 0.75
}
SubShader {
	Tags { "RenderType"="Transparent" }
	
CGPROGRAM
#pragma surface surf BlinnPhong alpha
#pragma target 3.0

sampler2D _MainTex;
samplerCUBE _RtReflection;
sampler2D _BumpMap;

samplerCUBE _Cube;

float4 _Color;
float4 _ReflectColor;

float _FresnelPower;

struct Input {
	float2 uv_MainTex;
	float3 worldRefl;
	float3 viewDir;
	INTERNAL_DATA
};

void surf (Input IN, inout SurfaceOutput o) 
{
	half4 tex = tex2D(_MainTex, IN.uv_MainTex);
	half4 c = tex * _Color;
	
	float4 bump = tex2D(_BumpMap, IN.uv_MainTex);
	o.Normal = UnpackNormal(bump);
	
	half3 worldReflVec = WorldReflectionVector(IN, o.Normal);	
	half4 reflcol = texCUBE(_Cube, worldReflVec);
	
	// FRESNEL CALCS
	float fcbias = 0.20373;
	float facing = saturate(1.0 - max(dot( normalize(IN.viewDir.xyz), normalize(o.Normal)), 0.0));
	float refl2Refr = max(fcbias + (1.0-fcbias) * pow(facing, _FresnelPower), 0);			
	
	o.Albedo =  reflcol.rgb * _ReflectColor.rgb + c.rgb;
	o.Emission = o.Albedo * 0.25;
	o.Alpha = refl2Refr; 
}
ENDCG

}

SubShader {
	Tags { "RenderType"="Transparent" }
	
CGPROGRAM
#pragma surface surf Lambert alpha

sampler2D _MainTex;
sampler2D _BumpMap;
samplerCUBE _Cube;

float4 _Color;
float4 _ReflectColor;

float _FresnelPower;

struct Input {
	float2 uv_MainTex;
	float3 worldRefl;
	INTERNAL_DATA
};

void surf (Input IN, inout SurfaceOutput o) 
{
	half4 tex = tex2D(_MainTex, IN.uv_MainTex);
	half4 c = tex * _Color;
	
	float4 bump = tex2D(_BumpMap, IN.uv_MainTex);
	o.Normal = UnpackNormal(bump);
	
	half3 worldReflVec = WorldReflectionVector(IN, o.Normal);	
	half4 reflcol = texCUBE(_Cube, worldReflVec);		
	
	o.Albedo =  reflcol.rgb * _ReflectColor.rgb + c.rgb;
	o.Emission = o.Albedo * 0.25;
	o.Alpha = 1.275; 
}
ENDCG

}
	
FallBack "Reflective/VertexLit"
} 

