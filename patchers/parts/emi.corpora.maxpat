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
			80.0,
			80.0,
			860.0,
			480.0
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
					"text": "emi.corpora: the corpus window (both products, M11). Folders of chorales, each switched on or off (emi.corpora.bundle.js); composing uses every folder that is on, as one corpus. Opened by the panel's corpora button, through [pcontrol] in the top patch.",
					"numinlets": 1,
					"numoutlets": 0,
					"linecount": 2,
					"patching_rect": [
						20.0,
						600.0,
						900.0,
						34.0
					],
					"id": "obj-1"
				}
			},
			{
				"box": {
					"maxclass": "inlet",
					"comment": "from emi.engine: corpusview ...",
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
					"comment": "to emi.engine: corpusadd, corpuson, corpusonly, corpusremove, corpusrescan",
					"index": 1,
					"numinlets": 1,
					"numoutlets": 0,
					"patching_rect": [
						20.0,
						560.0,
						30.0,
						30.0
					],
					"id": "obj-3"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "route corpusview",
					"numinlets": 2,
					"numoutlets": 2,
					"outlettype": [
						"",
						""
					],
					"patching_rect": [
						20.0,
						60.0,
						120.0,
						22.0
					],
					"id": "obj-4"
				}
			},
			{
				"box": {
					"maxclass": "v8ui",
					"filename": "emi.corpora.bundle.js",
					"varname": "Corpora",
					"textfile": {
						"filename": "emi.corpora.bundle.js",
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
						760.0,
						330.0
					],
					"presentation": 1,
					"presentation_rect": [
						10.0,
						10.0,
						760.0,
						330.0
					],
					"id": "obj-5",
					"hint": "Every folder of chorales on the list: switch one on or off with its box, use it alone (only), or take it off the list (remove). Composing uses every folder that is on, as one corpus, and the seed shown is composed again with it. A chorale in two folders counts once; the corpus has one meter (the first folder's). Hover over a name for its folder's full path.",
					"annotation": "Every folder of chorales on the list: switch one on or off with its box, use it alone (only), or take it off the list (remove). Composing uses every folder that is on, as one corpus, and the seed shown is composed again with it. A chorale in two folders counts once; the corpus has one meter (the first folder's). Hover over a name for its folder's full path.",
					"annotation_name": "Corpora"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "add folder",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"bgcolor": [
						0.8,
						0.85,
						0.93,
						1.0
					],
					"bgfillcolor_type": "color",
					"bgfillcolor_color": [
						0.8,
						0.85,
						0.93,
						1.0
					],
					"textcolor": [
						0.08,
						0.08,
						0.09,
						1.0
					],
					"patching_rect": [
						20.0,
						460.0,
						86.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						10.0,
						350.0,
						90.0,
						24.0
					],
					"id": "obj-6",
					"hint": "Choose a folder of chorales (MIDI files, as tools/export-chorales.py writes them, e.g. Documents/Cento/corpus-both). It joins the list, switched on.",
					"annotation": "Choose a folder of chorales (MIDI files, as tools/export-chorales.py writes them, e.g. Documents/Cento/corpus-both). It joins the list, switched on.",
					"annotation_name": "add folder"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "route add",
					"numinlets": 2,
					"numoutlets": 2,
					"outlettype": [
						"",
						""
					],
					"patching_rect": [
						20.0,
						490.0,
						80.0,
						22.0
					],
					"id": "obj-7"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "t b",
					"numinlets": 1,
					"numoutlets": 1,
					"outlettype": [
						"bang"
					],
					"patching_rect": [
						20.0,
						520.0,
						35.0,
						22.0
					],
					"id": "obj-8"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "opendialog fold",
					"numinlets": 1,
					"numoutlets": 2,
					"outlettype": [
						"",
						"bang"
					],
					"patching_rect": [
						20.0,
						550.0,
						110.0,
						22.0
					],
					"id": "obj-9"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "prepend corpusadd",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						20.0,
						580.0,
						120.0,
						22.0
					],
					"id": "obj-10"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "rescan",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"bgcolor": [
						0.8,
						0.85,
						0.93,
						1.0
					],
					"bgfillcolor_type": "color",
					"bgfillcolor_color": [
						0.8,
						0.85,
						0.93,
						1.0
					],
					"textcolor": [
						0.08,
						0.08,
						0.09,
						1.0
					],
					"patching_rect": [
						160.0,
						460.0,
						60.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						106.0,
						350.0,
						60.0,
						24.0
					],
					"id": "obj-11",
					"hint": "Read every folder again, after adding or removing chorales in one. (Folders are read once, when first switched on.)",
					"annotation": "Read every folder again, after adding or removing chorales in one. (Folders are read once, when first switched on.)",
					"annotation_name": "rescan"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "t b",
					"numinlets": 1,
					"numoutlets": 1,
					"outlettype": [
						"bang"
					],
					"patching_rect": [
						160.0,
						490.0,
						35.0,
						22.0
					],
					"id": "obj-12"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "corpusrescan",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						160.0,
						520.0,
						90.0,
						22.0
					],
					"id": "obj-13"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "Add a folder of chorales (MIDI files), then switch folders on or off. Hover over anything for what it does.",
					"numinlets": 1,
					"numoutlets": 0,
					"linecount": 2,
					"fontsize": 10.0,
					"patching_rect": [
						300.0,
						460.0,
						420.0,
						30.0
					],
					"presentation": 1,
					"presentation_rect": [
						176.0,
						348.0,
						594.0,
						30.0
					],
					"id": "obj-14"
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
						500.0,
						20.0,
						70.0,
						22.0
					],
					"id": "obj-15"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "title Cento: corpora",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						500.0,
						55.0,
						150.0,
						22.0
					],
					"id": "obj-16"
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
						500.0,
						90.0,
						80.0,
						22.0
					],
					"id": "obj-17"
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
						"obj-6",
						0
					],
					"destination": [
						"obj-7",
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
						"obj-8",
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
						"obj-9",
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
			},
			{
				"patchline": {
					"source": [
						"obj-13",
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
						"obj-15",
						0
					],
					"destination": [
						"obj-16",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-16",
						0
					],
					"destination": [
						"obj-17",
						0
					]
				}
			}
		]
	}
}
