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
			40.0,
			40.0,
			1300.0,
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
						0.16,
						0.27,
						0.2,
						1.0
					],
					"bgfillcolor_type": "color",
					"bgfillcolor_color": [
						0.16,
						0.27,
						0.2,
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
						130.0,
						149.0
					],
					"id": "obj-45"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "emi.host.live: the Live version's adapter: follows Live's transport, sends voices to the cento.voice devices, writes clips, and startup (reloads the last corpus). Panel 130 x 149 px.",
					"numinlets": 1,
					"numoutlets": 0,
					"patching_rect": [
						20.0,
						5.0,
						1000.0,
						20.0
					],
					"id": "obj-1"
				}
			},
			{
				"box": {
					"maxclass": "inlet",
					"comment": "from emi.engine",
					"index": 1,
					"numinlets": 0,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						20.0,
						30.0,
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
					"maxclass": "newobj",
					"text": "live.thisdevice",
					"numinlets": 1,
					"numoutlets": 3,
					"outlettype": [
						"bang",
						"int",
						"int"
					],
					"patching_rect": [
						1100.0,
						30.0,
						119.0,
						22.0
					],
					"id": "obj-4"
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
						1100.0,
						65.0,
						50.0,
						22.0
					],
					"id": "obj-5"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "property is_playing",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						1220.0,
						100.0,
						149.0,
						22.0
					],
					"id": "obj-6"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "path live_set",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						1100.0,
						100.0,
						107.0,
						22.0
					],
					"id": "obj-7"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "live.path",
					"numinlets": 1,
					"numoutlets": 3,
					"outlettype": [
						"",
						"",
						""
					],
					"patching_rect": [
						1100.0,
						135.0,
						77.0,
						22.0
					],
					"id": "obj-8"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "live.observer",
					"numinlets": 2,
					"numoutlets": 2,
					"outlettype": [
						"",
						""
					],
					"patching_rect": [
						1180.0,
						170.0,
						105.0,
						22.0
					],
					"id": "obj-9"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "sel 0",
					"numinlets": 2,
					"numoutlets": 2,
					"outlettype": [
						"bang",
						""
					],
					"patching_rect": [
						1180.0,
						205.0,
						45.0,
						22.0
					],
					"id": "obj-10"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "stop",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						1180.0,
						275.0,
						40.0,
						22.0
					],
					"id": "obj-11"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "not play: it can arrive late",
					"numinlets": 1,
					"numoutlets": 0,
					"linecount": 2,
					"patching_rect": [
						1240.0,
						205.0,
						110.0,
						34.0
					],
					"id": "obj-12"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "deferlow",
					"numinlets": 1,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						960.0,
						65.0,
						65.0,
						22.0
					],
					"id": "obj-13"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "startup corpus",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						960.0,
						100.0,
						100.0,
						22.0
					],
					"id": "obj-14"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "reload the last corpus and compose; the controls keep the set's values",
					"numinlets": 1,
					"numoutlets": 0,
					"linecount": 2,
					"patching_rect": [
						960.0,
						170.0,
						200.0,
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
					"varname": "Write Clips",
					"mode": 0,
					"text": "write clips",
					"texton": "write clips",
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
							"parameter_longname": "Write Clips",
							"parameter_shortname": "write clips",
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
						100.0,
						60.0,
						20.0
					],
					"presentation": 1,
					"presentation_rect": [
						6.0,
						6.0,
						60.0,
						20.0
					],
					"id": "obj-16",
					"hint": "Write the current piece as MIDI clips, one per voice, in the first empty clip slot of the Soprano, Alto, Tenor and Bass tracks. Edit them in Live like any clip. Map it to a key or a MIDI note (Cmd+K or Cmd+M in Live).",
					"annotation": "Write the current piece as MIDI clips, one per voice, in the first empty clip slot of the Soprano, Alto, Tenor and Bass tracks. Edit them in Live like any clip. Map it to a key or a MIDI note (Cmd+K or Cmd+M in Live).",
					"annotation_name": "write clips"
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
					"id": "obj-17"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "writeclips",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						20.0,
						160.0,
						86.0,
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
					"varname": "Test Clips",
					"mode": 0,
					"text": "test clips",
					"texton": "test clips",
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
							"parameter_longname": "Test Clips",
							"parameter_shortname": "test clips",
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
						120.0,
						100.0,
						54.0,
						20.0
					],
					"presentation": 1,
					"presentation_rect": [
						70.0,
						6.0,
						54.0,
						20.0
					],
					"id": "obj-19",
					"hint": "Write a short test phrase as clips on the voice tracks: a quick check that the tracks are named and set up.",
					"annotation": "Write a short test phrase as clips on the voice tracks: a quick check that the tracks are named and set up.",
					"annotation_name": "test clips"
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
						120.0,
						130.0,
						35.0,
						22.0
					],
					"id": "obj-20"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "testclip",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						120.0,
						160.0,
						72.0,
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
					"varname": "Clips On Compose",
					"mode": 1,
					"text": "clips on compose",
					"texton": "clips on compose",
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
							"parameter_longname": "Clips On Compose",
							"parameter_shortname": "Clips On Compose",
							"parameter_type": 2,
							"parameter_mmax": 1,
							"parameter_initial": [
								0
							],
							"parameter_initial_enable": 1
						}
					},
					"patching_rect": [
						260.0,
						100.0,
						100.0,
						20.0
					],
					"presentation": 1,
					"presentation_rect": [
						6.0,
						32.0,
						118.0,
						20.0
					],
					"id": "obj-22",
					"hint": "On: every piece composed is also written as clips (as write clips does), so nothing you like is lost.",
					"annotation": "On: every piece composed is also written as clips (as write clips does), so nothing you like is lost.",
					"annotation_name": "clips on compose"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "prepend autoclips",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						260.0,
						135.0,
						110.0,
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
					"varname": "Play Through Voices",
					"mode": 1,
					"text": "play through voices",
					"texton": "play through voices",
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
							"parameter_longname": "Play Through Voices",
							"parameter_shortname": "Play Through Voices",
							"parameter_type": 2,
							"parameter_mmax": 1,
							"parameter_initial": [
								0
							],
							"parameter_initial_enable": 1
						}
					},
					"patching_rect": [
						850.0,
						600.0,
						100.0,
						20.0
					],
					"presentation": 1,
					"presentation_rect": [
						6.0,
						58.0,
						118.0,
						20.0
					],
					"id": "obj-24",
					"hint": "On: while Live plays, the piece plays through the cento.voice devices on the voice tracks. Turn it off to hear only clips you wrote (otherwise each note sounds twice).",
					"annotation": "On: while Live plays, the piece plays through the cento.voice devices on the voice tracks. Turn it off to hear only clips you wrote (otherwise each note sounds twice).",
					"annotation_name": "play through voices"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "t i i",
					"numinlets": 1,
					"numoutlets": 2,
					"outlettype": [
						"int",
						"int"
					],
					"patching_rect": [
						850.0,
						635.0,
						45.0,
						22.0
					],
					"id": "obj-25"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "sel 0",
					"numinlets": 2,
					"numoutlets": 2,
					"outlettype": [
						"bang",
						""
					],
					"patching_rect": [
						950.0,
						635.0,
						45.0,
						22.0
					],
					"id": "obj-26"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "Play off: stop (note-offs), then close the gate",
					"numinlets": 1,
					"numoutlets": 0,
					"patching_rect": [
						850.0,
						670.0,
						280.0,
						20.0
					],
					"id": "obj-27"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "route voice",
					"numinlets": 2,
					"numoutlets": 2,
					"outlettype": [
						"",
						""
					],
					"patching_rect": [
						20.0,
						400.0,
						80.0,
						22.0
					],
					"id": "obj-28"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "gate 1",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						20.0,
						440.0,
						50.0,
						22.0
					],
					"id": "obj-29"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "open while Play through voices is on",
					"numinlets": 1,
					"numoutlets": 0,
					"patching_rect": [
						80.0,
						440.0,
						220.0,
						20.0
					],
					"id": "obj-30"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "route 1 2 3 4",
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
						20.0,
						475.0,
						105.0,
						22.0
					],
					"id": "obj-31"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "send emi.voice.1",
					"numinlets": 1,
					"numoutlets": 0,
					"outlettype": [],
					"patching_rect": [
						20.0,
						510.0,
						105.0,
						22.0
					],
					"id": "obj-32"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "send emi.voice.2",
					"numinlets": 1,
					"numoutlets": 0,
					"outlettype": [],
					"patching_rect": [
						135.0,
						510.0,
						105.0,
						22.0
					],
					"id": "obj-33"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "send emi.voice.3",
					"numinlets": 1,
					"numoutlets": 0,
					"outlettype": [],
					"patching_rect": [
						250.0,
						510.0,
						105.0,
						22.0
					],
					"id": "obj-34"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "send emi.voice.4",
					"numinlets": 1,
					"numoutlets": 0,
					"outlettype": [],
					"patching_rect": [
						365.0,
						510.0,
						105.0,
						22.0
					],
					"id": "obj-35"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "to the cento.voice devices on the Soprano/Alto/Tenor/Bass tracks",
					"numinlets": 1,
					"numoutlets": 0,
					"patching_rect": [
						20.0,
						540.0,
						420.0,
						20.0
					],
					"id": "obj-36"
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
					"varname": "All Voices Here",
					"mode": 1,
					"text": "all voices here",
					"texton": "all voices here",
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
							"parameter_longname": "All Voices Here",
							"parameter_shortname": "All Voices Here",
							"parameter_type": 2,
							"parameter_mmax": 1,
							"parameter_initial": [
								0
							],
							"parameter_initial_enable": 1
						}
					},
					"patching_rect": [
						600.0,
						360.0,
						100.0,
						20.0
					],
					"presentation": 1,
					"presentation_rect": [
						6.0,
						84.0,
						118.0,
						20.0
					],
					"id": "obj-37",
					"hint": "On: all four voices also come out of this track, to hear the whole piece on this track's instrument.",
					"annotation": "On: all four voices also come out of this track, to hear the whole piece on this track's instrument.",
					"annotation_name": "all voices here"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "gate 1",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						600.0,
						440.0,
						50.0,
						22.0
					],
					"id": "obj-38"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "zl.slice 1",
					"numinlets": 2,
					"numoutlets": 2,
					"outlettype": [
						"",
						""
					],
					"patching_rect": [
						600.0,
						480.0,
						70.0,
						22.0
					],
					"id": "obj-39"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "midiformat",
					"numinlets": 7,
					"numoutlets": 2,
					"outlettype": [
						"int",
						""
					],
					"patching_rect": [
						600.0,
						515.0,
						75.0,
						22.0
					],
					"id": "obj-40"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "midiin",
					"numinlets": 1,
					"numoutlets": 1,
					"outlettype": [
						"int"
					],
					"patching_rect": [
						720.0,
						480.0,
						50.0,
						22.0
					],
					"id": "obj-41"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "midiout",
					"numinlets": 1,
					"numoutlets": 0,
					"outlettype": [],
					"patching_rect": [
						660.0,
						550.0,
						55.0,
						22.0
					],
					"id": "obj-42"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "track MIDI passes through",
					"numinlets": 1,
					"numoutlets": 0,
					"patching_rect": [
						780.0,
						480.0,
						170.0,
						20.0
					],
					"id": "obj-43"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "Voice tracks: Soprano, Alto, Tenor, Bass.",
					"numinlets": 1,
					"numoutlets": 0,
					"linecount": 2,
					"fontsize": 10.0,
					"textcolor": [
						0.84,
						0.84,
						0.82,
						1.0
					],
					"patching_rect": [
						20.0,
						600.0,
						160.0,
						34.0
					],
					"presentation": 1,
					"presentation_rect": [
						6.0,
						112.0,
						118.0,
						34.0
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
						1
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
						"obj-5",
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
						"obj-6",
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
						1
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
						"obj-3",
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
						1
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
						"obj-11",
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
						"obj-28",
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
						"obj-29",
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
						"obj-29",
						1
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
						"obj-31",
						1
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
						"obj-31",
						2
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
						"obj-31",
						3
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
						"obj-29",
						0
					],
					"destination": [
						"obj-38",
						1
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
						1
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
						"obj-42",
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
			}
		]
	}
}
