{
	"patcher": {
		"fileversion": 1,
		"appversion": {
			"major": 9,
			"minor": 0,
			"revision": 7,
			"architecture": "x64",
			"modernui": 1
		},
		"classnamespace": "box",
		"rect": [
			160.0,
			120.0,
			660.0,
			530.0
		],
		"openinpresentation": 1,
		"default_fontsize": 12.0,
		"default_fontface": 0,
		"default_fontname": "Arial",
		"gridonopen": 1,
		"gridsize": [
			15.0,
			15.0
		],
		"gridsnaponopen": 1,
		"objectsnaponopen": 1,
		"statusbarvisible": 0,
		"toolbarvisible": 0,
		"boxes": [
			{
				"box": {
					"maxclass": "comment",
					"text": "emi.magdalena: who Magdalena is, and what she does. Opened by the pop-up window's explain Magdalena button, through [pcontrol] in emi.window.",
					"numinlets": 1,
					"numoutlets": 0,
					"linecount": 2,
					"patching_rect": [
						20.0,
						520.0,
						600.0,
						34.0
					],
					"id": "obj-1"
				}
			},
			{
				"box": {
					"maxclass": "inlet",
					"comment": "pcontrol: open",
					"index": 1,
					"numinlets": 0,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						20.0,
						20.0,
						30.0,
						30.0
					],
					"id": "obj-2"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "Magdalena",
					"numinlets": 1,
					"numoutlets": 0,
					"fontsize": 16.0,
					"fontface": 1,
					"linecount": 1,
					"presentation_linecount": 1,
					"patching_rect": [
						20.0,
						60.0,
						456.0,
						24.0
					],
					"presentation": 1,
					"presentation_rect": [
						12.0,
						12.0,
						456.0,
						24.0
					],
					"id": "obj-3"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "learns the user's taste",
					"numinlets": 1,
					"numoutlets": 0,
					"fontsize": 11.0,
					"fontface": 0,
					"linecount": 1,
					"textcolor": [
						0.95,
						0.95,
						0.93,
						1.0
					],
					"presentation_linecount": 1,
					"patching_rect": [
						20.0,
						130.0,
						456.0,
						20.0
					],
					"presentation": 1,
					"presentation_rect": [
						12.0,
						44.0,
						456.0,
						20.0
					],
					"id": "obj-4"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "Magdalena is Cento's listener. She learns the user's taste: like and dislike tell her what you enjoy in a piece, a stream phrase, or beats you select in the piano roll. Later pieces lean toward what you liked, always within Bach's rules. temperature sets how much chance still plays: 0, only her favorite choices; 1, as if she weren't there; up to 3, more adventurous.",
					"numinlets": 1,
					"numoutlets": 0,
					"fontsize": 12.0,
					"fontface": 0,
					"linecount": 5,
					"presentation_linecount": 5,
					"patching_rect": [
						20.0,
						200.0,
						456.0,
						90.0
					],
					"presentation": 1,
					"presentation_rect": [
						12.0,
						72.0,
						456.0,
						90.0
					],
					"id": "obj-5"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "keep writes what you're hearing into Magdalena's notebook: music of her own that later pieces draw on, alongside Bach's (how much: mix, in the memory tab). novelty lets her vary phrases with notes Bach never wrote. Snapshots let you roll her taste back to an earlier one; forget starts afresh.",
					"numinlets": 1,
					"numoutlets": 0,
					"fontsize": 12.0,
					"fontface": 0,
					"linecount": 5,
					"presentation_linecount": 5,
					"patching_rect": [
						20.0,
						270.0,
						456.0,
						90.0
					],
					"presentation": 1,
					"presentation_rect": [
						12.0,
						170.0,
						456.0,
						90.0
					],
					"id": "obj-6"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "She is named after Anna Magdalena Bach (1701\u20131760), a professional singer and the copyist of much of Bach's music. Her notebooks of 1722 and 1725 collected the pieces she and her family loved, as Magdalena's notebook collects the ones you keep.",
					"numinlets": 1,
					"numoutlets": 0,
					"fontsize": 12.0,
					"fontface": 0,
					"linecount": 5,
					"presentation_linecount": 5,
					"patching_rect": [
						20.0,
						340.0,
						456.0,
						76.0
					],
					"presentation": 1,
					"presentation_rect": [
						12.0,
						268.0,
						456.0,
						76.0
					],
					"id": "obj-7"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "Her ideas come from David Cope's Emily Howell, a program that learned from its listeners. Cento is independent and isn't affiliated with David Cope.",
					"numinlets": 1,
					"numoutlets": 0,
					"fontsize": 10.0,
					"fontface": 0,
					"linecount": 3,
					"textcolor": [
						0.95,
						0.95,
						0.93,
						1.0
					],
					"presentation_linecount": 3,
					"patching_rect": [
						20.0,
						410.0,
						456.0,
						36.0
					],
					"presentation": 1,
					"presentation_rect": [
						12.0,
						352.0,
						456.0,
						36.0
					],
					"id": "obj-8"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "loadbang",
					"numinlets": 1,
					"numoutlets": 1,
					"outlettype": [
						"bang"
					],
					"patching_rect": [
						520.0,
						20.0,
						70.0,
						22.0
					],
					"id": "obj-9"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "title Cento: about Magdalena",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						520.0,
						55.0,
						214.0,
						22.0
					],
					"id": "obj-10"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "thispatcher",
					"numinlets": 1,
					"numoutlets": 2,
					"outlettype": [
						"",
						""
					],
					"patching_rect": [
						520.0,
						90.0,
						80.0,
						22.0
					],
					"id": "obj-11"
				}
			}
		],
		"lines": [
			{
				"patchline": {
					"source": [
						"obj-9",
						0
					],
					"destination": [
						"obj-10",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-10",
						0
					],
					"destination": [
						"obj-11",
						0
					]
				}
			}
		]
	}
}
