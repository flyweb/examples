Shader "Transparent/Lightmapped/VertexLit ZWrite" {
Properties {
	_Color ("Main Color", Color) = (1,1,1,1)
	_SpecColor ("Spec Color", Color) = (1,1,1,1)
	_Shininess ("Shininess", Range (0.01, 1)) = 0.7
	_MainTex ("Base (RGB)", 2D) = "white" {}
	_LightMap ("Lightmap (RGB)", 2D) = "lightmap" { LightmapMode }
}

Category {
	Tags { "RenderType"="Opaque" }
	LOD 250
	/* Upgrade NOTE: commented out, possibly part of old style per-pixel lighting: Blend AppSrcAdd AppDstAdd */
	Fog { Color [_AddFog] }
		
	// ------------------------------------------------------------------
	// ARB fragment program
	
	SubShader {

		// Ambient pass
		Pass {
			Name "BASE"
			Tags {"LightMode" = "Always" /* Upgrade NOTE: changed from PixelOrNone to Always */}
			Color [_PPLAmbient]
			ColorMask RGB
 			Blend SrcAlpha OneMinusSrcAlpha
			BindChannels {
				Bind "Vertex", vertex
				Bind "normal", normal
				Bind "texcoord1", texcoord0 // lightmap uses 2nd uv
				Bind "texcoord1", texcoord1 // lightmap uses 2nd uv
				Bind "texcoord", texcoord2 // main uses 1st uv
			}
			SetTexture [_LightMap] {
				constantColor [_Color]
				combine primary	* constant
			}
			SetTexture [_LightMap] {
				combine texture * previous
			}
			SetTexture [_MainTex] {
				constantColor [_Color]
				combine texture * previous DOUBLE, texture * constant
			}
		}

		// Vertex lights
		// Two-pass because of all the inputs needed
		Pass { 
			Name "BASE"
			Tags {"LightMode" = "Vertex"}
			ZTest Lequal
			Lighting On
			SeparateSpecular On
			Material {
				Diffuse [_Color]
				Shininess [_Shininess]
				Specular [_SpecColor]
				Emission [_PPLAmbient]
			}
			Blend SrcAlpha OneMinusSrcAlpha
			BindChannels {
				Bind "Vertex", vertex
				Bind "normal", normal
				Bind "texcoord1", texcoord0 // lightmap uses 2nd uv
				Bind "texcoord1", texcoord1 // lightmap uses 2nd uv
				Bind "texcoord", texcoord2 // main uses 1st uv
			}
			SetTexture [_LightMap] { ConstantColor [_Color] combine constant * texture }
			SetTexture [_LightMap] { constantColor (0.5,0.5,0.5,0.5) combine previous * constant + primary }
			SetTexture [_MainTex] {
				constantColor [_Color]
				combine texture * previous DOUBLE, texture * constant
			}
		}
	}
}
Fallback "Lightmapped/VertexLit", 2

}