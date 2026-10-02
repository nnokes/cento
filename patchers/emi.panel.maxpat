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
			760.0
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
					"text": "emi.panel: the composing controls, shared by both products (Max version and Live device). Seed, beats, form and original key are live.* parameters: Live saves them with the set; the Max version restores them from the settings file. Panel 300 x 169 px.",
					"numinlets": 1,
					"numoutlets": 0,
					"linecount": 2,
					"patching_rect": [
						20.0,
						5.0,
						1000.0,
						34.0
					],
					"id": "obj-1"
				}
			},
			{
				"box": {
					"maxclass": "inlet",
					"comment": "from emi.engine: status, error, setting",
					"index": 1,
					"numinlets": 0,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						20.0,
						50.0,
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
						720.0,
						30.0,
						30.0
					],
					"id": "obj-3"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "load chorale",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						20.0,
						100.0,
						100.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						6.0,
						4.0,
						90.0,
						20.0
					],
					"id": "obj-4"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "route load",
					"numinlets": 2,
					"numoutlets": 2,
					"outlettype": [
						"",
						""
					],
					"patching_rect": [
						20.0,
						130.0,
						80.0,
						22.0
					],
					"id": "obj-5"
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
						160.0,
						35.0,
						22.0
					],
					"id": "obj-6"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "opendialog",
					"numinlets": 1,
					"numoutlets": 2,
					"outlettype": [
						"",
						"bang"
					],
					"patching_rect": [
						20.0,
						190.0,
						110.0,
						22.0
					],
					"id": "obj-7"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "prepend loadmidi",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						20.0,
						220.0,
						120.0,
						22.0
					],
					"id": "obj-8"
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
					"varname": "Original Key",
					"mode": 1,
					"text": "original key",
					"texton": "original key",
					"saved_attribute_attributes": {
						"valueof": {
							"parameter_enum": [
								"off",
								"on"
							],
							"parameter_longname": "Original Key",
							"parameter_shortname": "Original Key",
							"parameter_type": 2,
							"parameter_mmax": 1,
							"parameter_initial": [
								0
							],
							"parameter_initial_enable": 1
						}
					},
					"patching_rect": [
						180.0,
						100.0,
						100.0,
						20.0
					],
					"presentation": 1,
					"presentation_rect": [
						100.0,
						4.0,
						90.0,
						20.0
					],
					"id": "obj-9"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "prepend key",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						180.0,
						135.0,
						80.0,
						22.0
					],
					"id": "obj-10"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "pattern",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						300.0,
						100.0,
						65.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						194.0,
						4.0,
						50.0,
						20.0
					],
					"id": "obj-11"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "clear",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						380.0,
						100.0,
						51.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						248.0,
						4.0,
						46.0,
						20.0
					],
					"id": "obj-12"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "load corpus",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						20.0,
						300.0,
						93.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						6.0,
						30.0,
						90.0,
						20.0
					],
					"id": "obj-13"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "route load",
					"numinlets": 2,
					"numoutlets": 2,
					"outlettype": [
						"",
						""
					],
					"patching_rect": [
						20.0,
						330.0,
						80.0,
						22.0
					],
					"id": "obj-14"
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
						360.0,
						35.0,
						22.0
					],
					"id": "obj-15"
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
						390.0,
						110.0,
						22.0
					],
					"id": "obj-16"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "prepend corpus",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						20.0,
						420.0,
						120.0,
						22.0
					],
					"id": "obj-17"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "choose ~/Documents/ml_midi/corpus (all chorales in it are read)",
					"numinlets": 1,
					"numoutlets": 0,
					"linecount": 2,
					"patching_rect": [
						150.0,
						390.0,
						230.0,
						34.0
					],
					"id": "obj-18"
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
					"varname": "Form",
					"mode": 1,
					"text": "form",
					"texton": "form",
					"saved_attribute_attributes": {
						"valueof": {
							"parameter_enum": [
								"off",
								"on"
							],
							"parameter_longname": "Form",
							"parameter_shortname": "Form",
							"parameter_type": 2,
							"parameter_mmax": 1,
							"parameter_initial": [
								1
							],
							"parameter_initial_enable": 1
						}
					},
					"patching_rect": [
						420.0,
						300.0,
						100.0,
						20.0
					],
					"presentation": 1,
					"presentation_rect": [
						100.0,
						30.0,
						50.0,
						20.0
					],
					"id": "obj-19"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "prepend form",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						420.0,
						335.0,
						90.0,
						22.0
					],
					"id": "obj-20"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "beats",
					"numinlets": 1,
					"numoutlets": 0,
					"patching_rect": [
						540.0,
						270.0,
						40.0,
						20.0
					],
					"presentation": 1,
					"presentation_rect": [
						156.0,
						30.0,
						36.0,
						20.0
					],
					"id": "obj-21"
				}
			},
			{
				"box": {
					"maxclass": "live.numbox",
					"numinlets": 1,
					"numoutlets": 2,
					"outlettype": [
						"",
						"float"
					],
					"parameter_enable": 1,
					"varname": "Beats",
					"saved_attribute_attributes": {
						"valueof": {
							"parameter_longname": "Beats",
							"parameter_shortname": "Beats",
							"parameter_type": 1,
							"parameter_mmin": 4,
							"parameter_mmax": 256,
							"parameter_initial": [
								32
							],
							"parameter_initial_enable": 1,
							"parameter_unitstyle": 0
						}
					},
					"patching_rect": [
						540.0,
						300.0,
						56.0,
						15.0
					],
					"presentation": 1,
					"presentation_rect": [
						194.0,
						30.0,
						50.0,
						20.0
					],
					"id": "obj-22"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "prepend beats",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						540.0,
						335.0,
						95.0,
						22.0
					],
					"id": "obj-23"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "compose",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						660.0,
						300.0,
						65.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						6.0,
						56.0,
						64.0,
						20.0
					],
					"id": "obj-24"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "seed",
					"numinlets": 1,
					"numoutlets": 0,
					"patching_rect": [
						740.0,
						270.0,
						40.0,
						20.0
					],
					"presentation": 1,
					"presentation_rect": [
						74.0,
						56.0,
						30.0,
						20.0
					],
					"id": "obj-25"
				}
			},
			{
				"box": {
					"maxclass": "live.numbox",
					"numinlets": 1,
					"numoutlets": 2,
					"outlettype": [
						"",
						"float"
					],
					"parameter_enable": 1,
					"varname": "Seed",
					"saved_attribute_attributes": {
						"valueof": {
							"parameter_longname": "Seed",
							"parameter_shortname": "Seed",
							"parameter_type": 1,
							"parameter_mmin": 1,
							"parameter_mmax": 99999,
							"parameter_initial": [
								1
							],
							"parameter_initial_enable": 1,
							"parameter_unitstyle": 0
						}
					},
					"patching_rect": [
						740.0,
						300.0,
						56.0,
						15.0
					],
					"presentation": 1,
					"presentation_rect": [
						106.0,
						56.0,
						56.0,
						20.0
					],
					"id": "obj-26"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "prepend seed",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						740.0,
						335.0,
						90.0,
						22.0
					],
					"id": "obj-27"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "next",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						860.0,
						300.0,
						44.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						166.0,
						56.0,
						40.0,
						20.0
					],
					"id": "obj-28"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "seed: composes when changed (once a corpus is loaded); compose: the shown seed again; next: seed + 1",
					"numinlets": 1,
					"numoutlets": 0,
					"linecount": 2,
					"patching_rect": [
						660.0,
						370.0,
						330.0,
						34.0
					],
					"id": "obj-29"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "export midi",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						1000.0,
						300.0,
						93.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						210.0,
						56.0,
						84.0,
						20.0
					],
					"id": "obj-30"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "route export",
					"numinlets": 2,
					"numoutlets": 2,
					"outlettype": [
						"",
						""
					],
					"patching_rect": [
						1000.0,
						330.0,
						80.0,
						22.0
					],
					"id": "obj-31"
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
						1000.0,
						360.0,
						35.0,
						22.0
					],
					"id": "obj-32"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "savedialog",
					"numinlets": 1,
					"numoutlets": 2,
					"outlettype": [
						"",
						"bang"
					],
					"patching_rect": [
						1000.0,
						390.0,
						110.0,
						22.0
					],
					"id": "obj-33"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "prepend exportmidi",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						1000.0,
						420.0,
						120.0,
						22.0
					],
					"id": "obj-34"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "route status error setting",
					"numinlets": 2,
					"numoutlets": 4,
					"outlettype": [
						"",
						"",
						"",
						""
					],
					"patching_rect": [
						20.0,
						520.0,
						170.0,
						22.0
					],
					"id": "obj-35"
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
						20.0,
						560.0,
						91.0,
						22.0
					],
					"id": "obj-36"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "prepend set error:",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						150.0,
						560.0,
						120.0,
						22.0
					],
					"id": "obj-37"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						20.0,
						600.0,
						360.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						6.0,
						84.0,
						288.0,
						79.0
					],
					"id": "obj-38"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "route seed beats form key",
					"numinlets": 2,
					"numoutlets": 5,
					"outlettype": [
						"",
						"",
						"",
						"",
						""
					],
					"patching_rect": [
						420.0,
						560.0,
						170.0,
						22.0
					],
					"id": "obj-39"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "setting <name> <value>: show it without sending it back",
					"numinlets": 1,
					"numoutlets": 0,
					"patching_rect": [
						600.0,
						560.0,
						330.0,
						20.0
					],
					"id": "obj-40"
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
						420.0,
						600.0,
						80.0,
						22.0
					],
					"id": "obj-41"
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
						520.0,
						600.0,
						80.0,
						22.0
					],
					"id": "obj-42"
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
						620.0,
						600.0,
						80.0,
						22.0
					],
					"id": "obj-43"
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
						720.0,
						600.0,
						80.0,
						22.0
					],
					"id": "obj-44"
				}
			}
		],
		"lines": [
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
						"obj-6",
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
						"obj-3",
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
						"obj-3",
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
						"obj-3",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-22",
						0
					],
					"destination": [
						"obj-23",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-23",
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
						"obj-24",
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
						"obj-26",
						0
					],
					"destination": [
						"obj-27",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-27",
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
						"obj-28",
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
						"obj-30",
						0
					],
					"destination": [
						"obj-31",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-31",
						0
					],
					"destination": [
						"obj-32",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-32",
						0
					],
					"destination": [
						"obj-33",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-33",
						0
					],
					"destination": [
						"obj-34",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-34",
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
						"obj-35",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-35",
						0
					],
					"destination": [
						"obj-36",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-35",
						1
					],
					"destination": [
						"obj-37",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-36",
						0
					],
					"destination": [
						"obj-38",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-37",
						0
					],
					"destination": [
						"obj-38",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-35",
						2
					],
					"destination": [
						"obj-39",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-39",
						0
					],
					"destination": [
						"obj-41",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-41",
						0
					],
					"destination": [
						"obj-26",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-39",
						1
					],
					"destination": [
						"obj-42",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-42",
						0
					],
					"destination": [
						"obj-22",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-39",
						2
					],
					"destination": [
						"obj-43",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-43",
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
						"obj-39",
						3
					],
					"destination": [
						"obj-44",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-44",
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
