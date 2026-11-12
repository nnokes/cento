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
					"maxclass": "panel",
					"numinlets": 1,
					"numoutlets": 0,
					"mode": 0,
					"border": 0,
					"rounded": 0,
					"bgcolor": [
						0.15,
						0.21,
						0.31,
						1.0
					],
					"bgfillcolor_type": "color",
					"bgfillcolor_color": [
						0.15,
						0.21,
						0.31,
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
						300.0,
						149.0
					],
					"id": "obj-46"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "emi.panel: the composing controls, shared by both products (Max version and Live device), in the order you use them (GUI redesign, M12; leaner after v0.1.0): new piece first, then which chorales and how long, then streams. The less-used tools and the composer's own switches (chorale form, signatures) are in the Max version's more features window (emi.extras). Seed, bars, stream, phrases and transpose are live.* parameters: Live saves them with the set; the Max version restores them from the settings file. Panel 300 x 149 px, below the strip's row of section names.",
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
					"maxclass": "live.text",
					"numinlets": 1,
					"numoutlets": 2,
					"outlettype": [
						"",
						""
					],
					"parameter_enable": 1,
					"varname": "Next",
					"mode": 0,
					"text": "new piece",
					"texton": "new piece",
					"fontsize": 11.0,
					"bgcolor": [
						0.24,
						0.44,
						0.71,
						1.0
					],
					"activebgcolor": [
						0.24,
						0.44,
						0.71,
						1.0
					],
					"bgoncolor": [
						0.16,
						0.31,
						0.52,
						1.0
					],
					"activebgoncolor": [
						0.16,
						0.31,
						0.52,
						1.0
					],
					"textcolor": [
						1.0,
						1.0,
						1.0,
						1.0
					],
					"activetextcolor": [
						1.0,
						1.0,
						1.0,
						1.0
					],
					"textoncolor": [
						1.0,
						1.0,
						1.0,
						1.0
					],
					"activetextoncolor": [
						1.0,
						1.0,
						1.0,
						1.0
					],
					"saved_attribute_attributes": {
						"valueof": {
							"parameter_enum": [
								"off",
								"on"
							],
							"parameter_longname": "Next",
							"parameter_shortname": "new piece",
							"parameter_type": 2,
							"parameter_mmax": 1,
							"parameter_initial": [
								0
							],
							"parameter_initial_enable": 0
						}
					},
					"patching_rect": [
						660.0,
						300.0,
						74.0,
						24.0
					],
					"presentation": 1,
					"presentation_rect": [
						6.0,
						6.0,
						74.0,
						24.0
					],
					"id": "obj-4",
					"hint": "The next piece: adds 1 to the piece number and composes it. The quickest way to hear another piece. Map it to a key or a MIDI note (Cmd+K or Cmd+M in Live).",
					"annotation": "The next piece: adds 1 to the piece number and composes it. The quickest way to hear another piece. Map it to a key or a MIDI note (Cmd+K or Cmd+M in Live).",
					"annotation_name": "new piece"
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
						660.0,
						330.0,
						35.0,
						22.0
					],
					"id": "obj-5"
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
						660.0,
						360.0,
						44.0,
						22.0
					],
					"id": "obj-6"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "piece #",
					"numinlets": 1,
					"numoutlets": 0,
					"fontsize": 10.0,
					"patching_rect": [
						740.0,
						270.0,
						40.0,
						18.0
					],
					"presentation": 1,
					"presentation_rect": [
						86.0,
						9.0,
						40.0,
						18.0
					],
					"id": "obj-7",
					"textcolor": [
						0.95,
						0.95,
						0.93,
						1.0
					]
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
						126.0,
						9.0,
						44.0,
						18.0
					],
					"id": "obj-8",
					"hint": "The piece's number: the same number, chorales, settings and taste always give the same piece. Changing it composes at once (once chorales are loaded).",
					"annotation": "The piece's number: the same number, chorales, settings and taste always give the same piece. Changing it composes at once (once chorales are loaded).",
					"annotation_name": "piece #"
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
					"id": "obj-9"
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
					"varname": "Compose",
					"mode": 0,
					"text": "again",
					"texton": "again",
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
							"parameter_longname": "Compose",
							"parameter_shortname": "again",
							"parameter_type": 2,
							"parameter_mmax": 1,
							"parameter_initial": [
								0
							],
							"parameter_initial_enable": 0
						}
					},
					"patching_rect": [
						860.0,
						300.0,
						46.0,
						20.0
					],
					"presentation": 1,
					"presentation_rect": [
						176.0,
						8.0,
						46.0,
						20.0
					],
					"id": "obj-10",
					"hint": "Compose this piece number again, with the settings and Magdalena's taste as they are now (with stream on: start a stream). While playing, the new music starts at the next bar. The pop-up window has the same button. Map it to a key or a MIDI note (Cmd+K or Cmd+M in Live).",
					"annotation": "Compose this piece number again, with the settings and Magdalena's taste as they are now (with stream on: start a stream). While playing, the new music starts at the next bar. The pop-up window has the same button. Map it to a key or a MIDI note (Cmd+K or Cmd+M in Live).",
					"annotation_name": "again"
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
						860.0,
						330.0,
						35.0,
						22.0
					],
					"id": "obj-11"
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
						860.0,
						360.0,
						65.0,
						22.0
					],
					"id": "obj-12"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "piece #: composes when changed (once a corpus is loaded); again: the shown number again; new piece: number + 1",
					"numinlets": 1,
					"numoutlets": 0,
					"linecount": 2,
					"patching_rect": [
						660.0,
						400.0,
						330.0,
						34.0
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
					"varname": "Export MIDI",
					"mode": 0,
					"text": "export midi",
					"texton": "export midi",
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
							"parameter_longname": "Export MIDI",
							"parameter_shortname": "export midi",
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
						1000.0,
						300.0,
						66.0,
						20.0
					],
					"presentation": 1,
					"presentation_rect": [
						228.0,
						8.0,
						66.0,
						20.0
					],
					"id": "obj-14",
					"hint": "Save the current piece as a MIDI file. For a composed piece or stream, a .json of where every beat came from is saved next to it.",
					"annotation": "Save the current piece as a MIDI file. For a composed piece or stream, a .json of where every beat came from is saved next to it.",
					"annotation_name": "export midi"
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
						330.0,
						35.0,
						22.0
					],
					"id": "obj-15"
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
						360.0,
						110.0,
						22.0
					],
					"id": "obj-16"
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
						390.0,
						120.0,
						22.0
					],
					"id": "obj-17"
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
					"varname": "Corpora",
					"mode": 0,
					"text": "corpora",
					"texton": "corpora",
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
							"parameter_longname": "Corpora",
							"parameter_shortname": "corpora",
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
						100.0,
						76.0,
						20.0
					],
					"presentation": 1,
					"presentation_rect": [
						6.0,
						36.0,
						76.0,
						20.0
					],
					"id": "obj-18",
					"hint": "Open the corpus window: the folders of chorales (MIDI files) to compose from, each switched on or off. Composing uses every folder that is on, as one corpus; they are loaded by themselves next time.",
					"annotation": "Open the corpus window: the folders of chorales (MIDI files) to compose from, each switched on or off. Composing uses every folder that is on, as one corpus; they are loaded by themselves next time.",
					"annotation_name": "corpora"
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
						130.0,
						35.0,
						22.0
					],
					"id": "obj-19"
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
						160.0,
						110.0,
						22.0
					],
					"id": "obj-20"
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
						160.0,
						230.0,
						34.0
					],
					"id": "obj-21"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "bars",
					"numinlets": 1,
					"numoutlets": 0,
					"fontsize": 10.0,
					"patching_rect": [
						540.0,
						70.0,
						30.0,
						18.0
					],
					"presentation": 1,
					"presentation_rect": [
						90.0,
						37.0,
						30.0,
						18.0
					],
					"id": "obj-22",
					"textcolor": [
						0.95,
						0.95,
						0.93,
						1.0
					]
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
					"varname": "Bars",
					"saved_attribute_attributes": {
						"valueof": {
							"parameter_longname": "Bars",
							"parameter_shortname": "Bars",
							"parameter_type": 1,
							"parameter_mmin": 1,
							"parameter_mmax": 64,
							"parameter_initial": [
								8
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
						37.0,
						40.0,
						18.0
					],
					"id": "obj-23",
					"hint": "The shortest piece to compose, in bars (1 to 64). With chorale form on (more features), only chorales at least this long lend their form.",
					"annotation": "The shortest piece to compose, in bars (1 to 64). With chorale form on (more features), only chorales at least this long lend their form.",
					"annotation_name": "bars"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "prepend bars",
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
					"id": "obj-24"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "key",
					"numinlets": 1,
					"numoutlets": 0,
					"fontsize": 10.0,
					"patching_rect": [
						270.0,
						440.0,
						26.0,
						18.0
					],
					"presentation": 1,
					"presentation_rect": [
						166.0,
						37.0,
						26.0,
						18.0
					],
					"id": "obj-25",
					"textcolor": [
						0.95,
						0.95,
						0.93,
						1.0
					]
				}
			},
			{
				"box": {
					"maxclass": "live.menu",
					"numinlets": 1,
					"numoutlets": 3,
					"outlettype": [
						"",
						"",
						"float"
					],
					"parameter_enable": 1,
					"varname": "Key",
					"fontsize": 10.0,
					"saved_attribute_attributes": {
						"valueof": {
							"parameter_enum": [
								"chorale's key",
								"C / A minor",
								"Db / Bb minor",
								"D / B minor",
								"Eb / C minor",
								"E / C# minor",
								"F / D minor",
								"F# / D# minor",
								"G / E minor",
								"Ab / F minor",
								"A / F# minor",
								"Bb / G minor",
								"B / G# minor"
							],
							"parameter_longname": "Key",
							"parameter_shortname": "Key",
							"parameter_type": 2,
							"parameter_mmax": 12,
							"parameter_initial": [
								0
							],
							"parameter_initial_enable": 1
						}
					},
					"patching_rect": [
						270.0,
						470.0,
						100.0,
						15.0
					],
					"presentation": 1,
					"presentation_rect": [
						194.0,
						37.0,
						100.0,
						18.0
					],
					"id": "obj-26",
					"hint": "Where the music plays. chorale's key (the default): a piece in the key of the chorale whose form it takes, a stream in its first chorale's, a loaded chorale as written. Or a key signature: pieces in major play in its major key, pieces in minor in its relative minor. A piece moves at once, a stream from its next phrase.",
					"annotation": "Where the music plays. chorale's key (the default): a piece in the key of the chorale whose form it takes, a stream in its first chorale's, a loaded chorale as written. Or a key signature: pieces in major play in its major key, pieces in minor in its relative minor. A piece moves at once, a stream from its next phrase.",
					"annotation_name": "key"
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
						270.0,
						505.0,
						90.0,
						22.0
					],
					"id": "obj-27"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "bars: the shortest piece; key: where the music plays (its chorale's, or a key signature): at once for a piece, from the next phrase in a stream",
					"numinlets": 1,
					"numoutlets": 0,
					"linecount": 2,
					"patching_rect": [
						400.0,
						470.0,
						330.0,
						34.0
					],
					"id": "obj-28"
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
						62.0,
						52.0,
						20.0
					],
					"id": "obj-29",
					"hint": "On: new piece and again start a stream, composed a phrase at a time while it plays, for as many phrases as phrases says. Off: whole pieces.",
					"annotation": "On: new piece and again start a stream, composed a phrase at a time while it plays, for as many phrases as phrases says. Off: whole pieces.",
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
					"id": "obj-30"
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
						44.0,
						18.0
					],
					"presentation": 1,
					"presentation_rect": [
						64.0,
						63.0,
						44.0,
						18.0
					],
					"id": "obj-31",
					"textcolor": [
						0.95,
						0.95,
						0.93,
						1.0
					]
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
						108.0,
						63.0,
						30.0,
						18.0
					],
					"id": "obj-32",
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
					"id": "obj-33"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "stream: new piece plays phrase by phrase (phrases 0 = endless)",
					"numinlets": 1,
					"numoutlets": 0,
					"linecount": 2,
					"patching_rect": [
						400.0,
						520.0,
						330.0,
						34.0
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
						560.0,
						170.0,
						22.0
					],
					"id": "obj-35"
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
					"id": "obj-36"
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
					"id": "obj-37"
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
						88.0,
						288.0,
						55.0
					],
					"id": "obj-38",
					"hint": "What the engine just did, or what went wrong.",
					"annotation": "What the engine just did, or what went wrong.",
					"annotation_name": "Status"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "route seed bars stream phrases key",
					"numinlets": 2,
					"numoutlets": 6,
					"outlettype": [
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
						240.0,
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
						800.0,
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
						640.0,
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
						515.0,
						640.0,
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
						610.0,
						640.0,
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
						705.0,
						640.0,
						80.0,
						22.0
					],
					"id": "obj-44"
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
					"id": "obj-45"
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
						"obj-8",
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
						"obj-23",
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
						"obj-29",
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
						"obj-32",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-39",
						4
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
						"obj-26",
						0
					]
				}
			}
		]
	}
}
