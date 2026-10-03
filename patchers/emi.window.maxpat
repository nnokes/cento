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
			60.0,
			60.0,
			1240.0,
			770.0
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
					"text": "emi.window: the pop-up window (both products). A large piano roll (the same script as the panels' roll, emi.view) and Emily's taste in full (emi.taste). Opened by the Emily panel's window button, through [pcontrol] in the top patch.",
					"numinlets": 1,
					"numoutlets": 0,
					"linecount": 2,
					"patching_rect": [
						20.0,
						900.0,
						900.0,
						34.0
					],
					"id": "obj-1"
				}
			},
			{
				"box": {
					"maxclass": "inlet",
					"comment": "from emi.engine: view ..., emilyview ...",
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
					"maxclass": "outlet",
					"comment": "to emi.engine: select (from the roll), like, dislike, taste",
					"index": 1,
					"numinlets": 1,
					"numoutlets": 0,
					"patching_rect": [
						20.0,
						860.0,
						30.0,
						30.0
					],
					"id": "obj-3"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "route view emilyview",
					"numinlets": 2,
					"numoutlets": 3,
					"outlettype": [
						"",
						"",
						""
					],
					"patching_rect": [
						20.0,
						60.0,
						140.0,
						22.0
					],
					"id": "obj-4"
				}
			},
			{
				"box": {
					"maxclass": "v8ui",
					"filename": "emi.view.bundle.js",
					"textfile": {
						"filename": "emi.view.bundle.js",
						"flags": 0,
						"embed": 0,
						"autowatch": 1
					},
					"numinlets": 1,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"parameter_enable": 0,
					"border": 0,
					"patching_rect": [
						20.0,
						100.0,
						1160.0,
						430.0
					],
					"presentation": 1,
					"presentation_rect": [
						10.0,
						10.0,
						1160.0,
						430.0
					],
					"id": "obj-5"
				}
			},
			{
				"box": {
					"maxclass": "v8ui",
					"filename": "emi.taste.bundle.js",
					"textfile": {
						"filename": "emi.taste.bundle.js",
						"flags": 0,
						"embed": 0,
						"autowatch": 1
					},
					"numinlets": 1,
					"numoutlets": 0,
					"outlettype": [],
					"parameter_enable": 0,
					"border": 0,
					"patching_rect": [
						20.0,
						540.0,
						1160.0,
						210.0
					],
					"presentation": 1,
					"presentation_rect": [
						10.0,
						450.0,
						1160.0,
						210.0
					],
					"id": "obj-6"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "like",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						20.0,
						820.0,
						80.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						10.0,
						670.0,
						80.0,
						24.0
					],
					"id": "obj-7"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "dislike",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						110.0,
						820.0,
						80.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						100.0,
						670.0,
						80.0,
						24.0
					],
					"id": "obj-8"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "taste",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						200.0,
						820.0,
						80.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						190.0,
						670.0,
						80.0,
						24.0
					],
					"id": "obj-9"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "Drag across the roll to select beats: like and dislike rate them (or else the phrase playing, or the piece). Hover over a beat to see where it came from.",
					"numinlets": 1,
					"numoutlets": 0,
					"patching_rect": [
						300.0,
						820.0,
						700.0,
						20.0
					],
					"presentation": 1,
					"presentation_rect": [
						290.0,
						672.0,
						860.0,
						20.0
					],
					"id": "obj-10"
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
						700.0,
						20.0,
						70.0,
						22.0
					],
					"id": "obj-11"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "title ml_midi: piano roll and Emily",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						700.0,
						55.0,
						230.0,
						22.0
					],
					"id": "obj-12"
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
						700.0,
						90.0,
						80.0,
						22.0
					],
					"id": "obj-13"
				}
			}
		],
		"lines": [
			{
				"patchline": {
					"source": [
						"obj-2",
						0
					],
					"destination": [
						"obj-4",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-4",
						0
					],
					"destination": [
						"obj-5",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-5",
						0
					],
					"destination": [
						"obj-3",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-4",
						1
					],
					"destination": [
						"obj-6",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-7",
						0
					],
					"destination": [
						"obj-3",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-8",
						0
					],
					"destination": [
						"obj-3",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-9",
						0
					],
					"destination": [
						"obj-3",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-11",
						0
					],
					"destination": [
						"obj-12",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-12",
						0
					],
					"destination": [
						"obj-13",
						0
					]
				}
			}
		]
	}
}
