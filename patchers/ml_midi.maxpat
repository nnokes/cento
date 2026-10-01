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
			50.0,
			50.0,
			640.0,
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
					"maxclass": "bpatcher",
					"name": "emi.host.max.maxpat",
					"numinlets": 1,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"offset": [
						0.0,
						0.0
					],
					"viewvisibility": 1,
					"bgmode": 0,
					"border": 0,
					"clickthrough": 0,
					"enablehscroll": 0,
					"enablevscroll": 0,
					"lockeddragscroll": 0,
					"patching_rect": [
						20.0,
						20.0,
						520.0,
						169.0
					],
					"presentation": 1,
					"presentation_rect": [
						0.0,
						0.0,
						520.0,
						169.0
					],
					"id": "obj-1"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "emi.engine",
					"numinlets": 1,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						20.0,
						229.0,
						90.0,
						22.0
					],
					"id": "obj-2"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "Max version: the adapter panel above, wired both ways to the shared engine.",
					"numinlets": 1,
					"numoutlets": 0,
					"linecount": 2,
					"patching_rect": [
						130.0,
						229.0,
						480.0,
						34.0
					],
					"id": "obj-3"
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
						"obj-1",
						0
					]
				}
			}
		]
	}
}
