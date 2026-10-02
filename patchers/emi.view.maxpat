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
			100.0,
			100.0,
			700.0,
			420.0
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
		"statusbarvisible": 2,
		"toolbarvisible": 1,
		"boxes": [
			{
				"box": {
					"maxclass": "inlet",
					"comment": "clear | note | seam | done (from emi.core, via view)",
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
					"id": "obj-1"
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
					"patching_rect": [
						20.0,
						60.0,
						360.0,
						169.0
					],
					"presentation": 1,
					"presentation_rect": [
						0.0,
						0.0,
						360.0,
						169.0
					],
					"id": "obj-2"
				}
			},
			{
				"box": {
					"maxclass": "outlet",
					"comment": "to emi.engine: select <from> <to> (beats dragged across, for Emily's ratings)",
					"index": 1,
					"numinlets": 1,
					"numoutlets": 0,
					"patching_rect": [
						20.0,
						260.0,
						30.0,
						30.0
					],
					"id": "obj-3"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "emi.view: piano roll of the current score; colors = source chorale (or voice), bright lines = seams",
					"numinlets": 1,
					"numoutlets": 0,
					"linecount": 3,
					"patching_rect": [
						400.0,
						60.0,
						260.0,
						48.0
					],
					"id": "obj-4"
				}
			}
		],
		"lines": [
			{
				"patchline": {
					"source": [
						"obj-1",
						0
					],
					"destination": [
						"obj-2",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-2",
						0
					],
					"destination": [
						"obj-3",
						0
					]
				}
			}
		]
	}
}
