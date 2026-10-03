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
					"text": "emi.panel: the composing controls, shared by both products (Max version and Live device). A/B writes a blind listening test. Seed, beats, form, original key, stream, phrases, transpose and sigs are live.* parameters: Live saves them with the set; the Max version restores them from the settings file. Panel 300 x 169 px.",
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
					"id": "obj-4",
					"hint": "Load one chorale (a MIDI file) and make it current: it plays as written and is drawn in the piano roll. To compose, use corpora.",
					"annotation": "Load one chorale (a MIDI file) and make it current: it plays as written and is drawn in the piano roll. To compose, use corpora.",
					"annotation_name": "load chorale"
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
					"id": "obj-9",
					"hint": "On: a chorale you load keeps its own key. Off: it is moved to C major or A minor (the default). Only for load chorale.",
					"annotation": "On: a chorale you load keeps its own key. Off: it is moved to C major or A minor (the default). Only for load chorale.",
					"annotation_name": "Original Key"
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
					"id": "obj-11",
					"hint": "Make the built-in test phrase current (no corpus needed): a quick check that the voices sound.",
					"annotation": "Make the built-in test phrase current (no corpus needed): a quick check that the voices sound.",
					"annotation_name": "pattern"
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
					"id": "obj-12",
					"hint": "Empty the queue: what is playing stops at once. The piano roll still shows it.",
					"annotation": "Empty the queue: what is playing stops at once. The piano roll still shows it.",
					"annotation_name": "clear"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "corpora",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						20.0,
						300.0,
						65.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						6.0,
						30.0,
						90.0,
						20.0
					],
					"id": "obj-13",
					"hint": "Open the corpus window: the folders of chorales (MIDI files) to compose from, each switched on or off. Composing uses every folder that is on, as one corpus; it is reloaded by itself next time.",
					"annotation": "Open the corpus window: the folders of chorales (MIDI files) to compose from, each switched on or off. Composing uses every folder that is on, as one corpus; it is reloaded by itself next time.",
					"annotation_name": "corpora"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "s ---emi.corpora",
					"numinlets": 1,
					"numoutlets": 0,
					"outlettype": [],
					"patching_rect": [
						20.0,
						335.0,
						110.0,
						22.0
					],
					"id": "obj-14"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "corpora: open the corpus window (folders of chorales, each on or off)",
					"numinlets": 1,
					"numoutlets": 0,
					"linecount": 2,
					"patching_rect": [
						150.0,
						390.0,
						230.0,
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
					"id": "obj-16",
					"hint": "On: each piece takes the form of a real chorale: its phrases and cadences fall in the same places. Off: beats are joined freely, with no phrase plan.",
					"annotation": "On: each piece takes the form of a real chorale: its phrases and cadences fall in the same places. Off: beats are joined freely, with no phrase plan.",
					"annotation_name": "Form"
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
					"id": "obj-17"
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
					"id": "obj-18"
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
					"id": "obj-19",
					"hint": "The shortest piece to compose, in beats (4 to 256). With form on, only chorales at least this long lend their form.",
					"annotation": "The shortest piece to compose, in beats (4 to 256). With form on, only chorales at least this long lend their form.",
					"annotation_name": "Beats"
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
					"id": "obj-20"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "A/B",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						1180.0,
						300.0,
						37.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						250.0,
						30.0,
						44.0,
						20.0
					],
					"id": "obj-21",
					"hint": "Write a blind listening test: a web page of 10 pairs, each a Bach chorale and a piece composed in its form, in random order. Can listeners tell which is Bach?",
					"annotation": "Write a blind listening test: a web page of 10 pairs, each a Bach chorale and a piece composed in its form, in random order. Can listeners tell which is Bach?",
					"annotation_name": "A/B"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "route A/B",
					"numinlets": 2,
					"numoutlets": 2,
					"outlettype": [
						"",
						""
					],
					"patching_rect": [
						1180.0,
						330.0,
						80.0,
						22.0
					],
					"id": "obj-22"
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
						1180.0,
						360.0,
						35.0,
						22.0
					],
					"id": "obj-23"
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
						1180.0,
						390.0,
						110.0,
						22.0
					],
					"id": "obj-24"
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
						1180.0,
						420.0,
						120.0,
						22.0
					],
					"id": "obj-25"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "A/B: write a blind listening test (a web page) of the loaded corpus",
					"numinlets": 1,
					"numoutlets": 0,
					"linecount": 2,
					"patching_rect": [
						1180.0,
						460.0,
						200.0,
						34.0
					],
					"id": "obj-26"
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
					"id": "obj-27",
					"hint": "Compose a piece with the seed shown (with stream on: start a stream). While playing, the new music starts at the next bar.",
					"annotation": "Compose a piece with the seed shown (with stream on: start a stream). While playing, the new music starts at the next bar.",
					"annotation_name": "compose"
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
					"id": "obj-28"
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
					"id": "obj-29",
					"hint": "The random seed: the same seed, corpus, settings and taste always give the same piece. Changing it composes at once (once a corpus is loaded).",
					"annotation": "The random seed: the same seed, corpus, settings and taste always give the same piece. Changing it composes at once (once a corpus is loaded).",
					"annotation_name": "Seed"
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
					"id": "obj-30"
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
					"id": "obj-31",
					"hint": "Add 1 to the seed and compose: the quickest way to hear another piece.",
					"annotation": "Add 1 to the seed and compose: the quickest way to hear another piece.",
					"annotation_name": "next"
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
					"id": "obj-32"
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
					"id": "obj-33",
					"hint": "Save the current piece as a MIDI file. For a composed piece or stream, a .json of where every beat came from is saved next to it.",
					"annotation": "Save the current piece as a MIDI file. For a composed piece or stream, a .json of where every beat came from is saved next to it.",
					"annotation_name": "export midi"
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
					"id": "obj-34"
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
					"id": "obj-35"
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
					"id": "obj-36"
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
					"id": "obj-37"
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
					"varname": "Stream",
					"mode": 1,
					"text": "stream",
					"texton": "stream",
					"saved_attribute_attributes": {
						"valueof": {
							"parameter_enum": [
								"off",
								"on"
							],
							"parameter_longname": "Stream",
							"parameter_shortname": "Stream",
							"parameter_type": 2,
							"parameter_mmax": 1,
							"parameter_initial": [
								0
							],
							"parameter_initial_enable": 1
						}
					},
					"patching_rect": [
						20.0,
						470.0,
						100.0,
						20.0
					],
					"presentation": 1,
					"presentation_rect": [
						6.0,
						82.0,
						56.0,
						20.0
					],
					"id": "obj-38",
					"hint": "On: compose starts a stream, composed a phrase at a time while it plays, for as many phrases as phrases says. Off: compose makes a whole piece.",
					"annotation": "On: compose starts a stream, composed a phrase at a time while it plays, for as many phrases as phrases says. Off: compose makes a whole piece.",
					"annotation_name": "Stream"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "prepend stream",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						20.0,
						505.0,
						100.0,
						22.0
					],
					"id": "obj-39"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "phrases",
					"numinlets": 1,
					"numoutlets": 0,
					"patching_rect": [
						140.0,
						440.0,
						50.0,
						20.0
					],
					"presentation": 1,
					"presentation_rect": [
						66.0,
						82.0,
						48.0,
						20.0
					],
					"id": "obj-40"
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
					"varname": "Phrases",
					"saved_attribute_attributes": {
						"valueof": {
							"parameter_longname": "Phrases",
							"parameter_shortname": "Phrases",
							"parameter_type": 1,
							"parameter_mmin": 0,
							"parameter_mmax": 64,
							"parameter_initial": [
								8
							],
							"parameter_initial_enable": 1,
							"parameter_unitstyle": 0
						}
					},
					"patching_rect": [
						140.0,
						470.0,
						56.0,
						15.0
					],
					"presentation": 1,
					"presentation_rect": [
						114.0,
						82.0,
						40.0,
						20.0
					],
					"id": "obj-41",
					"hint": "How many phrases a stream plays before it ends (0: endless).",
					"annotation": "How many phrases a stream plays before it ends (0: endless).",
					"annotation_name": "Phrases"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "prepend phrases",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						140.0,
						505.0,
						105.0,
						22.0
					],
					"id": "obj-42"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "transp.",
					"numinlets": 1,
					"numoutlets": 0,
					"patching_rect": [
						270.0,
						440.0,
						50.0,
						20.0
					],
					"presentation": 1,
					"presentation_rect": [
						160.0,
						82.0,
						46.0,
						20.0
					],
					"id": "obj-43"
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
					"varname": "Transpose",
					"saved_attribute_attributes": {
						"valueof": {
							"parameter_longname": "Transpose",
							"parameter_shortname": "Transpose",
							"parameter_type": 1,
							"parameter_mmin": -12,
							"parameter_mmax": 12,
							"parameter_initial": [
								0
							],
							"parameter_initial_enable": 1,
							"parameter_unitstyle": 0
						}
					},
					"patching_rect": [
						270.0,
						470.0,
						56.0,
						15.0
					],
					"presentation": 1,
					"presentation_rect": [
						206.0,
						82.0,
						40.0,
						20.0
					],
					"id": "obj-44",
					"hint": "Transpose the music by semitones (-12 to 12): a piece at once, a stream from its next phrase.",
					"annotation": "Transpose the music by semitones (-12 to 12): a piece at once, a stream from its next phrase.",
					"annotation_name": "Transpose"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "prepend transpose",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						270.0,
						505.0,
						115.0,
						22.0
					],
					"id": "obj-45"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "stream: compose plays phrase by phrase (phrases 0 = endless); transpose: at once for a piece, from the next phrase in a stream",
					"numinlets": 1,
					"numoutlets": 0,
					"linecount": 2,
					"patching_rect": [
						400.0,
						470.0,
						330.0,
						34.0
					],
					"id": "obj-46"
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
					"varname": "Signatures",
					"mode": 1,
					"text": "sigs",
					"texton": "sigs",
					"saved_attribute_attributes": {
						"valueof": {
							"parameter_enum": [
								"off",
								"on"
							],
							"parameter_longname": "Signatures",
							"parameter_shortname": "Signatures",
							"parameter_type": 2,
							"parameter_mmax": 1,
							"parameter_initial": [
								1
							],
							"parameter_initial_enable": 1
						}
					},
					"patching_rect": [
						760.0,
						470.0,
						100.0,
						20.0
					],
					"presentation": 1,
					"presentation_rect": [
						250.0,
						82.0,
						44.0,
						20.0
					],
					"id": "obj-47",
					"hint": "On: Bach's signatures (cadence formulas found in several chorales) are kept whole at cadences, shown as gold bands in the piano roll. Off: cadences are recombined like any other beats.",
					"annotation": "On: Bach's signatures (cadence formulas found in several chorales) are kept whole at cadences, shown as gold bands in the piano roll. Off: cadences are recombined like any other beats.",
					"annotation_name": "Signatures"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "prepend sigs",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						760.0,
						505.0,
						90.0,
						22.0
					],
					"id": "obj-48"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "sigs: keep signatures (Bach's cadence formulas) whole at cadences",
					"numinlets": 1,
					"numoutlets": 0,
					"linecount": 2,
					"patching_rect": [
						870.0,
						470.0,
						250.0,
						34.0
					],
					"id": "obj-49"
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
						560.0,
						170.0,
						22.0
					],
					"id": "obj-50"
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
						600.0,
						98.0,
						22.0
					],
					"id": "obj-51"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "prepend alert",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						150.0,
						600.0,
						100.0,
						22.0
					],
					"id": "obj-52"
				}
			},
			{
				"box": {
					"maxclass": "v8ui",
					"filename": "emi.text.bundle.js",
					"varname": "Status",
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
						640.0,
						288.0,
						55.0
					],
					"presentation": 1,
					"presentation_rect": [
						6.0,
						108.0,
						288.0,
						55.0
					],
					"id": "obj-53",
					"hint": "What the engine just did, or what went wrong.",
					"annotation": "What the engine just did, or what went wrong.",
					"annotation_name": "Status"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "route seed beats form key stream phrases transpose sigs",
					"numinlets": 2,
					"numoutlets": 9,
					"outlettype": [
						"",
						"",
						"",
						"",
						"",
						"",
						"",
						"",
						""
					],
					"patching_rect": [
						420.0,
						560.0,
						360.0,
						22.0
					],
					"id": "obj-54"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "setting <name> <value>: show it without sending it back",
					"numinlets": 1,
					"numoutlets": 0,
					"patching_rect": [
						800.0,
						560.0,
						330.0,
						20.0
					],
					"id": "obj-55"
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
						640.0,
						80.0,
						22.0
					],
					"id": "obj-56"
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
						515.0,
						640.0,
						80.0,
						22.0
					],
					"id": "obj-57"
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
						610.0,
						640.0,
						80.0,
						22.0
					],
					"id": "obj-58"
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
						705.0,
						640.0,
						80.0,
						22.0
					],
					"id": "obj-59"
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
						800.0,
						640.0,
						80.0,
						22.0
					],
					"id": "obj-60"
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
						895.0,
						640.0,
						80.0,
						22.0
					],
					"id": "obj-61"
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
						990.0,
						640.0,
						80.0,
						22.0
					],
					"id": "obj-62"
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
						1085.0,
						640.0,
						80.0,
						22.0
					],
					"id": "obj-63"
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
						"obj-21",
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
						"obj-25",
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
						"obj-3",
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
						"obj-29",
						0
					],
					"destination": [
						"obj-30",
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
						"obj-3",
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
						"obj-3",
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
						"obj-36",
						0
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
						"obj-37",
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
						"obj-38",
						0
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
						"obj-3",
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
						"obj-3",
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
						"obj-45",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-45",
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
						"obj-47",
						0
					],
					"destination": [
						"obj-48",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-48",
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
						"obj-50",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-50",
						0
					],
					"destination": [
						"obj-51",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-50",
						1
					],
					"destination": [
						"obj-52",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-51",
						0
					],
					"destination": [
						"obj-53",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-52",
						0
					],
					"destination": [
						"obj-53",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-50",
						2
					],
					"destination": [
						"obj-54",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-54",
						0
					],
					"destination": [
						"obj-56",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-56",
						0
					],
					"destination": [
						"obj-29",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-54",
						1
					],
					"destination": [
						"obj-57",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-57",
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
						"obj-54",
						2
					],
					"destination": [
						"obj-58",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-58",
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
						"obj-54",
						3
					],
					"destination": [
						"obj-59",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-59",
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
						"obj-54",
						4
					],
					"destination": [
						"obj-60",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-60",
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
						"obj-54",
						5
					],
					"destination": [
						"obj-61",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-61",
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
						"obj-54",
						6
					],
					"destination": [
						"obj-62",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-62",
						0
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
						"obj-54",
						7
					],
					"destination": [
						"obj-63",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-63",
						0
					],
					"destination": [
						"obj-47",
						0
					]
				}
			}
		]
	}
}
