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
			1000.0,
			620.0
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
					"maxclass": "comment",
					"text": "emily.panel: Emily's taste (M9), shared by both products. like and dislike rate the beats selected in the piano roll, or the stream phrase playing, or the piece; temperature sets how much chance still plays; accept keeps what is playing as music of her own (M10). like, dislike, accept and temperature are live.* parameters, so they can be MIDI- or key-mapped. Panel 130 x 169 px.",
					"numinlets": 1,
					"numoutlets": 0,
					"linecount": 3,
					"patching_rect": [
						20.0,
						5.0,
						900.0,
						48.0
					],
					"id": "obj-1"
				}
			},
			{
				"box": {
					"maxclass": "inlet",
					"comment": "from emi.engine: emily, setting",
					"index": 1,
					"numinlets": 0,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						20.0,
						60.0,
						30.0,
						30.0
					],
					"id": "obj-2"
				}
			},
			{
				"box": {
					"maxclass": "outlet",
					"comment": "to emi.engine",
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
					"maxclass": "comment",
					"text": "Emily",
					"numinlets": 1,
					"numoutlets": 0,
					"fontface": 1,
					"patching_rect": [
						20.0,
						100.0,
						60.0,
						20.0
					],
					"presentation": 1,
					"presentation_rect": [
						6.0,
						4.0,
						60.0,
						20.0
					],
					"id": "obj-4"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "window",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						600.0,
						300.0,
						58.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						66.0,
						4.0,
						58.0,
						20.0
					],
					"id": "obj-5"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "s ---emi.window",
					"numinlets": 1,
					"numoutlets": 0,
					"outlettype": [],
					"patching_rect": [
						600.0,
						335.0,
						110.0,
						22.0
					],
					"id": "obj-6"
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
					"varname": "Like",
					"mode": 0,
					"text": "like",
					"texton": "like",
					"saved_attribute_attributes": {
						"valueof": {
							"parameter_enum": [
								"off",
								"on"
							],
							"parameter_longname": "Like",
							"parameter_shortname": "like",
							"parameter_type": 2,
							"parameter_mmax": 1,
							"parameter_initial": [
								0
							],
							"parameter_initial_enable": 0
						}
					},
					"patching_rect": [
						20.0,
						140.0,
						57.0,
						30.0
					],
					"presentation": 1,
					"presentation_rect": [
						6.0,
						26.0,
						57.0,
						30.0
					],
					"id": "obj-7"
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
					"varname": "Dislike",
					"mode": 0,
					"text": "dislike",
					"texton": "dislike",
					"saved_attribute_attributes": {
						"valueof": {
							"parameter_enum": [
								"off",
								"on"
							],
							"parameter_longname": "Dislike",
							"parameter_shortname": "dislike",
							"parameter_type": 2,
							"parameter_mmax": 1,
							"parameter_initial": [
								0
							],
							"parameter_initial_enable": 0
						}
					},
					"patching_rect": [
						120.0,
						140.0,
						57.0,
						30.0
					],
					"presentation": 1,
					"presentation_rect": [
						67.0,
						26.0,
						57.0,
						30.0
					],
					"id": "obj-8"
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
						185.0,
						55.0,
						22.0
					],
					"id": "obj-9"
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
						120.0,
						185.0,
						55.0,
						22.0
					],
					"id": "obj-10"
				}
			},
			{
				"box": {
					"maxclass": "live.dial",
					"numinlets": 1,
					"numoutlets": 2,
					"outlettype": [
						"",
						"float"
					],
					"parameter_enable": 1,
					"varname": "Temperature",
					"saved_attribute_attributes": {
						"valueof": {
							"parameter_longname": "Temperature",
							"parameter_shortname": "temp",
							"parameter_type": 0,
							"parameter_mmin": 0.0,
							"parameter_mmax": 3.0,
							"parameter_initial": [
								1.0
							],
							"parameter_initial_enable": 1,
							"parameter_unitstyle": 1
						}
					},
					"patching_rect": [
						240.0,
						140.0,
						44.0,
						48.0
					],
					"presentation": 1,
					"presentation_rect": [
						6.0,
						60.0,
						44.0,
						48.0
					],
					"id": "obj-11"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "prepend temperature",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						240.0,
						200.0,
						130.0,
						22.0
					],
					"id": "obj-12"
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
						400.0,
						140.0,
						51.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						60.0,
						62.0,
						64.0,
						20.0
					],
					"id": "obj-13"
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
					"varname": "Accept",
					"mode": 0,
					"text": "accept",
					"texton": "accept",
					"saved_attribute_attributes": {
						"valueof": {
							"parameter_enum": [
								"off",
								"on"
							],
							"parameter_longname": "Accept",
							"parameter_shortname": "accept",
							"parameter_type": 2,
							"parameter_mmax": 1,
							"parameter_initial": [
								0
							],
							"parameter_initial_enable": 0
						}
					},
					"patching_rect": [
						460.0,
						140.0,
						64.0,
						20.0
					],
					"presentation": 1,
					"presentation_rect": [
						60.0,
						86.0,
						64.0,
						20.0
					],
					"id": "obj-14"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "accept",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						460.0,
						185.0,
						55.0,
						22.0
					],
					"id": "obj-15"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "temperature: 0 Emily's favourite choices only, 1 as before Emily, 3 adventurous. taste: her taste in the Max window and ten pieces compared; accept: keep it (M10)",
					"numinlets": 1,
					"numoutlets": 0,
					"linecount": 3,
					"patching_rect": [
						520.0,
						140.0,
						330.0,
						48.0
					],
					"id": "obj-16"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "route emily setting",
					"numinlets": 2,
					"numoutlets": 3,
					"outlettype": [
						"",
						"",
						""
					],
					"patching_rect": [
						20.0,
						300.0,
						120.0,
						22.0
					],
					"id": "obj-17"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "prepend text",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						20.0,
						340.0,
						98.0,
						22.0
					],
					"id": "obj-18"
				}
			},
			{
				"box": {
					"maxclass": "v8ui",
					"filename": "emi.text.bundle.js",
					"textfile": {
						"filename": "emi.text.bundle.js",
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
						380.0,
						118.0,
						51.0
					],
					"presentation": 1,
					"presentation_rect": [
						6.0,
						112.0,
						118.0,
						51.0
					],
					"id": "obj-19"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "route temperature",
					"numinlets": 2,
					"numoutlets": 2,
					"outlettype": [
						"",
						""
					],
					"patching_rect": [
						200.0,
						340.0,
						110.0,
						22.0
					],
					"id": "obj-20"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "prepend set",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						200.0,
						380.0,
						91.0,
						22.0
					],
					"id": "obj-21"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "setting temperature <t>: show a restored value without sending it back",
					"numinlets": 1,
					"numoutlets": 0,
					"patching_rect": [
						330.0,
						380.0,
						300.0,
						20.0
					],
					"id": "obj-22"
				}
			}
		],
		"lines": [
			{
				"patchline": {
					"source": [
						"obj-5",
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
						"obj-7",
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
						"obj-3",
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
						"obj-3",
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
						"obj-17",
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
						"obj-17",
						1
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
						"obj-21",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-21",
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
