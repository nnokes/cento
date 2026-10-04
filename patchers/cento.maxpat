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
			1006.0,
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
						946.0,
						20.0
					],
					"id": "obj-1"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "PLAY",
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
						192.0,
						18.0
					],
					"presentation": 1,
					"presentation_rect": [
						0.0,
						1.0,
						192.0,
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
						220.0,
						2.0,
						300.0,
						18.0
					],
					"presentation": 1,
					"presentation_rect": [
						200.0,
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
						528.0,
						2.0,
						170.0,
						18.0
					],
					"presentation": 1,
					"presentation_rect": [
						508.0,
						1.0,
						170.0,
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
						728.0,
						2.0,
						216.0,
						18.0
					],
					"presentation": 1,
					"presentation_rect": [
						708.0,
						1.0,
						216.0,
						18.0
					],
					"id": "obj-5"
				}
			},
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
						40.0,
						192.0,
						149.0
					],
					"presentation": 1,
					"presentation_rect": [
						0.0,
						20.0,
						192.0,
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
						220.0,
						40.0,
						300.0,
						149.0
					],
					"presentation": 1,
					"presentation_rect": [
						200.0,
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
						528.0,
						40.0,
						170.0,
						149.0
					],
					"presentation": 1,
					"presentation_rect": [
						508.0,
						20.0,
						170.0,
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
						706.0,
						40.0,
						260.0,
						149.0
					],
					"presentation": 1,
					"presentation_rect": [
						686.0,
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
						706.0,
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
						806.0,
						229.0,
						80.0,
						22.0
					],
					"id": "obj-12"
				}
			},
			{
				"box": {
					"maxclass": "live.text",
					"numinlets": 1,
					"numoutlets": 2,
					"outlettype": [
						"",
						""
					],
					"parameter_enable": 1,
					"varname": "Window",
					"mode": 0,
					"text": "\u2197",
					"texton": "\u2197",
					"fontsize": 12.0,
					"bgcolor": [
						0.8,
						0.85,
						0.93,
						1.0
					],
					"activebgcolor": [
						0.8,
						0.85,
						0.93,
						1.0
					],
					"bgoncolor": [
						0.6,
						0.69,
						0.84,
						1.0
					],
					"activebgoncolor": [
						0.6,
						0.69,
						0.84,
						1.0
					],
					"textcolor": [
						0.08,
						0.08,
						0.09,
						1.0
					],
					"activetextcolor": [
						0.08,
						0.08,
						0.09,
						1.0
					],
					"textoncolor": [
						0.08,
						0.08,
						0.09,
						1.0
					],
					"activetextoncolor": [
						0.08,
						0.08,
						0.09,
						1.0
					],
					"saved_attribute_attributes": {
						"valueof": {
							"parameter_enum": [
								"off",
								"on"
							],
							"parameter_longname": "Window",
							"parameter_shortname": "\u2197",
							"parameter_type": 2,
							"parameter_mmax": 1,
							"parameter_initial": [
								0
							],
							"parameter_initial_enable": 0,
							"parameter_invisible": 2
						}
					},
					"patching_rect": [
						806.0,
						269.0,
						18.0,
						18.0
					],
					"presentation": 1,
					"presentation_rect": [
						927.0,
						1.0,
						18.0,
						18.0
					],
					"id": "obj-13",
					"hint": "Open the pop-up window: a large piano roll and Magdalena's taste in full, where you can edit her weights and see her memory (and read who she is).",
					"annotation": "Open the pop-up window: a large piano roll and Magdalena's taste in full, where you can edit her weights and see her memory (and read who she is).",
					"annotation_name": "window"
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
						806.0,
						299.0,
						35.0,
						22.0
					],
					"id": "obj-14"
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
						806.0,
						329.0,
						40.0,
						22.0
					],
					"id": "obj-15"
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
						806.0,
						359.0,
						60.0,
						22.0
					],
					"id": "obj-16"
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
						926.0,
						229.0,
						80.0,
						22.0
					],
					"id": "obj-17"
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
						926.0,
						269.0,
						110.0,
						22.0
					],
					"id": "obj-18"
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
						926.0,
						299.0,
						40.0,
						22.0
					],
					"id": "obj-19"
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
						926.0,
						329.0,
						60.0,
						22.0
					],
					"id": "obj-20"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "Max version: the Max adapter and the shared panel above, wired both ways to the shared engine.",
					"numinlets": 1,
					"numoutlets": 0,
					"linecount": 2,
					"patching_rect": [
						20.0,
						269.0,
						480.0,
						34.0
					],
					"id": "obj-21"
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
						"obj-12",
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
						"obj-20",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-20",
						0
					],
					"destination": [
						"obj-17",
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
						"obj-17",
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
						"obj-17",
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
