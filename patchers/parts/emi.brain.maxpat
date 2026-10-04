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
			944.0,
			540.0
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
					"maxclass": "panel",
					"numinlets": 1,
					"numoutlets": 0,
					"mode": 0,
					"border": 0,
					"rounded": 0,
					"bgcolor": [
						0.11,
						0.11,
						0.12,
						1.0
					],
					"bgfillcolor_type": "color",
					"bgfillcolor_color": [
						0.11,
						0.11,
						0.12,
						1.0
					],
					"ignoreclick": 1,
					"background": 1,
					"patching_rect": [
						1250.0,
						5.0,
						40.0,
						30.0
					],
					"presentation": 1,
					"presentation_rect": [
						0.0,
						0.0,
						884.0,
						20.0
					],
					"id": "obj-1"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "CLIPS AND VOICES",
					"numinlets": 1,
					"numoutlets": 0,
					"fontsize": 11.0,
					"fontface": 1,
					"textcolor": [
						0.95,
						0.95,
						0.93,
						1.0
					],
					"textjustification": 1,
					"patching_rect": [
						20.0,
						2.0,
						170.0,
						18.0
					],
					"presentation": 1,
					"presentation_rect": [
						0.0,
						1.0,
						170.0,
						18.0
					],
					"id": "obj-2"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "COMPOSE",
					"numinlets": 1,
					"numoutlets": 0,
					"fontsize": 11.0,
					"fontface": 1,
					"textcolor": [
						0.95,
						0.95,
						0.93,
						1.0
					],
					"textjustification": 1,
					"patching_rect": [
						198.0,
						2.0,
						300.0,
						18.0
					],
					"presentation": 1,
					"presentation_rect": [
						178.0,
						1.0,
						300.0,
						18.0
					],
					"id": "obj-3"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "MAGDALENA",
					"numinlets": 1,
					"numoutlets": 0,
					"fontsize": 11.0,
					"fontface": 1,
					"textcolor": [
						0.95,
						0.95,
						0.93,
						1.0
					],
					"textjustification": 1,
					"patching_rect": [
						506.0,
						2.0,
						130.0,
						18.0
					],
					"presentation": 1,
					"presentation_rect": [
						486.0,
						1.0,
						130.0,
						18.0
					],
					"id": "obj-4"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "PIANO ROLL",
					"numinlets": 1,
					"numoutlets": 0,
					"fontsize": 11.0,
					"fontface": 1,
					"textcolor": [
						0.95,
						0.95,
						0.93,
						1.0
					],
					"textjustification": 1,
					"patching_rect": [
						644.0,
						2.0,
						260.0,
						18.0
					],
					"presentation": 1,
					"presentation_rect": [
						624.0,
						1.0,
						260.0,
						18.0
					],
					"id": "obj-5"
				}
			},
			{
				"box": {
					"maxclass": "bpatcher",
					"name": "emi.host.live.maxpat",
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
						40.0,
						170.0,
						149.0
					],
					"presentation": 1,
					"presentation_rect": [
						0.0,
						20.0,
						170.0,
						149.0
					],
					"id": "obj-6"
				}
			},
			{
				"box": {
					"maxclass": "bpatcher",
					"name": "emi.panel.maxpat",
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
						198.0,
						40.0,
						300.0,
						149.0
					],
					"presentation": 1,
					"presentation_rect": [
						178.0,
						20.0,
						300.0,
						149.0
					],
					"id": "obj-7"
				}
			},
			{
				"box": {
					"maxclass": "bpatcher",
					"name": "emily.panel.maxpat",
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
						506.0,
						40.0,
						130.0,
						149.0
					],
					"presentation": 1,
					"presentation_rect": [
						486.0,
						20.0,
						130.0,
						149.0
					],
					"id": "obj-8"
				}
			},
			{
				"box": {
					"maxclass": "bpatcher",
					"name": "emi.view.maxpat",
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
						644.0,
						40.0,
						260.0,
						149.0
					],
					"presentation": 1,
					"presentation_rect": [
						624.0,
						20.0,
						260.0,
						149.0
					],
					"id": "obj-9"
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
					"id": "obj-10"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "route view",
					"numinlets": 2,
					"numoutlets": 2,
					"outlettype": [
						"",
						""
					],
					"patching_rect": [
						644.0,
						229.0,
						75.0,
						22.0
					],
					"id": "obj-11"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "emi.window",
					"numinlets": 1,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						744.0,
						229.0,
						80.0,
						22.0
					],
					"id": "obj-12"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "r ---emi.window",
					"numinlets": 1,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						744.0,
						269.0,
						100.0,
						22.0
					],
					"id": "obj-13"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "open",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						744.0,
						299.0,
						40.0,
						22.0
					],
					"id": "obj-14"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "pcontrol",
					"numinlets": 1,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						744.0,
						329.0,
						60.0,
						22.0
					],
					"id": "obj-15"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "emi.corpora",
					"numinlets": 1,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						864.0,
						229.0,
						80.0,
						22.0
					],
					"id": "obj-16"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "r ---emi.corpora",
					"numinlets": 1,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						864.0,
						269.0,
						110.0,
						22.0
					],
					"id": "obj-17"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "open",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						864.0,
						299.0,
						40.0,
						22.0
					],
					"id": "obj-18"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "pcontrol",
					"numinlets": 1,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						864.0,
						329.0,
						60.0,
						22.0
					],
					"id": "obj-19"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "Live version (device content): the Live adapter and the shared panel above, wired both ways to the shared engine.",
					"numinlets": 1,
					"numoutlets": 0,
					"linecount": 2,
					"patching_rect": [
						20.0,
						269.0,
						480.0,
						34.0
					],
					"id": "obj-20"
				}
			}
		],
		"lines": [
			{
				"patchline": {
					"source": [
						"obj-13",
						0
					],
					"destination": [
						"obj-14",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-14",
						0
					],
					"destination": [
						"obj-15",
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
						"obj-12",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-17",
						0
					],
					"destination": [
						"obj-18",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-18",
						0
					],
					"destination": [
						"obj-19",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-19",
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
						"obj-10",
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
						"obj-6",
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
						"obj-7",
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
						"obj-8",
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
						"obj-12",
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
						"obj-16",
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
						"obj-6",
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
						"obj-7",
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
						"obj-8",
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
			},
			{
				"patchline": {
					"source": [
						"obj-10",
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
						"obj-11",
						0
					],
					"destination": [
						"obj-9",
						0
					]
				}
			}
		]
	}
}
