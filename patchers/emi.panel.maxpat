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
					"text": "emi.panel: the composing controls, shared by both products (Max version and Live device), in the order you use them (GUI redesign, M12): compose first, then which chorales and how long, then streams; the less-used tools are in the tools menu. Seed, beats, form, stream, phrases, transpose and signatures are live.* parameters: Live saves them with the set; the Max version restores them from the settings file. Panel 300 x 169 px.",
					"numinlets": 1,
					"numoutlets": 0,
					"linecount": 3,
					"patching_rect": [
						20.0,
						5.0,
						1000.0,
						48.0
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
						720.0,
						30.0,
						30.0
					],
					"id": "obj-3"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "COMPOSE",
					"numinlets": 1,
					"numoutlets": 0,
					"fontsize": 10.0,
					"fontface": 1,
					"textcolor": [
						0.55,
						0.55,
						0.55,
						1.0
					],
					"patching_rect": [
						20.0,
						70.0,
						120.0,
						20.0
					],
					"presentation": 1,
					"presentation_rect": [
						6.0,
						1.0,
						90.0,
						18.0
					],
					"id": "obj-4"
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
					"bgcolor": [
						0.24,
						0.44,
						0.71,
						1.0
					],
					"bgfillcolor_type": "color",
					"bgfillcolor_color": [
						0.24,
						0.44,
						0.71,
						1.0
					],
					"textcolor": [
						1.0,
						1.0,
						1.0,
						1.0
					],
					"fontface": 1,
					"patching_rect": [
						660.0,
						300.0,
						65.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						6.0,
						19.0,
						76.0,
						24.0
					],
					"id": "obj-5",
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
					"fontsize": 10.0,
					"patching_rect": [
						740.0,
						270.0,
						40.0,
						20.0
					],
					"presentation": 1,
					"presentation_rect": [
						86.0,
						22.0,
						30.0,
						20.0
					],
					"id": "obj-6"
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
						116.0,
						21.0,
						50.0,
						20.0
					],
					"id": "obj-7",
					"hint": "The random seed: the same seed, chorales, settings and taste always give the same piece. Changing it composes at once (once chorales are loaded).",
					"annotation": "The random seed: the same seed, chorales, settings and taste always give the same piece. Changing it composes at once (once chorales are loaded).",
					"annotation_name": "seed"
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
					"id": "obj-8"
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
						860.0,
						300.0,
						44.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						170.0,
						21.0,
						44.0,
						20.0
					],
					"id": "obj-9",
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
					"id": "obj-10"
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
						1000.0,
						300.0,
						93.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						218.0,
						21.0,
						76.0,
						20.0
					],
					"id": "obj-11",
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
					"id": "obj-12"
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
					"id": "obj-13"
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
					"id": "obj-14"
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
					"id": "obj-15"
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
						100.0,
						65.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						6.0,
						47.0,
						76.0,
						20.0
					],
					"id": "obj-16",
					"hint": "Open the corpus window: the folders of chorales (MIDI files) to compose from, each switched on or off. Composing uses every folder that is on, as one corpus; they are loaded by themselves next time.",
					"annotation": "Open the corpus window: the folders of chorales (MIDI files) to compose from, each switched on or off. Composing uses every folder that is on, as one corpus; they are loaded by themselves next time.",
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
						135.0,
						110.0,
						22.0
					],
					"id": "obj-17"
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
						135.0,
						230.0,
						34.0
					],
					"id": "obj-18"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "beats",
					"numinlets": 1,
					"numoutlets": 0,
					"fontsize": 10.0,
					"patching_rect": [
						540.0,
						70.0,
						40.0,
						20.0
					],
					"presentation": 1,
					"presentation_rect": [
						86.0,
						48.0,
						34.0,
						20.0
					],
					"id": "obj-19"
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
						100.0,
						56.0,
						15.0
					],
					"presentation": 1,
					"presentation_rect": [
						120.0,
						47.0,
						46.0,
						20.0
					],
					"id": "obj-20",
					"hint": "The shortest piece to compose, in beats (4 to 256). With chorale form on, only chorales at least this long lend their form.",
					"annotation": "The shortest piece to compose, in beats (4 to 256). With chorale form on, only chorales at least this long lend their form.",
					"annotation_name": "beats"
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
						135.0,
						95.0,
						22.0
					],
					"id": "obj-21"
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
					"text": "chorale form",
					"texton": "chorale form",
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
						100.0,
						100.0,
						20.0
					],
					"presentation": 1,
					"presentation_rect": [
						170.0,
						47.0,
						124.0,
						20.0
					],
					"id": "obj-22",
					"hint": "On: each piece takes the form of a real chorale: its phrases and cadences fall in the same places. Off: beats are joined freely, with no phrase plan.",
					"annotation": "On: each piece takes the form of a real chorale: its phrases and cadences fall in the same places. Off: beats are joined freely, with no phrase plan.",
					"annotation_name": "chorale form"
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
						135.0,
						90.0,
						22.0
					],
					"id": "obj-23"
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
						71.0,
						52.0,
						20.0
					],
					"id": "obj-24",
					"hint": "On: compose starts a stream, composed a phrase at a time while it plays, for as many phrases as phrases says. Off: compose makes a whole piece.",
					"annotation": "On: compose starts a stream, composed a phrase at a time while it plays, for as many phrases as phrases says. Off: compose makes a whole piece.",
					"annotation_name": "stream"
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
					"id": "obj-25"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "phrases",
					"numinlets": 1,
					"numoutlets": 0,
					"fontsize": 10.0,
					"patching_rect": [
						140.0,
						440.0,
						50.0,
						20.0
					],
					"presentation": 1,
					"presentation_rect": [
						60.0,
						72.0,
						44.0,
						20.0
					],
					"id": "obj-26"
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
						104.0,
						71.0,
						30.0,
						20.0
					],
					"id": "obj-27",
					"hint": "How many phrases a stream plays before it ends (0: endless).",
					"annotation": "How many phrases a stream plays before it ends (0: endless).",
					"annotation_name": "phrases"
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
					"id": "obj-28"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "transpose",
					"numinlets": 1,
					"numoutlets": 0,
					"fontsize": 10.0,
					"patching_rect": [
						270.0,
						440.0,
						60.0,
						20.0
					],
					"presentation": 1,
					"presentation_rect": [
						138.0,
						72.0,
						54.0,
						20.0
					],
					"id": "obj-29"
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
						192.0,
						71.0,
						32.0,
						20.0
					],
					"id": "obj-30",
					"hint": "Transpose the music by semitones (-12 to 12): a piece at once, a stream from its next phrase.",
					"annotation": "Transpose the music by semitones (-12 to 12): a piece at once, a stream from its next phrase.",
					"annotation_name": "transpose"
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
					"id": "obj-31"
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
					"id": "obj-32"
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
					"text": "signatures",
					"texton": "signatures",
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
						228.0,
						71.0,
						66.0,
						20.0
					],
					"id": "obj-33",
					"hint": "On: Bach's signatures (cadence formulas found in several chorales) are kept whole at cadences, shown as gold bands in the piano roll. Off: cadences are recombined like any other beats.",
					"annotation": "On: Bach's signatures (cadence formulas found in several chorales) are kept whole at cadences, shown as gold bands in the piano roll. Off: cadences are recombined like any other beats.",
					"annotation_name": "signatures"
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
					"id": "obj-34"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "signatures: keep Bach's cadence formulas whole at cadences",
					"numinlets": 1,
					"numoutlets": 0,
					"linecount": 2,
					"patching_rect": [
						870.0,
						470.0,
						250.0,
						34.0
					],
					"id": "obj-35"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "listening test\u2026",
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
						1180.0,
						100.0,
						121.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						6.0,
						145.0,
						110.0,
						20.0
					],
					"id": "obj-36",
					"hint": "Write a blind listening test: a web page of 10 pairs, each a Bach chorale and a piece composed in its form, in random order. Can listeners tell which is Bach?",
					"annotation": "Write a blind listening test: a web page of 10 pairs, each a Bach chorale and a piece composed in its form, in random order. Can listeners tell which is Bach?",
					"annotation_name": "listening test"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "route listening",
					"numinlets": 2,
					"numoutlets": 2,
					"outlettype": [
						"",
						""
					],
					"patching_rect": [
						1180.0,
						130.0,
						80.0,
						22.0
					],
					"id": "obj-37"
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
						160.0,
						35.0,
						22.0
					],
					"id": "obj-38"
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
						190.0,
						110.0,
						22.0
					],
					"id": "obj-39"
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
						220.0,
						120.0,
						22.0
					],
					"id": "obj-40"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "listening test: a blind A/B test (a web page) of the corpus in use",
					"numinlets": 1,
					"numoutlets": 0,
					"linecount": 2,
					"patching_rect": [
						1180.0,
						260.0,
						200.0,
						34.0
					],
					"id": "obj-41"
				}
			},
			{
				"box": {
					"maxclass": "umenu",
					"numinlets": 1,
					"numoutlets": 3,
					"outlettype": [
						"int",
						"",
						""
					],
					"parameter_enable": 0,
					"varname": "Tools",
					"items": [
						"tools",
						",",
						"load a chorale (in C or A minor)\u2026",
						",",
						"load a chorale (in its own key)\u2026",
						",",
						"play the test phrase",
						",",
						"stop and clear the queue"
					],
					"patching_rect": [
						20.0,
						250.0,
						80.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						120.0,
						145.0,
						80.0,
						20.0
					],
					"id": "obj-42",
					"hint": "Less-used tools. Load a chorale: one chorale (a MIDI file) plays as written and is drawn in the piano roll, moved to C major or A minor, or in its own key. Play the test phrase: a built-in phrase (no chorales needed), to check that the voices sound. Stop and clear the queue: what is playing stops at once.",
					"annotation": "Less-used tools. Load a chorale: one chorale (a MIDI file) plays as written and is drawn in the piano roll, moved to C major or A minor, or in its own key. Play the test phrase: a built-in phrase (no chorales needed), to check that the voices sound. Stop and clear the queue: what is playing stops at once.",
					"annotation_name": "tools"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "t b i",
					"numinlets": 1,
					"numoutlets": 2,
					"outlettype": [
						"bang",
						"int"
					],
					"patching_rect": [
						20.0,
						285.0,
						45.0,
						22.0
					],
					"id": "obj-43"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "set 0",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						20.0,
						320.0,
						45.0,
						22.0
					],
					"id": "obj-44"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "sel 1 2 3 4",
					"numinlets": 1,
					"numoutlets": 5,
					"outlettype": [
						"bang",
						"bang",
						"bang",
						"bang",
						""
					],
					"patching_rect": [
						80.0,
						320.0,
						90.0,
						22.0
					],
					"id": "obj-45"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "t b b",
					"numinlets": 1,
					"numoutlets": 2,
					"outlettype": [
						"bang",
						"bang"
					],
					"patching_rect": [
						80.0,
						355.0,
						45.0,
						22.0
					],
					"id": "obj-46"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "key 0",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						130.0,
						390.0,
						45.0,
						22.0
					],
					"id": "obj-47"
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
						80.0,
						390.0,
						75.0,
						22.0
					],
					"id": "obj-48"
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
						80.0,
						425.0,
						110.0,
						22.0
					],
					"id": "obj-49"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "t b b",
					"numinlets": 1,
					"numoutlets": 2,
					"outlettype": [
						"bang",
						"bang"
					],
					"patching_rect": [
						220.0,
						355.0,
						45.0,
						22.0
					],
					"id": "obj-50"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "key 1",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						270.0,
						390.0,
						45.0,
						22.0
					],
					"id": "obj-51"
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
						220.0,
						390.0,
						75.0,
						22.0
					],
					"id": "obj-52"
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
						220.0,
						425.0,
						110.0,
						22.0
					],
					"id": "obj-53"
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
						360.0,
						355.0,
						55.0,
						22.0
					],
					"id": "obj-54"
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
						430.0,
						355.0,
						55.0,
						22.0
					],
					"id": "obj-55"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "tools: then back to its title; a chorale loads in C (key 0) or its own key (key 1)",
					"numinlets": 1,
					"numoutlets": 0,
					"linecount": 2,
					"patching_rect": [
						360.0,
						390.0,
						260.0,
						34.0
					],
					"id": "obj-56"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "hover for help",
					"numinlets": 1,
					"numoutlets": 0,
					"fontsize": 10.0,
					"textcolor": [
						0.55,
						0.55,
						0.55,
						1.0
					],
					"patching_rect": [
						1180.0,
						300.0,
						100.0,
						20.0
					],
					"presentation": 1,
					"presentation_rect": [
						204.0,
						147.0,
						90.0,
						18.0
					],
					"id": "obj-57"
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
					"id": "obj-58"
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
					"id": "obj-59"
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
					"id": "obj-60"
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
						52.0
					],
					"presentation": 1,
					"presentation_rect": [
						6.0,
						95.0,
						288.0,
						46.0
					],
					"id": "obj-61",
					"hint": "What the engine just did, or what went wrong.",
					"annotation": "What the engine just did, or what went wrong.",
					"annotation_name": "Status"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "route seed beats form stream phrases transpose sigs",
					"numinlets": 2,
					"numoutlets": 8,
					"outlettype": [
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
						330.0,
						22.0
					],
					"id": "obj-62"
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
					"id": "obj-63"
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
					"id": "obj-64"
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
					"id": "obj-65"
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
					"id": "obj-66"
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
					"id": "obj-67"
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
					"id": "obj-68"
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
					"id": "obj-69"
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
					"id": "obj-70"
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
						"obj-3",
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
						"obj-28",
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
						"obj-3",
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
						"obj-38",
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
						"obj-40",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-40",
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
						"obj-42",
						0
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
						"obj-42",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-43",
						1
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
						"obj-46",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-46",
						1
					],
					"destination": [
						"obj-47",
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
						"obj-3",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-46",
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
						"obj-49",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-49",
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
						"obj-45",
						1
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
						1
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
						"obj-51",
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
						"obj-50",
						0
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
						"obj-53",
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
						"obj-45",
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
						"obj-3",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-45",
						3
					],
					"destination": [
						"obj-55",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-55",
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
						"obj-59",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-58",
						1
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
						"obj-59",
						0
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
						"obj-60",
						0
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
						"obj-58",
						2
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
						"obj-64",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-64",
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
						"obj-62",
						1
					],
					"destination": [
						"obj-65",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-65",
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
						"obj-62",
						2
					],
					"destination": [
						"obj-66",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-66",
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
						"obj-62",
						3
					],
					"destination": [
						"obj-67",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-67",
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
						"obj-62",
						4
					],
					"destination": [
						"obj-68",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-68",
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
						"obj-62",
						5
					],
					"destination": [
						"obj-69",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-69",
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
						"obj-62",
						6
					],
					"destination": [
						"obj-70",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-70",
						0
					],
					"destination": [
						"obj-33",
						0
					]
				}
			}
		]
	}
}
