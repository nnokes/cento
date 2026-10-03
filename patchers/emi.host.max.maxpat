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
					"maxclass": "comment",
					"text": "emi.host.max: the Max version's adapter: transport, MIDI ports, vst~ instruments, and startup (restores the settings file). Panel 232 x 169 px.",
					"numinlets": 1,
					"numoutlets": 0,
					"patching_rect": [
						20.0,
						5.0,
						900.0,
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
					"maxclass": "comment",
					"text": "ml_midi (Max)",
					"numinlets": 1,
					"numoutlets": 0,
					"fontface": 1,
					"patching_rect": [
						20.0,
						70.0,
						110.0,
						20.0
					],
					"presentation": 1,
					"presentation_rect": [
						6.0,
						4.0,
						120.0,
						20.0
					],
					"id": "obj-4"
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
					"parameter_enable": 0,
					"varname": "Play",
					"mode": 1,
					"text": "play",
					"texton": "stop",
					"bgcolor": [
						0.3,
						0.69,
						0.36,
						1.0
					],
					"activebgcolor": [
						0.3,
						0.69,
						0.36,
						1.0
					],
					"bgoncolor": [
						0.86,
						0.29,
						0.25,
						1.0
					],
					"activebgoncolor": [
						0.86,
						0.29,
						0.25,
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
					"activetextoncolor": [
						1.0,
						1.0,
						1.0,
						1.0
					],
					"patching_rect": [
						150.0,
						70.0,
						58.0,
						20.0
					],
					"presentation": 1,
					"presentation_rect": [
						6.0,
						30.0,
						58.0,
						20.0
					],
					"id": "obj-5",
					"hint": "play (green): starts Max's transport and plays the current piece (or stream) through the output below, from the next barline; the button turns red and says stop. stop: stops the transport and silences held notes. When a piece (or a stream with a set number of phrases) ends, it stops by itself and says play again.",
					"annotation": "play (green): starts Max's transport and plays the current piece (or stream) through the output below, from the next barline; the button turns red and says stop. stop: stops the transport and silences held notes. When a piece (or a stream with a set number of phrases) ends, it stops by itself and says play again.",
					"annotation_name": "Play / stop"
				}
			},
			{
				"box": {
					"maxclass": "number",
					"numinlets": 1,
					"numoutlets": 2,
					"outlettype": [
						"",
						"bang"
					],
					"minimum": 20,
					"maximum": 300,
					"parameter_enable": 0,
					"varname": "BPM",
					"patching_rect": [
						230.0,
						70.0,
						50.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						70.0,
						30.0,
						50.0,
						20.0
					],
					"id": "obj-6",
					"hint": "Tempo in beats per minute (20 to 300) for Max's transport. Drag or type. Remembered for next time.",
					"annotation": "Tempo in beats per minute (20 to 300) for Max's transport. Drag or type. Remembered for next time.",
					"annotation_name": "Tempo"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "BPM",
					"numinlets": 1,
					"numoutlets": 0,
					"patching_rect": [
						285.0,
						70.0,
						40.0,
						20.0
					],
					"presentation": 1,
					"presentation_rect": [
						122.0,
						30.0,
						36.0,
						20.0
					],
					"id": "obj-7"
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
						330.0,
						30.0,
						70.0,
						22.0
					],
					"id": "obj-8"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "100",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						330.0,
						70.0,
						40.0,
						22.0
					],
					"id": "obj-9"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "transport",
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
						270.0,
						230.0,
						77.0,
						22.0
					],
					"id": "obj-10"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "prepend tempo",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						230.0,
						110.0,
						105.0,
						22.0
					],
					"id": "obj-11"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "sel 1 0",
					"numinlets": 1,
					"numoutlets": 3,
					"outlettype": [
						"bang",
						"bang",
						""
					],
					"patching_rect": [
						150.0,
						110.0,
						55.0,
						22.0
					],
					"id": "obj-12"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "t b b b",
					"numinlets": 1,
					"numoutlets": 3,
					"outlettype": [
						"bang",
						"bang",
						"bang"
					],
					"patching_rect": [
						100.0,
						145.0,
						60.0,
						22.0
					],
					"id": "obj-13"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "t b b b",
					"numinlets": 1,
					"numoutlets": 3,
					"outlettype": [
						"bang",
						"bang",
						"bang"
					],
					"patching_rect": [
						170.0,
						145.0,
						60.0,
						22.0
					],
					"id": "obj-14"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "play",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						60.0,
						180.0,
						40.0,
						22.0
					],
					"id": "obj-15"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "1",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						110.0,
						180.0,
						30.0,
						22.0
					],
					"id": "obj-16"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "0",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						170.0,
						180.0,
						30.0,
						22.0
					],
					"id": "obj-17"
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
						210.0,
						180.0,
						40.0,
						22.0
					],
					"id": "obj-18"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "1",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						20.0,
						180.0,
						30.0,
						22.0
					],
					"id": "obj-19"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "0",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						250.0,
						180.0,
						30.0,
						22.0
					],
					"id": "obj-20"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "0",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						380.0,
						70.0,
						30.0,
						22.0
					],
					"id": "obj-21"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "at load: transport stopped, as Play shows",
					"numinlets": 1,
					"numoutlets": 0,
					"linecount": 2,
					"patching_rect": [
						420.0,
						70.0,
						150.0,
						34.0
					],
					"id": "obj-22"
				}
			},
			{
				"box": {
					"maxclass": "ezdac~",
					"numinlets": 2,
					"numoutlets": 0,
					"outlettype": [],
					"varname": "Audio",
					"patching_rect": [
						720.0,
						70.0,
						32.0,
						32.0
					],
					"presentation": 1,
					"presentation_rect": [
						196.0,
						0.0,
						30.0,
						30.0
					],
					"id": "obj-23",
					"hint": "Audio on or off (Max's DSP). Needed only for the vst~ instruments: the MIDI output plays without it.",
					"annotation": "Audio on or off (Max's DSP). Needed only for the vst~ instruments: the MIDI output plays without it.",
					"annotation_name": "Audio"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "Output",
					"numinlets": 1,
					"numoutlets": 0,
					"patching_rect": [
						20.0,
						300.0,
						50.0,
						20.0
					],
					"presentation": 1,
					"presentation_rect": [
						6.0,
						56.0,
						46.0,
						20.0
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
						80.0,
						270.0,
						70.0,
						22.0
					],
					"id": "obj-25"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "midiinfo",
					"numinlets": 2,
					"numoutlets": 2,
					"outlettype": [
						"",
						""
					],
					"patching_rect": [
						80.0,
						300.0,
						70.0,
						22.0
					],
					"id": "obj-26"
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
					"items": [],
					"varname": "Output",
					"patching_rect": [
						80.0,
						335.0,
						170.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						52.0,
						56.0,
						174.0,
						20.0
					],
					"id": "obj-27",
					"hint": "The MIDI port the four voices go to, one channel each: 1 soprano, 2 alto, 3 tenor, 4 bass. Remembered for next time.",
					"annotation": "The MIDI port the four voices go to, one channel each: 1 soprano, 2 alto, 3 tenor, 4 bass. Remembered for next time.",
					"annotation_name": "Output"
				}
			},
			{
				"box": {
					"maxclass": "toggle",
					"numinlets": 1,
					"numoutlets": 1,
					"outlettype": [
						"int"
					],
					"parameter_enable": 0,
					"varname": "Use vst~",
					"patching_rect": [
						300.0,
						300.0,
						22.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						6.0,
						82.0,
						20.0,
						20.0
					],
					"id": "obj-28",
					"hint": "On: the voices play through four plug-in instruments inside Max (choose them with plug 1 to 4) instead of the MIDI port. Turn audio on (the speaker) to hear them. Remembered for next time.",
					"annotation": "On: the voices play through four plug-in instruments inside Max (choose them with plug 1 to 4) instead of the MIDI port. Turn audio on (the speaker) to hear them. Remembered for next time.",
					"annotation_name": "vst~ instead"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "vst~ instead",
					"numinlets": 1,
					"numoutlets": 0,
					"patching_rect": [
						325.0,
						300.0,
						90.0,
						20.0
					],
					"presentation": 1,
					"presentation_rect": [
						28.0,
						82.0,
						100.0,
						20.0
					],
					"id": "obj-29"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "+ 1",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						"int"
					],
					"patching_rect": [
						300.0,
						335.0,
						40.0,
						22.0
					],
					"id": "obj-30"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "plug 1",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						20.0,
						600.0,
						58.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						6.0,
						108.0,
						52.0,
						20.0
					],
					"id": "obj-31",
					"hint": "Choose the AU or VST3 instrument that plays voice 1 (soprano) when vst~ instead is on.",
					"annotation": "Choose the AU or VST3 instrument that plays voice 1 (soprano) when vst~ instead is on.",
					"annotation_name": "plug 1"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "open 1",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						20.0,
						630.0,
						58.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						6.0,
						134.0,
						52.0,
						20.0
					],
					"id": "obj-32",
					"hint": "Show the editor window of voice 1's (soprano) plug-in instrument.",
					"annotation": "Show the editor window of voice 1's (soprano) plug-in instrument.",
					"annotation_name": "open 1"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "plug 2",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						90.0,
						600.0,
						58.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						62.0,
						108.0,
						52.0,
						20.0
					],
					"id": "obj-33",
					"hint": "Choose the AU or VST3 instrument that plays voice 2 (alto) when vst~ instead is on.",
					"annotation": "Choose the AU or VST3 instrument that plays voice 2 (alto) when vst~ instead is on.",
					"annotation_name": "plug 2"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "open 2",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						90.0,
						630.0,
						58.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						62.0,
						134.0,
						52.0,
						20.0
					],
					"id": "obj-34",
					"hint": "Show the editor window of voice 2's (alto) plug-in instrument.",
					"annotation": "Show the editor window of voice 2's (alto) plug-in instrument.",
					"annotation_name": "open 2"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "plug 3",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						160.0,
						600.0,
						58.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						118.0,
						108.0,
						52.0,
						20.0
					],
					"id": "obj-35",
					"hint": "Choose the AU or VST3 instrument that plays voice 3 (tenor) when vst~ instead is on.",
					"annotation": "Choose the AU or VST3 instrument that plays voice 3 (tenor) when vst~ instead is on.",
					"annotation_name": "plug 3"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "open 3",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						160.0,
						630.0,
						58.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						118.0,
						134.0,
						52.0,
						20.0
					],
					"id": "obj-36",
					"hint": "Show the editor window of voice 3's (tenor) plug-in instrument.",
					"annotation": "Show the editor window of voice 3's (tenor) plug-in instrument.",
					"annotation_name": "open 3"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "plug 4",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						230.0,
						600.0,
						58.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						174.0,
						108.0,
						52.0,
						20.0
					],
					"id": "obj-37",
					"hint": "Choose the AU or VST3 instrument that plays voice 4 (bass) when vst~ instead is on.",
					"annotation": "Choose the AU or VST3 instrument that plays voice 4 (bass) when vst~ instead is on.",
					"annotation_name": "plug 4"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "open 4",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						230.0,
						630.0,
						58.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						174.0,
						134.0,
						52.0,
						20.0
					],
					"id": "obj-38",
					"hint": "Show the editor window of voice 4's (bass) plug-in instrument.",
					"annotation": "Show the editor window of voice 4's (bass) plug-in instrument.",
					"annotation_name": "open 4"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "route voice setting meter ended",
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
						400.0,
						210.0,
						22.0
					],
					"id": "obj-39"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "0",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						700.0,
						400.0,
						30.0,
						22.0
					],
					"id": "obj-40"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "ended: back to play",
					"numinlets": 1,
					"numoutlets": 0,
					"patching_rect": [
						740.0,
						400.0,
						130.0,
						20.0
					],
					"id": "obj-41"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "prepend timesig",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						420.0,
						230.0,
						100.0,
						22.0
					],
					"id": "obj-42"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "meter <n> <d> from the engine",
					"numinlets": 1,
					"numoutlets": 0,
					"patching_rect": [
						530.0,
						230.0,
						200.0,
						20.0
					],
					"id": "obj-43"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "gate 1 0",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						300.0,
						400.0,
						60.0,
						22.0
					],
					"id": "obj-44"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "voices only while Play is on",
					"numinlets": 1,
					"numoutlets": 0,
					"patching_rect": [
						230.0,
						430.0,
						170.0,
						20.0
					],
					"id": "obj-45"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "gate 2 1",
					"numinlets": 2,
					"numoutlets": 2,
					"outlettype": [
						"",
						""
					],
					"patching_rect": [
						400.0,
						400.0,
						60.0,
						22.0
					],
					"id": "obj-46"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "p midi-out",
					"numinlets": 2,
					"numoutlets": 0,
					"outlettype": [],
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
							140.0,
							140.0,
							640.0,
							360.0
						],
						"openinpresentation": 0,
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
									"maxclass": "inlet",
									"comment": "voice <n> <pitch> <velocity> (voice prefix removed)",
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
									"id": "obj-1"
								}
							},
							{
								"box": {
									"maxclass": "inlet",
									"comment": "MIDI output port name",
									"index": 2,
									"numinlets": 0,
									"numoutlets": 1,
									"outlettype": [
										""
									],
									"patching_rect": [
										400.0,
										20.0,
										30.0,
										30.0
									],
									"id": "obj-2"
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
										70.0,
										105.0,
										22.0
									],
									"id": "obj-3"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "prepend port",
									"numinlets": 2,
									"numoutlets": 1,
									"outlettype": [
										""
									],
									"patching_rect": [
										400.0,
										70.0,
										98.0,
										22.0
									],
									"id": "obj-4"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "noteout 1",
									"numinlets": 3,
									"numoutlets": 0,
									"outlettype": [],
									"patching_rect": [
										20.0,
										140.0,
										75.0,
										22.0
									],
									"id": "obj-5"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "noteout 2",
									"numinlets": 3,
									"numoutlets": 0,
									"outlettype": [],
									"patching_rect": [
										130.0,
										140.0,
										75.0,
										22.0
									],
									"id": "obj-6"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "noteout 3",
									"numinlets": 3,
									"numoutlets": 0,
									"outlettype": [],
									"patching_rect": [
										240.0,
										140.0,
										75.0,
										22.0
									],
									"id": "obj-7"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "noteout 4",
									"numinlets": 3,
									"numoutlets": 0,
									"outlettype": [],
									"patching_rect": [
										350.0,
										140.0,
										75.0,
										22.0
									],
									"id": "obj-8"
								}
							},
							{
								"box": {
									"maxclass": "comment",
									"text": "one MIDI channel per voice: 1 soprano, 2 alto, 3 tenor, 4 bass",
									"numinlets": 1,
									"numoutlets": 0,
									"patching_rect": [
										20.0,
										180.0,
										440.0,
										20.0
									],
									"id": "obj-9"
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
										"obj-4",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-3",
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
										"obj-3",
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
										"obj-4",
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
										"obj-3",
										2
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
										"obj-4",
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
										"obj-3",
										3
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
										"obj-4",
										0
									],
									"destination": [
										"obj-8",
										0
									]
								}
							}
						]
					},
					"patching_rect": [
						400.0,
						450.0,
						90.0,
						22.0
					],
					"id": "obj-47"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "p instruments",
					"numinlets": 2,
					"numoutlets": 0,
					"outlettype": [],
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
							760.0,
							460.0
						],
						"openinpresentation": 0,
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
									"maxclass": "inlet",
									"comment": "voice <n> <pitch> <velocity> (voice prefix removed)",
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
									"id": "obj-1"
								}
							},
							{
								"box": {
									"maxclass": "inlet",
									"comment": "plug <n> | open <n>",
									"index": 2,
									"numinlets": 0,
									"numoutlets": 1,
									"outlettype": [
										""
									],
									"patching_rect": [
										420.0,
										20.0,
										30.0,
										30.0
									],
									"id": "obj-2"
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
										70.0,
										105.0,
										22.0
									],
									"id": "obj-3"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "route plug open",
									"numinlets": 2,
									"numoutlets": 3,
									"outlettype": [
										"",
										"",
										""
									],
									"patching_rect": [
										420.0,
										70.0,
										119.0,
										22.0
									],
									"id": "obj-4"
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
										420.0,
										105.0,
										91.0,
										22.0
									],
									"id": "obj-5"
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
										560.0,
										105.0,
										91.0,
										22.0
									],
									"id": "obj-6"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "dac~ 1 2",
									"numinlets": 2,
									"numoutlets": 0,
									"outlettype": [],
									"patching_rect": [
										20.0,
										330.0,
										60.0,
										22.0
									],
									"id": "obj-7"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "prepend midievent 144",
									"numinlets": 2,
									"numoutlets": 1,
									"outlettype": [
										""
									],
									"patching_rect": [
										20.0,
										150.0,
										140.0,
										22.0
									],
									"id": "obj-8"
								}
							},
							{
								"box": {
									"maxclass": "message",
									"text": "plug",
									"numinlets": 2,
									"numoutlets": 1,
									"outlettype": [
										""
									],
									"patching_rect": [
										20.0,
										185.0,
										40.0,
										22.0
									],
									"id": "obj-9"
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
										70.0,
										185.0,
										40.0,
										22.0
									],
									"id": "obj-10"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "vst~ 2 2",
									"numinlets": 2,
									"numoutlets": 8,
									"outlettype": [
										"signal",
										"signal",
										"",
										"",
										"",
										"",
										"",
										""
									],
									"patching_rect": [
										20.0,
										230.0,
										60.0,
										22.0
									],
									"id": "obj-11"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "prepend midievent 144",
									"numinlets": 2,
									"numoutlets": 1,
									"outlettype": [
										""
									],
									"patching_rect": [
										200.0,
										150.0,
										140.0,
										22.0
									],
									"id": "obj-12"
								}
							},
							{
								"box": {
									"maxclass": "message",
									"text": "plug",
									"numinlets": 2,
									"numoutlets": 1,
									"outlettype": [
										""
									],
									"patching_rect": [
										200.0,
										185.0,
										40.0,
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
										250.0,
										185.0,
										40.0,
										22.0
									],
									"id": "obj-14"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "vst~ 2 2",
									"numinlets": 2,
									"numoutlets": 8,
									"outlettype": [
										"signal",
										"signal",
										"",
										"",
										"",
										"",
										"",
										""
									],
									"patching_rect": [
										200.0,
										230.0,
										60.0,
										22.0
									],
									"id": "obj-15"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "prepend midievent 144",
									"numinlets": 2,
									"numoutlets": 1,
									"outlettype": [
										""
									],
									"patching_rect": [
										380.0,
										150.0,
										140.0,
										22.0
									],
									"id": "obj-16"
								}
							},
							{
								"box": {
									"maxclass": "message",
									"text": "plug",
									"numinlets": 2,
									"numoutlets": 1,
									"outlettype": [
										""
									],
									"patching_rect": [
										380.0,
										185.0,
										40.0,
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
										430.0,
										185.0,
										40.0,
										22.0
									],
									"id": "obj-18"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "vst~ 2 2",
									"numinlets": 2,
									"numoutlets": 8,
									"outlettype": [
										"signal",
										"signal",
										"",
										"",
										"",
										"",
										"",
										""
									],
									"patching_rect": [
										380.0,
										230.0,
										60.0,
										22.0
									],
									"id": "obj-19"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "prepend midievent 144",
									"numinlets": 2,
									"numoutlets": 1,
									"outlettype": [
										""
									],
									"patching_rect": [
										560.0,
										150.0,
										140.0,
										22.0
									],
									"id": "obj-20"
								}
							},
							{
								"box": {
									"maxclass": "message",
									"text": "plug",
									"numinlets": 2,
									"numoutlets": 1,
									"outlettype": [
										""
									],
									"patching_rect": [
										560.0,
										185.0,
										40.0,
										22.0
									],
									"id": "obj-21"
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
										610.0,
										185.0,
										40.0,
										22.0
									],
									"id": "obj-22"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "vst~ 2 2",
									"numinlets": 2,
									"numoutlets": 8,
									"outlettype": [
										"signal",
										"signal",
										"",
										"",
										"",
										"",
										"",
										""
									],
									"patching_rect": [
										560.0,
										230.0,
										60.0,
										22.0
									],
									"id": "obj-23"
								}
							},
							{
								"box": {
									"maxclass": "comment",
									"text": "plug: choose an AU/VST3 instrument for that voice; open: show its editor. Note-on with velocity 0 is note-off.",
									"numinlets": 1,
									"numoutlets": 0,
									"patching_rect": [
										20.0,
										270.0,
										700.0,
										20.0
									],
									"id": "obj-24"
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
										"obj-4",
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
										"obj-5",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-4",
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
										"obj-3",
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
										"obj-11",
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
										"obj-9",
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
										"obj-9",
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
										"obj-7",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-11",
										1
									],
									"destination": [
										"obj-7",
										1
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-3",
										1
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
										"obj-15",
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
										"obj-13",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-6",
										1
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
										"obj-13",
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
										"obj-7",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-15",
										1
									],
									"destination": [
										"obj-7",
										1
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-3",
										2
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
										"obj-19",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-5",
										2
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
										2
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
										"obj-17",
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
										"obj-7",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-19",
										1
									],
									"destination": [
										"obj-7",
										1
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-3",
										3
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
										"obj-23",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-5",
										3
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
										"obj-6",
										3
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
										"obj-21",
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
										"obj-7",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-23",
										1
									],
									"destination": [
										"obj-7",
										1
									]
								}
							}
						]
					},
					"patching_rect": [
						400.0,
						670.0,
						100.0,
						22.0
					],
					"id": "obj-48"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "tosymbol",
					"numinlets": 1,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						260.0,
						370.0,
						65.0,
						22.0
					],
					"id": "obj-49"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "prepend remember bpm",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						800.0,
						470.0,
						140.0,
						22.0
					],
					"id": "obj-50"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "prepend remember output",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						950.0,
						470.0,
						140.0,
						22.0
					],
					"id": "obj-51"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "prepend remember vst",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						1100.0,
						470.0,
						140.0,
						22.0
					],
					"id": "obj-52"
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
						800.0,
						30.0,
						70.0,
						22.0
					],
					"id": "obj-53"
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
						800.0,
						65.0,
						65.0,
						22.0
					],
					"id": "obj-54"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "startup all",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						800.0,
						100.0,
						80.0,
						22.0
					],
					"id": "obj-55"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "after everything has loaded: read the settings file, restore every setting, reload the last corpus and compose",
					"numinlets": 1,
					"numoutlets": 0,
					"linecount": 2,
					"patching_rect": [
						890.0,
						100.0,
						330.0,
						34.0
					],
					"id": "obj-56"
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
						20.0,
						470.0,
						65.0,
						22.0
					],
					"id": "obj-57"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "route bpm output vst",
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
						510.0,
						140.0,
						22.0
					],
					"id": "obj-58"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "setting <name> <value> from startup: applied (deferred, so the remember it sends back never re-enters the engine)",
					"numinlets": 1,
					"numoutlets": 0,
					"linecount": 2,
					"patching_rect": [
						170.0,
						510.0,
						360.0,
						34.0
					],
					"id": "obj-59"
				}
			}
		],
		"lines": [
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
						"obj-10",
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
						"obj-12",
						1
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
						"obj-13",
						2
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
						"obj-13",
						1
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
						"obj-13",
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
						"obj-14",
						2
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
						"obj-14",
						1
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
						"obj-14",
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
						"obj-8",
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
						"obj-10",
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
			},
			{
				"patchline": {
					"source": [
						"obj-28",
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
						"obj-2",
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
						3
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
						"obj-5",
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
						"obj-10",
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
						"obj-44",
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
						"obj-44",
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
						"obj-44",
						1
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
						"obj-46",
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
						"obj-46",
						1
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
						"obj-47",
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
						"obj-48",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-27",
						1
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
						"obj-47",
						1
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
						"obj-48",
						1
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
						"obj-48",
						1
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
						"obj-48",
						1
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
						"obj-48",
						1
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
						"obj-48",
						1
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
						"obj-48",
						1
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
						"obj-48",
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
						"obj-48",
						1
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
						"obj-28",
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
						"obj-3",
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
						"obj-39",
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
						"obj-6",
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
						"obj-27",
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
						"obj-28",
						0
					]
				}
			}
		]
	}
}
