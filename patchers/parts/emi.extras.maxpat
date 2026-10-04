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
			160.0,
			520.0,
			350.0
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
					"text": "emi.extras: the more features window (Max version). Opened by the panel's more features button, through [pcontrol] in emi.host.max. Its inlet also takes key <0|1> (a restored original key).",
					"numinlets": 1,
					"numoutlets": 0,
					"linecount": 2,
					"patching_rect": [
						20.0,
						640.0,
						600.0,
						34.0
					],
					"id": "obj-1"
				}
			},
			{
				"box": {
					"maxclass": "inlet",
					"comment": "pcontrol: open; key <0|1>: show a restored original key",
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
					"comment": "to emi.engine: abtest, loadmidi, key, pattern, clear",
					"index": 1,
					"numinlets": 1,
					"numoutlets": 0,
					"patching_rect": [
						20.0,
						600.0,
						30.0,
						30.0
					],
					"id": "obj-3"
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
					"varname": "Listening Test",
					"mode": 0,
					"text": "listening test\u2026",
					"texton": "listening test\u2026",
					"fontsize": 10.0,
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
							"parameter_longname": "Listening Test",
							"parameter_shortname": "listening test\u2026",
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
						20.0,
						80.0,
						150.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						10.0,
						10.0,
						150.0,
						22.0
					],
					"id": "obj-4",
					"hint": "Write a blind listening test: a web page of 10 pairs, each a Bach chorale and a piece composed in its form, in random order. Can listeners tell which is Bach?",
					"annotation": "Write a blind listening test: a web page of 10 pairs, each a Bach chorale and a piece composed in its form, in random order. Can listeners tell which is Bach?",
					"annotation_name": "listening test"
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
						110.0,
						35.0,
						22.0
					],
					"id": "obj-5"
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
						20.0,
						140.0,
						110.0,
						22.0
					],
					"id": "obj-6"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "prepend abtest",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						20.0,
						170.0,
						120.0,
						22.0
					],
					"id": "obj-7"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "A blind test: a web page of 10 pairs, a chorale and a piece in its form. Which is Bach?",
					"numinlets": 1,
					"numoutlets": 0,
					"linecount": 2,
					"fontsize": 10.0,
					"patching_rect": [
						180.0,
						80.0,
						180.0,
						34.0
					],
					"presentation": 1,
					"presentation_rect": [
						166.0,
						8.0,
						184.0,
						34.0
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
					"varname": "Load A Chorale",
					"mode": 0,
					"text": "load a chorale\u2026",
					"texton": "load a chorale\u2026",
					"fontsize": 10.0,
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
							"parameter_longname": "Load A Chorale",
							"parameter_shortname": "load a chorale\u2026",
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
						200.0,
						200.0,
						150.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						10.0,
						56.0,
						150.0,
						22.0
					],
					"id": "obj-9",
					"hint": "Load one chorale (a MIDI file): it plays as written and is drawn in the piano roll, in C major or A minor, or in its own key with original key on.",
					"annotation": "Load one chorale (a MIDI file): it plays as written and is drawn in the piano roll, in C major or A minor, or in its own key with original key on.",
					"annotation_name": "load a chorale"
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
						200.0,
						230.0,
						35.0,
						22.0
					],
					"id": "obj-10"
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
						200.0,
						260.0,
						110.0,
						22.0
					],
					"id": "obj-11"
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
						200.0,
						290.0,
						120.0,
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
					"varname": "Original Key",
					"mode": 1,
					"text": "original key",
					"texton": "original key",
					"fontsize": 10.0,
					"bgcolor": [
						0.84,
						0.82,
						0.78,
						1.0
					],
					"activebgcolor": [
						0.84,
						0.82,
						0.78,
						1.0
					],
					"bgoncolor": [
						0.96,
						0.7,
						0.33,
						1.0
					],
					"activebgoncolor": [
						0.96,
						0.7,
						0.33,
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
						380.0,
						200.0,
						100.0,
						20.0
					],
					"presentation": 1,
					"presentation_rect": [
						166.0,
						56.0,
						100.0,
						22.0
					],
					"id": "obj-13",
					"hint": "On: a chorale you load (load a chorale) keeps its own key. Off: it is moved to C major or A minor (the default). Only for loaded chorales.",
					"annotation": "On: a chorale you load (load a chorale) keeps its own key. Off: it is moved to C major or A minor (the default). Only for loaded chorales.",
					"annotation_name": "original key"
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
						380.0,
						235.0,
						80.0,
						22.0
					],
					"id": "obj-14"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "One chorale plays as written, in C major or A minor, or in its own key with original key on.",
					"numinlets": 1,
					"numoutlets": 0,
					"linecount": 2,
					"fontsize": 10.0,
					"patching_rect": [
						200.0,
						320.0,
						300.0,
						34.0
					],
					"presentation": 1,
					"presentation_rect": [
						10.0,
						82.0,
						340.0,
						34.0
					],
					"id": "obj-15"
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
					"varname": "Test Phrase",
					"mode": 0,
					"text": "play the test phrase",
					"texton": "play the test phrase",
					"fontsize": 10.0,
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
							"parameter_longname": "Test Phrase",
							"parameter_shortname": "play the test phrase",
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
						20.0,
						380.0,
						150.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						10.0,
						124.0,
						150.0,
						22.0
					],
					"id": "obj-16",
					"hint": "Play a built-in phrase (no chorales needed), to check that the voices sound.",
					"annotation": "Play a built-in phrase (no chorales needed), to check that the voices sound.",
					"annotation_name": "play the test phrase"
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
						410.0,
						35.0,
						22.0
					],
					"id": "obj-17"
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
						20.0,
						440.0,
						65.0,
						22.0
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
					"varname": "Clear Queue",
					"mode": 0,
					"text": "stop and clear the queue",
					"texton": "stop and clear the queue",
					"fontsize": 10.0,
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
							"parameter_longname": "Clear Queue",
							"parameter_shortname": "stop and clear the queue",
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
						200.0,
						380.0,
						160.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						166.0,
						124.0,
						160.0,
						22.0
					],
					"id": "obj-19",
					"hint": "What is playing stops at once, and nothing is left queued to play.",
					"annotation": "What is playing stops at once, and nothing is left queued to play.",
					"annotation_name": "stop and clear the queue"
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
						200.0,
						410.0,
						35.0,
						22.0
					],
					"id": "obj-20"
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
						200.0,
						440.0,
						51.0,
						22.0
					],
					"id": "obj-21"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "The test phrase needs no chorales: a check that the voices sound.",
					"numinlets": 1,
					"numoutlets": 0,
					"fontsize": 10.0,
					"patching_rect": [
						20.0,
						480.0,
						300.0,
						20.0
					],
					"presentation": 1,
					"presentation_rect": [
						10.0,
						150.0,
						340.0,
						20.0
					],
					"id": "obj-22"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "route key",
					"numinlets": 2,
					"numoutlets": 2,
					"outlettype": [
						"",
						""
					],
					"patching_rect": [
						380.0,
						20.0,
						70.0,
						22.0
					],
					"id": "obj-23"
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
						380.0,
						55.0,
						80.0,
						22.0
					],
					"id": "obj-24"
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
					"id": "obj-25"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "title Cento: more features",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						500.0,
						55.0,
						200.0,
						22.0
					],
					"id": "obj-26"
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
					"id": "obj-27"
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
						"obj-11",
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
						"obj-3",
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
						"obj-24",
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
						"obj-13",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-25",
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
						"obj-26",
						0
					],
					"destination": [
						"obj-27",
						0
					]
				}
			}
		]
	}
}
